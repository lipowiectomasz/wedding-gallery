import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OAuthProvider } from 'appwrite';
import { startGoogleLogin } from './google-oauth';
import { account } from './appwrite-client';

vi.mock('./appwrite-client', () => ({
  account: {
    deleteSession: vi.fn(),
    createOAuth2Session: vi.fn(),
  },
}));

describe('startGoogleLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(account.deleteSession).mockResolvedValue({});
  });

  it('clears any existing session before starting a Google OAuth2 session', async () => {
    await startGoogleLogin('https://example.com/auth/callback', 'https://example.com/');

    expect(account.deleteSession).toHaveBeenCalledWith({ sessionId: 'current' });
    expect(account.createOAuth2Session).toHaveBeenCalledWith({
      provider: OAuthProvider.Google,
      success: 'https://example.com/auth/callback',
      failure: 'https://example.com/',
    });
  });

  it('still starts the OAuth2 session when there is no existing session to clear', async () => {
    vi.mocked(account.deleteSession).mockRejectedValue(new Error('no session'));

    await startGoogleLogin('https://example.com/auth/callback', 'https://example.com/');

    expect(account.createOAuth2Session).toHaveBeenCalledWith({
      provider: OAuthProvider.Google,
      success: 'https://example.com/auth/callback',
      failure: 'https://example.com/',
    });
  });
});
