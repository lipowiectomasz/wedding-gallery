import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  countPhotosForUploader,
  getPhotoLightboxUrl,
  getPhotoThumbnailUrl,
  listPhotos,
} from './photo-repository';
import { databases, storage } from './appwrite-client';

vi.mock('./appwrite-client', () => ({
  databases: {
    listDocuments: vi.fn(),
  },
  storage: {
    getFilePreview: vi.fn(),
  },
}));

describe('listPhotos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function document(fileId: string) {
    return {
      fileId,
      uploaderId: 'user-1',
      uploaderName: 'Jan Kowalski',
      $id: `doc-${fileId}`,
      $createdAt: '2026-01-01T00:00:00.000+00:00',
    };
  }

  it('maps documents to photos ordered by the query', async () => {
    vi.mocked(databases.listDocuments).mockResolvedValue({
      total: 1,
      documents: [document('file-1')],
    } as never);

    const { photos, nextCursor } = await listPhotos();

    expect(photos).toEqual([
      {
        fileId: 'file-1',
        uploaderId: 'user-1',
        uploaderName: 'Jan Kowalski',
        createdAt: '2026-01-01T00:00:00.000+00:00',
      },
    ]);
    expect(nextCursor).toBeNull();
  });

  it('returns a cursor when a full page is returned', async () => {
    const fullPage = Array.from({ length: 100 }, (_, index) => document(`file-${index}`));
    vi.mocked(databases.listDocuments).mockResolvedValue({
      total: 100,
      documents: fullPage,
    } as never);

    const { nextCursor } = await listPhotos();

    expect(nextCursor).toBe('doc-file-99');
  });

  it('passes the cursor through as a cursorAfter query', async () => {
    vi.mocked(databases.listDocuments).mockResolvedValue({
      total: 0,
      documents: [],
    } as never);

    await listPhotos('doc-file-99');

    const call = vi.mocked(databases.listDocuments).mock.calls[0][0] as unknown as {
      queries: string[];
    };
    expect(call.queries).toEqual(
      expect.arrayContaining([expect.stringContaining('doc-file-99')]),
    );
  });
});

describe('countPhotosForUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the total document count for the given uploader', async () => {
    vi.mocked(databases.listDocuments).mockResolvedValue({ total: 5, documents: [] } as never);

    const count = await countPhotosForUploader('user-1');

    expect(count).toBe(5);
  });
});

describe('getPhotoThumbnailUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests a resized preview for the given file', () => {
    vi.mocked(storage.getFilePreview).mockReturnValue('https://example.com/preview');

    const url = getPhotoThumbnailUrl('file-1');

    expect(storage.getFilePreview).toHaveBeenCalledWith(
      expect.objectContaining({ fileId: 'file-1', width: 480, height: 480 }),
    );
    expect(url).toBe('https://example.com/preview');
  });
});

describe('getPhotoLightboxUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests a larger preview for the given file', () => {
    vi.mocked(storage.getFilePreview).mockReturnValue('https://example.com/lightbox');

    const url = getPhotoLightboxUrl('file-1');

    expect(storage.getFilePreview).toHaveBeenCalledWith(
      expect.objectContaining({ fileId: 'file-1', width: 1200 }),
    );
    expect(url).toBe('https://example.com/lightbox');
  });
});
