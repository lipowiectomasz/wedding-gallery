import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProfile, findProfileByUserId } from './profile-repository';
import { databases } from './appwrite-client';

vi.mock('./appwrite-client', () => ({
  databases: {
    listDocuments: vi.fn(),
    createDocument: vi.fn(),
  },
}));

describe('findProfileByUserId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the first matching document', async () => {
    vi.mocked(databases.listDocuments).mockResolvedValue({
      total: 1,
      documents: [
        { userId: 'user-1', fullName: 'Jan Kowalski', deviceId: 'device-1', photoCount: 3 },
      ],
    } as never);

    const profile = await findProfileByUserId('user-1');

    expect(profile).toEqual({
      userId: 'user-1',
      fullName: 'Jan Kowalski',
      deviceId: 'device-1',
      photoCount: 3,
    });
  });

  it('returns null when no profile exists', async () => {
    vi.mocked(databases.listDocuments).mockResolvedValue({
      total: 0,
      documents: [],
    } as never);

    const profile = await findProfileByUserId('user-unknown');

    expect(profile).toBeNull();
  });
});

describe('createProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a document with the given profile fields and zeroed photo count', async () => {
    vi.mocked(databases.createDocument).mockResolvedValue({
      userId: 'user-1',
      fullName: 'Jan Kowalski',
      deviceId: 'device-1',
      photoCount: 0,
    } as never);

    const profile = await createProfile('user-1', 'Jan Kowalski', 'device-1');

    expect(databases.createDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { userId: 'user-1', fullName: 'Jan Kowalski', deviceId: 'device-1', photoCount: 0 },
      }),
    );
    expect(profile.photoCount).toBe(0);
  });
});
