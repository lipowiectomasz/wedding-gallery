import { Client, Databases } from 'node-appwrite';
import { countPhotosForDeviceWith, createPhotoDocumentWith } from './appwrite-database.ts';
import { createPhotoWithLimit } from './create-photo.ts';
import { InvalidRequestError, parseUploadRequest } from './parse-request.ts';
import { resolveApiEndpoint } from './resolve-endpoint.ts';
import type { FunctionContext } from './runtime-context.ts';

export default async function main({ req, res, log }: FunctionContext) {
  const uploaderId = req.headers['x-appwrite-user-id'];
  if (!uploaderId) {
    return res.json({ error: 'unauthenticated' }, 401);
  }

  let parsed;
  try {
    parsed = parseUploadRequest(req.bodyJson);
  } catch (parseError) {
    if (parseError instanceof InvalidRequestError) {
      return res.json({ error: parseError.message }, 400);
    }
    throw parseError;
  }

  const input = { ...parsed, uploaderId };

  const client = new Client()
    .setEndpoint(await resolveApiEndpoint())
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID ?? '')
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const databases = new Databases(client);

  const result = await createPhotoWithLimit(
    input,
    countPhotosForDeviceWith(databases),
    createPhotoDocumentWith(databases),
  );

  if (result.status === 'limit_reached') {
    log(`photo limit reached for device ${input.deviceId}`);
    return res.json({ error: 'photo_limit_reached' }, 409);
  }

  log(`photo created for device ${input.deviceId} with seq ${result.seq}`);
  return res.json({ seq: result.seq }, 201);
}
