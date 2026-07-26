import { describe, expect, it } from 'vitest';
import { InvalidRequestError, parseUploadRequest } from './parse-request';

function validBody(): Record<string, unknown> {
  return {
    fileId: 'file-1',
    uploaderId: 'uploader-1',
    uploaderName: 'Jan Kowalski',
    deviceId: 'device-1',
  };
}

describe('parseUploadRequest', () => {
  it('returns the parsed fields when the body is valid', () => {
    expect(parseUploadRequest(validBody())).toEqual(validBody());
  });

  it.each(['fileId', 'uploaderId', 'uploaderName', 'deviceId'])(
    'throws InvalidRequestError when %s is missing',
    (field) => {
      const body = validBody();
      delete body[field];
      expect(() => parseUploadRequest(body)).toThrow(InvalidRequestError);
    },
  );

  it('throws InvalidRequestError when a field is an empty string', () => {
    const body = { ...validBody(), deviceId: '' };
    expect(() => parseUploadRequest(body)).toThrow(InvalidRequestError);
  });

  it('throws InvalidRequestError when a field has the wrong type', () => {
    const body = { ...validBody(), fileId: 42 };
    expect(() => parseUploadRequest(body)).toThrow(InvalidRequestError);
  });
});
