import { describe, expect, it } from 'vitest';
import { validatePhotoFile } from './validate-photo-file';

function fileOfSize(bytes: number): File {
  return new File([new Uint8Array(bytes)], 'photo.jpg', { type: 'image/jpeg' });
}

describe('validatePhotoFile', () => {
  it('returns null for a file within the size limit', () => {
    expect(validatePhotoFile(fileOfSize(5 * 1024 * 1024))).toBeNull();
  });

  it('returns null for a file exactly at the size limit', () => {
    expect(validatePhotoFile(fileOfSize(15 * 1024 * 1024))).toBeNull();
  });

  it('returns an error message for a file over the size limit', () => {
    const error = validatePhotoFile(fileOfSize(16 * 1024 * 1024));

    expect(error).toContain('za duży');
    expect(error).toContain('16 MB');
  });
});
