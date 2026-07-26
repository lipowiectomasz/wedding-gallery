import { beforeEach, describe, expect, it } from 'vitest';
import { getDeviceId } from './device-id';

describe('getDeviceId', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('generates and persists a device id on first call', () => {
    const deviceId = getDeviceId();
    expect(deviceId).toMatch(/^[0-9a-f-]{36}$/);
    expect(window.localStorage.getItem('wedding-gallery-device-id')).toBe(deviceId);
  });

  it('returns the same device id on subsequent calls', () => {
    const first = getDeviceId();
    const second = getDeviceId();
    expect(second).toBe(first);
  });
});
