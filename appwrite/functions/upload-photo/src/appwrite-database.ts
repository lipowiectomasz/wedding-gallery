import { AppwriteException, Databases, ID, Query } from 'node-appwrite';
import { DocumentConflictError } from './types.ts';
import type { PhotoDocument } from './types.ts';

const DATABASE_ID = 'wedding_gallery';
const COLLECTION_ID = 'photos';

export function countPhotosForDeviceWith(databases: Databases) {
  return async (deviceId: string): Promise<number> => {
    const result = await databases.listDocuments({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      queries: [Query.equal('deviceId', deviceId), Query.limit(1)],
      total: true,
    });
    return result.total;
  };
}

export function createPhotoDocumentWith(databases: Databases) {
  return async (document: PhotoDocument): Promise<void> => {
    try {
      await databases.createDocument({
        databaseId: DATABASE_ID,
        collectionId: COLLECTION_ID,
        documentId: ID.unique(),
        data: document,
      });
    } catch (error) {
      if (error instanceof AppwriteException && error.type === 'document_already_exists') {
        throw new DocumentConflictError();
      }
      throw error;
    }
  };
}
