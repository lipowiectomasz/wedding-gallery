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

export async function countPhotosForDevice(deviceId: string): Promise<number> {
  const result = await databases.listDocuments({
    databaseId: DATABASE_ID,
    collectionId: COLLECTION_ID,
    queries: [Query.equal('deviceId', deviceId), Query.limit(1)],
  });

  return result.total;
}

export async function listPhotos(): Promise<Photo[]> {
  const result = await databases.listDocuments({
    databaseId: DATABASE_ID,
    collectionId: COLLECTION_ID,
    queries: [Query.orderDesc('$createdAt'), Query.limit(100)],
  });

  return result.documents.map((document) => ({
    fileId: document.fileId,
    uploaderId: document.uploaderId,
    uploaderName: document.uploaderName,
    createdAt: document.$createdAt,
  })) as Photo[];
}

export function getPhotoThumbnailUrl(fileId: string): string {
  return storage.getFilePreview({ bucketId: BUCKET_ID, fileId, width: 480, height: 480 });
}

export function getPhotoFullUrl(fileId: string): string {
  return storage.getFileView({ bucketId: BUCKET_ID, fileId });
}
