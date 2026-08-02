import { OAuthProvider } from 'appwrite';
import { account } from './appwrite-client';

export async function startGoogleLogin(successUrl: string, failureUrl: string): Promise<void> {
  try {
    await account.deleteSession({ sessionId: 'current' });
  } catch (error) {
    console.error('Failed to clear existing session before Google login', error);
  }

  account.createOAuth2Session({
    provider: OAuthProvider.Google,
    success: successUrl,
    failure: failureUrl,
  });
}
