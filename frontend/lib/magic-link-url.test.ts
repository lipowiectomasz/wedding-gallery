import { describe, expect, it } from 'vitest';
import { buildMagicLinkRedirectUrl } from './magic-link-url';

describe('buildMagicLinkRedirectUrl', () => {
  it('builds the callback URL from the current origin', () => {
    expect(buildMagicLinkRedirectUrl()).toBe(`${window.location.origin}/auth/callback`);
  });
});
