import { ExecutionMethod, ID, Permission, Role } from 'appwrite';
import { functions, storage } from './appwrite-client';
import { getCurrentUser } from './current-user';

const BUCKET_ID = 'event-photos';
const UPLOAD_PHOTO_FUNCTION_ID = 'upload-photo';

export type UploadPhotoResult =
  | { status: 'created' }
  | { status: 'limit_reached' }
  | { status: 'duplicate' }
  | { status: 'error' };

export async function uploadPhoto(
  file: File,
  uploaderName: string,
  deviceId: string,
  onProgress?: (progress: number) => void,
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
    onProgress: onProgress ? (event) => onProgress(event.progress) : undefined,
  });

  async function deleteUploadedFileSafely(): Promise<void> {
    try {
      await storage.deleteFile({ bucketId: BUCKET_ID, fileId: uploadedFile.$id });
    } catch {
      // Best-effort cleanup: an orphaned file is preferable to a hung upload flow.
    }
  }

  try {
    const execution = await functions.createExecution({
      functionId: UPLOAD_PHOTO_FUNCTION_ID,
      body: JSON.stringify({
        fileId: uploadedFile.$id,
        uploaderName,
        deviceId,
        fileName: file.name,
        fileSize: file.size,
      }),
      method: ExecutionMethod.POST,
    });

    if (execution.responseStatusCode === 201) {
      return { status: 'created' };
    }

    await deleteUploadedFileSafely();

    if (execution.responseStatusCode === 409) {
      const responseBody = JSON.parse(execution.responseBody || '{}') as { error?: string };
      if (responseBody.error === 'photo_duplicate') {
        return { status: 'duplicate' };
      }
      return { status: 'limit_reached' };
    }

    return { status: 'error' };
  } catch {
    await deleteUploadedFileSafely();
    return { status: 'error' };
  }
}
