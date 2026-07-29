import { candidateSeqsFrom } from './seq-allocator.ts';
import { DocumentConflictError, PHOTO_LIMIT } from './types.ts';
import type { CreatePhotoResult, PhotoDocument } from './types.ts';

export type CountPhotosForUploader = (uploaderId: string) => Promise<number>;
export type CreatePhotoDocument = (document: PhotoDocument) => Promise<void>;
export type FindDuplicatePhoto = (
  uploaderId: string,
  fileName: string,
  fileSize: number,
) => Promise<boolean>;

const MAX_ATTEMPTS = PHOTO_LIMIT;

export async function createPhotoWithLimit(
  input: Omit<PhotoDocument, 'seq'>,
  countPhotosForUploader: CountPhotosForUploader,
  createPhotoDocument: CreatePhotoDocument,
  findDuplicatePhoto: FindDuplicatePhoto,
): Promise<CreatePhotoResult> {
  const isDuplicate = await findDuplicatePhoto(input.uploaderId, input.fileName, input.fileSize);
  if (isDuplicate) {
    return { status: 'duplicate' };
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const currentCount = await countPhotosForUploader(input.uploaderId);
    const candidates = candidateSeqsFrom(currentCount);

    if (candidates.length === 0) {
      return { status: 'limit_reached' };
    }

    const seq = candidates[0];

    try {
      await createPhotoDocument({ ...input, seq });
      return { status: 'created', seq };
    } catch (error) {
      if (error instanceof DocumentConflictError) {
        continue;
      }
      throw error;
    }
  }

  return { status: 'limit_reached' };
}
