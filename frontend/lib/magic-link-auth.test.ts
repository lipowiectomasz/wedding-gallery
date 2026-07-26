import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeMagicLinkSession, sendMagicLink } from './magic-link-auth';
import { account } from './appwrite-client';

vi.mock('./appwrite-client', () => ({
  account: {
    createMagicURLToken: vi.fn(),
    createSession: vi.fn(),
  },
}));

describe('sendMagicLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a magic URL token with the given email and redirect URL', async () => {
    await sendMagicLink('guest@example.com', 'https://example.com/auth/callback');

    expect(account.createMagicURLToken).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'guest@example.com',
        url: 'https://example.com/auth/callback',
      }),
    );
  });
});

describe('completeMagicLinkSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a session from the userId and secret', async () => {
    await completeMagicLinkSession('user-1', 'secret-1');

    expect(account.createSession).toHaveBeenCalledWith({ userId: 'user-1', secret: 'secret-1' });
  });
});
