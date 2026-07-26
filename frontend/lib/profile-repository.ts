import { ID, Permission, Query, Role } from 'appwrite';
import { databases } from './appwrite-client';

const DATABASE_ID = 'wedding_gallery';
const COLLECTION_ID = 'profiles';

export type Profile = {
  userId: string;
  fullName: string;
  deviceId: string;
  photoCount: number;
};

export async function findProfileByUserId(userId: string): Promise<Profile | null> {
  const result = await databases.listDocuments({
    databaseId: DATABASE_ID,
    collectionId: COLLECTION_ID,
    queries: [Query.equal('userId', userId), Query.limit(1)],
  });

  if (result.documents.length === 0) {
    return null;
  }

  return result.documents[0] as unknown as Profile;
}

export async function createProfile(
  userId: string,
  fullName: string,
  deviceId: string,
): Promise<Profile> {
  const document = await databases.createDocument({
    databaseId: DATABASE_ID,
    collectionId: COLLECTION_ID,
    documentId: ID.unique(),
    data: { userId, fullName, deviceId, photoCount: 0 },
    permissions: [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))],
  });

  return document as unknown as Profile;
}
