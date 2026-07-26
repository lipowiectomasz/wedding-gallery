import type { Models } from 'appwrite';
import { account } from './appwrite-client';

export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    return await account.get();
  } catch {
    return null;
  }
}
