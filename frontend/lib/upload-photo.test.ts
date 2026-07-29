import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadPhoto } from './upload-photo';
import { functions, storage } from './appwrite-client';
import { getCurrentUser } from './current-user';

vi.mock('./appwrite-client', () => ({
  storage: {
    createFile: vi.fn(),
    deleteFile: vi.fn(),
  },
  functions: {
    createExecution: vi.fn(),
  },
}));

vi.mock('./current-user', () => ({
  getCurrentUser: vi.fn(),
}));

const testFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

describe('uploadPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ $id: 'user-1' } as never);
    vi.mocked(storage.createFile).mockResolvedValue({ $id: 'file-1' } as never);
  });

  it('returns error without uploading when there is no active session', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await uploadPhoto(testFile, 'Jan Kowalski', 'device-1');

    expect(result).toEqual({ status: 'error' });
    expect(storage.createFile).not.toHaveBeenCalled();
  });

  it('returns created when the function responds with 201', async () => {
    vi.mocked(functions.createExecution).mockResolvedValue({
      responseStatusCode: 201,
    } as never);

    const result = await uploadPhoto(testFile, 'Jan Kowalski', 'device-1');

    expect(result).toEqual({ status: 'created' });
    expect(storage.deleteFile).not.toHaveBeenCalled();
  });

  it('sends the file name and size alongside the upload metadata', async () => {
    vi.mocked(functions.createExecution).mockResolvedValue({
      responseStatusCode: 201,
    } as never);

    await uploadPhoto(testFile, 'Jan Kowalski', 'device-1');

    expect(functions.createExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        body: JSON.stringify({
          fileId: 'file-1',
          uploaderName: 'Jan Kowalski',
          deviceId: 'device-1',
          fileName: 'photo.jpg',
          fileSize: testFile.size,
        }),
      }),
    );
  });

  it('deletes the uploaded file and returns limit_reached on 409 without a duplicate marker', async () => {
    vi.mocked(functions.createExecution).mockResolvedValue({
      responseStatusCode: 409,
      responseBody: JSON.stringify({ error: 'photo_limit_reached' }),
    } as never);

    const result = await uploadPhoto(testFile, 'Jan Kowalski', 'device-1');

    expect(result).toEqual({ status: 'limit_reached' });
    expect(storage.deleteFile).toHaveBeenCalledWith(expect.objectContaining({ fileId: 'file-1' }));
  });

  it('deletes the uploaded file and returns duplicate on 409 with a duplicate marker', async () => {
    vi.mocked(functions.createExecution).mockResolvedValue({
      responseStatusCode: 409,
      responseBody: JSON.stringify({ error: 'photo_duplicate' }),
    } as never);

    const result = await uploadPhoto(testFile, 'Jan Kowalski', 'device-1');

    expect(result).toEqual({ status: 'duplicate' });
    expect(storage.deleteFile).toHaveBeenCalledWith(expect.objectContaining({ fileId: 'file-1' }));
  });

  it('deletes the uploaded file and returns error on other status codes', async () => {
    vi.mocked(functions.createExecution).mockResolvedValue({
      responseStatusCode: 500,
    } as never);

    const result = await uploadPhoto(testFile, 'Jan Kowalski', 'device-1');

    expect(result).toEqual({ status: 'error' });
    expect(storage.deleteFile).toHaveBeenCalled();
  });

  it('deletes the uploaded file and returns error when the execution call throws', async () => {
    vi.mocked(functions.createExecution).mockRejectedValue(new Error('network error'));

    const result = await uploadPhoto(testFile, 'Jan Kowalski', 'device-1');

    expect(result).toEqual({ status: 'error' });
    expect(storage.deleteFile).toHaveBeenCalled();
  });

  it('still resolves with an error result when deleting the orphaned file itself fails', async () => {
    vi.mocked(functions.createExecution).mockResolvedValue({
      responseStatusCode: 409,
    } as never);
    vi.mocked(storage.deleteFile).mockRejectedValue(new Error('missing scope'));

    const result = await uploadPhoto(testFile, 'Jan Kowalski', 'device-1');

    expect(result).toEqual({ status: 'limit_reached' });
  });

  it('forwards upload progress to the onProgress callback', async () => {
    vi.mocked(functions.createExecution).mockResolvedValue({
      responseStatusCode: 201,
    } as never);
    vi.mocked(storage.createFile).mockImplementation(async (params) => {
      (params as { onProgress?: (event: { progress: number }) => void }).onProgress?.({
        progress: 42,
      });
      return { $id: 'file-1' } as never;
    });

    const onProgress = vi.fn();
    await uploadPhoto(testFile, 'Jan Kowalski', 'device-1', onProgress);

    expect(onProgress).toHaveBeenCalledWith(42);
  });
});
