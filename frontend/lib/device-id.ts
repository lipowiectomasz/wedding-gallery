const DEVICE_ID_STORAGE_KEY = 'wedding-gallery-device-id';

export function getDeviceId(): string {
  const stored = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (stored) {
    return stored;
  }

  const generated = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, generated);
  return generated;
}
