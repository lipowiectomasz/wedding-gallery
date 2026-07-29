import { describe, expect, it } from 'vitest';
import { createPhotoWithLimit } from './create-photo';
import { DocumentConflictError } from './types';
import type { CreatePhotoResult, PhotoDocument } from './types';

function createFakeDatabase() {
  const documents: PhotoDocument[] = [];

  const countPhotosForUploader = async (uploaderId: string): Promise<number> => {
    return documents.filter((document) => document.uploaderId === uploaderId).length;
  };

  const createPhotoDocument = async (document: PhotoDocument): Promise<void> => {
    const conflict = documents.some(
      (existing) => existing.uploaderId === document.uploaderId && existing.seq === document.seq,
    );
    if (conflict) {
      throw new DocumentConflictError();
    }
    documents.push(document);
  };

  return { documents, countPhotosForUploader, createPhotoDocument };
}

function baseInput(uploaderId: string): Omit<PhotoDocument, 'seq'> {
  return {
    fileId: `file-${uploaderId}`,
    uploaderId,
    uploaderName: 'Jan Kowalski',
    deviceId: 'device-1',
  };
}

describe('createPhotoWithLimit', () => {
  it('creates a document with the next available seq', async () => {
    const { documents, countPhotosForUploader, createPhotoDocument } = createFakeDatabase();

    const result = await createPhotoWithLimit(
      baseInput('uploader-1'),
      countPhotosForUploader,
      createPhotoDocument,
    );

    expect(result).toEqual({ status: 'created', seq: '01' });
    expect(documents).toHaveLength(1);
  });

  it('returns limit_reached without writing once the uploader already has 20 photos', async () => {
    const { documents, countPhotosForUploader, createPhotoDocument } = createFakeDatabase();
    for (let value = 1; value <= 20; value += 1) {
      documents.push({ ...baseInput('uploader-1'), seq: value.toString().padStart(2, '0') });
    }

    const result = await createPhotoWithLimit(
      baseInput('uploader-1'),
      countPhotosForUploader,
      createPhotoDocument,
    );

    expect(result).toEqual({ status: 'limit_reached' });
    expect(documents).toHaveLength(20);
  });

  it('retries on a seq conflict and succeeds with the next candidate', async () => {
    const { documents, countPhotosForUploader, createPhotoDocument } = createFakeDatabase();
    documents.push({ ...baseInput('uploader-1'), seq: '01' });

    const result = await createPhotoWithLimit(
      baseInput('uploader-1'),
      countPhotosForUploader,
      createPhotoDocument,
    );

    expect(result).toEqual({ status: 'created', seq: '02' });
  });

  it('propagates errors that are not seq conflicts', async () => {
    const { countPhotosForUploader } = createFakeDatabase();
    const failingCreate = async (): Promise<void> => {
      throw new Error('network_error');
    };

    await expect(
      createPhotoWithLimit(baseInput('uploader-1'), countPhotosForUploader, failingCreate),
    ).rejects.toThrow('network_error');
  });

  it('never allows more than 20 documents for one uploader under concurrent uploads', async () => {
    const { documents, countPhotosForUploader, createPhotoDocument } = createFakeDatabase();
    const uploaderId = 'uploader-concurrent';

    const uploadAttempts = Array.from({ length: 30 }, (_, index) =>
      createPhotoWithLimit(
        { ...baseInput(uploaderId), fileId: `file-${index}` },
        countPhotosForUploader,
        createPhotoDocument,
      ),
    );

    const results: CreatePhotoResult[] = await Promise.all(uploadAttempts);

    const createdResults = results.filter((result) => result.status === 'created');
    const limitReachedResults = results.filter((result) => result.status === 'limit_reached');
    const uploaderDocuments = documents.filter((document) => document.uploaderId === uploaderId);
    const uniqueSeqs = new Set(uploaderDocuments.map((document) => document.seq));

    expect(uploaderDocuments).toHaveLength(20);
    expect(uniqueSeqs.size).toBe(20);
    expect(createdResults).toHaveLength(20);
    expect(limitReachedResults).toHaveLength(10);
  });
});
