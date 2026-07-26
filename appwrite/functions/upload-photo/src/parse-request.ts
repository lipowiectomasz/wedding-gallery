import type { PhotoDocument } from './types.ts';

export class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function parseUploadRequest(
  body: Record<string, unknown>,
): Omit<PhotoDocument, 'seq' | 'uploaderId'> {
  const { fileId, uploaderName, deviceId } = body;

  if (typeof fileId !== 'string' || fileId.length === 0) {
    throw new InvalidRequestError('fileId is required');
  }
  if (typeof uploaderName !== 'string' || uploaderName.length === 0) {
    throw new InvalidRequestError('uploaderName is required');
  }
  if (typeof deviceId !== 'string' || deviceId.length === 0) {
    throw new InvalidRequestError('deviceId is required');
  }

  return { fileId, uploaderName, deviceId };
}
