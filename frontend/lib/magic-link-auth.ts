import { ID } from 'appwrite';
import { account } from './appwrite-client';

export async function sendMagicLink(email: string, redirectUrl: string): Promise<void> {
  await account.createMagicURLToken({
    userId: ID.unique(),
    email,
    url: redirectUrl,
  });
}

export async function completeMagicLinkSession(userId: string, secret: string): Promise<void> {
  await account.createSession({ userId, secret });
}
