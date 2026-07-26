import { describe, expect, it } from 'vitest';
import { buildAuthCallbackUrl, buildAuthFailureUrl } from './auth-callback-url';

describe('buildAuthCallbackUrl', () => {
  it('builds the callback URL from the current origin', () => {
    expect(buildAuthCallbackUrl()).toBe(`${window.location.origin}/auth/callback`);
  });
});

describe('buildAuthFailureUrl', () => {
  it('builds the home URL from the current origin', () => {
    expect(buildAuthFailureUrl()).toBe(`${window.location.origin}/`);
  });
});
