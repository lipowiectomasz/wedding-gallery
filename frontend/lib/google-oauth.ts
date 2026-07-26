import { OAuthProvider } from 'appwrite';
import { account } from './appwrite-client';

export function startGoogleLogin(successUrl: string, failureUrl: string): void {
  account.createOAuth2Session({
    provider: OAuthProvider.Google,
    success: successUrl,
    failure: failureUrl,
  });
}
