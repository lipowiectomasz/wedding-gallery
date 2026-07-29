import { account } from './appwrite-client';

export async function logout(): Promise<void> {
  await account.deleteSession({ sessionId: 'current' });
}
