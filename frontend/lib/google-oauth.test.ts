import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OAuthProvider } from 'appwrite';
import { startGoogleLogin } from './google-oauth';
import { account } from './appwrite-client';

vi.mock('./appwrite-client', () => ({
  account: {
    createOAuth2Session: vi.fn(),
  },
}));

describe('startGoogleLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts a Google OAuth2 session with the given success and failure URLs', () => {
    startGoogleLogin('https://example.com/auth/callback', 'https://example.com/');

    expect(account.createOAuth2Session).toHaveBeenCalledWith({
      provider: OAuthProvider.Google,
      success: 'https://example.com/auth/callback',
      failure: 'https://example.com/',
    });
  });
});
