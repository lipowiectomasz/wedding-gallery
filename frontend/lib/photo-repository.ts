import { Query } from 'appwrite';
import { databases, storage } from './appwrite-client';

const DATABASE_ID = 'wedding_gallery';
const COLLECTION_ID = 'photos';
const BUCKET_ID = 'event-photos';

export type Photo = {
  fileId: string;
  uploaderId: string;
  uploaderName: string;
  createdAt: string;
};

export async function countPhotosForUploader(uploaderId: string): Promise<number> {
  const result = await databases.listDocuments({
    databaseId: DATABASE_ID,
    collectionId: COLLECTION_ID,
    queries: [Query.equal('uploaderId', uploaderId), Query.limit(1)],
  });

  return result.total;
}

export type PhotosPage = {
  photos: Photo[];
  nextCursor: string | null;
};

const LIST_PHOTOS_PAGE_SIZE = 100;

export async function listPhotos(cursor: string | null = null): Promise<PhotosPage> {
  const queries = [Query.orderDesc('$createdAt'), Query.limit(LIST_PHOTOS_PAGE_SIZE)];
  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  const result = await databases.listDocuments({
    databaseId: DATABASE_ID,
    collectionId: COLLECTION_ID,
    queries,
  });

  const photos = result.documents.map((document) => ({
    fileId: document.fileId,
    uploaderId: document.uploaderId,
    uploaderName: document.uploaderName,
    createdAt: document.$createdAt,
  })) as Photo[];

  const nextCursor =
    result.documents.length === LIST_PHOTOS_PAGE_SIZE
      ? result.documents[result.documents.length - 1].$id
      : null;

  return { photos, nextCursor };
}

export function getPhotoThumbnailUrl(fileId: string): string {
  return storage.getFilePreview({ bucketId: BUCKET_ID, fileId, width: 480, height: 480 });
}

export function getPhotoLightboxUrl(fileId: string): string {
  return storage.getFilePreview({ bucketId: BUCKET_ID, fileId, width: 1200 });
}
