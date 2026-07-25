export function getAppwriteEndpoint(): string {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  if (!endpoint) {
    throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT is not set');
  }
  return endpoint;
}

export function getAppwriteProjectId(): string {
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
  }
  return projectId;
}
