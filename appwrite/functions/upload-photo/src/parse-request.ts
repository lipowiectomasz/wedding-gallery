import type { PhotoDocument } from './types.ts';

export class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function parseUploadRequest(body: Record<string, unknown>): Omit<PhotoDocument, 'seq'> {
  const { fileId, uploaderId, uploaderName, deviceId } = body;

  if (typeof fileId !== 'string' || fileId.length === 0) {
    throw new InvalidRequestError('fileId is required');
  }
  if (typeof uploaderId !== 'string' || uploaderId.length === 0) {
    throw new InvalidRequestError('uploaderId is required');
  }
  if (typeof uploaderName !== 'string' || uploaderName.length === 0) {
    throw new InvalidRequestError('uploaderName is required');
  }
  if (typeof deviceId !== 'string' || deviceId.length === 0) {
    throw new InvalidRequestError('deviceId is required');
  }

  return { fileId, uploaderId, uploaderName, deviceId };
}
