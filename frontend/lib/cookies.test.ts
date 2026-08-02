import { beforeEach, describe, expect, it } from 'vitest';
import { getCookie, setCookie } from './cookies';

describe('cookies', () => {
  beforeEach(() => {
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0]?.trim();
      if (name) {
        document.cookie = `${name}=; max-age=0; path=/`;
      }
    });
  });

  it('returns null when the cookie is not set', () => {
    expect(getCookie('missing')).toBeNull();
  });

  it('returns the value after setting a cookie', () => {
    setCookie('page-size', '12');

    expect(getCookie('page-size')).toBe('12');
  });

  it('decodes values that contain special characters', () => {
    setCookie('label', 'a b&c');

    expect(getCookie('label')).toBe('a b&c');
  });

  it('distinguishes between similarly named cookies', () => {
    setCookie('page', '3');
    setCookie('page-size', '24');

    expect(getCookie('page')).toBe('3');
    expect(getCookie('page-size')).toBe('24');
  });
});
