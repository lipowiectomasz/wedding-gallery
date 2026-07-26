import { ExecutionMethod, ID, Permission, Role } from 'appwrite';
import { functions, storage } from './appwrite-client';
import { getCurrentUser } from './current-user';

const BUCKET_ID = 'event-photos';
const UPLOAD_PHOTO_FUNCTION_ID = 'upload-photo';

export type UploadPhotoResult =
  { status: 'created' } | { status: 'limit_reached' } | { status: 'error' };

export async function uploadPhoto(
  file: File,
  uploaderName: string,
  deviceId: string,
): Promise<UploadPhotoResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: 'error' };
  }

  const uploadedFile = await storage.createFile({
    bucketId: BUCKET_ID,
    fileId: ID.unique(),
    file,
    permissions: [Permission.read(Role.users()), Permission.delete(Role.user(user.$id))],
  });

  try {
    const execution = await functions.createExecution({
      functionId: UPLOAD_PHOTO_FUNCTION_ID,
      body: JSON.stringify({ fileId: uploadedFile.$id, uploaderName, deviceId }),
      method: ExecutionMethod.POST,
    });

    if (execution.responseStatusCode === 201) {
      return { status: 'created' };
    }

    await storage.deleteFile({ bucketId: BUCKET_ID, fileId: uploadedFile.$id });

    if (execution.responseStatusCode === 409) {
      return { status: 'limit_reached' };
    }

    return { status: 'error' };
  } catch {
    await storage.deleteFile({ bucketId: BUCKET_ID, fileId: uploadedFile.$id });
    return { status: 'error' };
  }
}
