import { describe, expect, it } from 'vitest';
import { createPhotoWithLimit } from './create-photo';
import { DocumentConflictError } from './types';
import type { CreatePhotoResult, PhotoDocument } from './types';

function createFakeDatabase() {
  const documents: PhotoDocument[] = [];

  const countPhotosForDevice = async (deviceId: string): Promise<number> => {
    return documents.filter((document) => document.deviceId === deviceId).length;
  };

  const createPhotoDocument = async (document: PhotoDocument): Promise<void> => {
    const conflict = documents.some(
      (existing) => existing.deviceId === document.deviceId && existing.seq === document.seq,
    );
    if (conflict) {
      throw new DocumentConflictError();
    }
    documents.push(document);
  };

  return { documents, countPhotosForDevice, createPhotoDocument };
}

function baseInput(deviceId: string): Omit<PhotoDocument, 'seq'> {
  return {
    fileId: `file-${deviceId}`,
    uploaderId: 'uploader-1',
    uploaderName: 'Jan Kowalski',
    deviceId,
  };
}

describe('createPhotoWithLimit', () => {
  it('creates a document with the next available seq', async () => {
    const { documents, countPhotosForDevice, createPhotoDocument } = createFakeDatabase();

    const result = await createPhotoWithLimit(
      baseInput('device-1'),
      countPhotosForDevice,
      createPhotoDocument,
    );

    expect(result).toEqual({ status: 'created', seq: '01' });
    expect(documents).toHaveLength(1);
  });

  it('returns limit_reached without writing once the device already has 20 photos', async () => {
    const { documents, countPhotosForDevice, createPhotoDocument } = createFakeDatabase();
    for (let value = 1; value <= 20; value += 1) {
      documents.push({ ...baseInput('device-1'), seq: value.toString().padStart(2, '0') });
    }

    const result = await createPhotoWithLimit(
      baseInput('device-1'),
      countPhotosForDevice,
      createPhotoDocument,
    );

    expect(result).toEqual({ status: 'limit_reached' });
    expect(documents).toHaveLength(20);
  });

  it('retries on a seq conflict and succeeds with the next candidate', async () => {
    const { documents, countPhotosForDevice, createPhotoDocument } = createFakeDatabase();
    documents.push({ ...baseInput('device-1'), seq: '01' });

    const result = await createPhotoWithLimit(
      baseInput('device-1'),
      countPhotosForDevice,
      createPhotoDocument,
    );

    expect(result).toEqual({ status: 'created', seq: '02' });
  });

  it('propagates errors that are not seq conflicts', async () => {
    const { countPhotosForDevice } = createFakeDatabase();
    const failingCreate = async (): Promise<void> => {
      throw new Error('network_error');
    };

    await expect(
      createPhotoWithLimit(baseInput('device-1'), countPhotosForDevice, failingCreate),
    ).rejects.toThrow('network_error');
  });

  it('never allows more than 20 documents for one device under concurrent uploads', async () => {
    const { documents, countPhotosForDevice, createPhotoDocument } = createFakeDatabase();
    const deviceId = 'device-concurrent';

    const uploadAttempts = Array.from({ length: 30 }, (_, index) =>
      createPhotoWithLimit(
        { ...baseInput(deviceId), fileId: `file-${index}` },
        countPhotosForDevice,
        createPhotoDocument,
      ),
    );

    const results: CreatePhotoResult[] = await Promise.all(uploadAttempts);

    const createdResults = results.filter((result) => result.status === 'created');
    const limitReachedResults = results.filter((result) => result.status === 'limit_reached');
    const deviceDocuments = documents.filter((document) => document.deviceId === deviceId);
    const uniqueSeqs = new Set(deviceDocuments.map((document) => document.seq));

    expect(deviceDocuments).toHaveLength(20);
    expect(uniqueSeqs.size).toBe(20);
    expect(createdResults).toHaveLength(20);
    expect(limitReachedResults).toHaveLength(10);
  });
});
