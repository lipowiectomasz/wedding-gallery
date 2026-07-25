import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAppwriteEndpoint, getAppwriteProjectId } from './appwrite-config';

describe('getAppwriteEndpoint', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the configured endpoint', () => {
    vi.stubEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT', 'http://localhost:8443/v1');
    expect(getAppwriteEndpoint()).toBe('http://localhost:8443/v1');
  });

  it('throws when the endpoint is not set', () => {
    vi.stubEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT', '');
    expect(() => getAppwriteEndpoint()).toThrow();
  });
});

describe('getAppwriteProjectId', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the configured project id', () => {
    vi.stubEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID', '6a64e884001ddea74077');
    expect(getAppwriteProjectId()).toBe('6a64e884001ddea74077');
  });

  it('throws when the project id is not set', () => {
    vi.stubEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID', '');
    expect(() => getAppwriteProjectId()).toThrow();
  });
});
