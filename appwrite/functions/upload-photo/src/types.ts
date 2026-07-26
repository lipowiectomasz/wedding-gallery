export const PHOTO_LIMIT = 20;

export type PhotoDocument = {
  fileId: string;
  uploaderId: string;
  uploaderName: string;
  deviceId: string;
  seq: string;
};

export type CreatePhotoResult = { status: 'created'; seq: string } | { status: 'limit_reached' };

export class DocumentConflictError extends Error {
  constructor() {
    super('document_already_exists');
  }
}
