'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FloralDecoration } from '@/components/floral-decoration';
import { BottomNav } from '@/components/bottom-nav';
import { UploadProgressBar } from '@/components/upload-progress-bar';
import { getCurrentUser } from '@/lib/current-user';
import { getDeviceId } from '@/lib/device-id';
import { findProfileByUserId, Profile } from '@/lib/profile-repository';
import { countPhotosForDevice } from '@/lib/photo-repository';
import { uploadPhoto } from '@/lib/upload-photo';

const PHOTO_LIMIT = 20;

export default function UploadPage() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadState() {
      const user = await getCurrentUser();
      if (!user) {
        router.replace('/');
        return;
      }

      const currentProfile = await findProfileByUserId(user.$id);
      if (!currentProfile) {
        router.replace('/onboarding');
        return;
      }

      setProfile(currentProfile);
      setPhotoCount(await countPhotosForDevice(currentProfile.deviceId));
    }

    loadState();
  }, [router]);

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !profile || isUploading) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const result = await uploadPhoto(file, profile.fullName, getDeviceId());

    if (result.status === 'created') {
      setPhotoCount((count) => Math.min(PHOTO_LIMIT, count + 1));
    } else if (result.status === 'limit_reached') {
      setPhotoCount(PHOTO_LIMIT);
      setUploadError('Osiągnięto limit 20 zdjęć na to urządzenie.');
    } else {
      setUploadError('Nie udało się dodać zdjęcia. Spróbuj ponownie.');
    }

    setIsUploading(false);
  }

  const isAtLimit = photoCount >= PHOTO_LIMIT;

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <FloralDecoration position="bottom-left" />

      <div className="relative flex items-center justify-between px-5 pt-4 pb-3">
        <h1 className="font-heading text-[22px]">Dodaj zdjęcie</h1>
        {profile && (
          <div className="flex items-center gap-2">
            <span className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-accent-border bg-accent-bg text-xs font-bold text-accent-dark">
              {profile.fullName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <span className="text-xs text-slate-light">{profile.fullName.split(' ')[0]}</span>
          </div>
        )}
      </div>

      <div className="relative flex flex-col gap-4.5 px-5">
        <UploadProgressBar used={photoCount} limit={PHOTO_LIMIT} />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelected}
          disabled={isAtLimit || isUploading || !profile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isAtLimit || isUploading || !profile}
          className="flex flex-col items-center gap-4.5 rounded-3xl border-[1.5px] border-dashed border-[#bfd6e6] bg-gradient-to-b from-white to-[#f6fafd] px-6 pt-9 pb-8.5 shadow-[inset_0_1px_0_#fff] disabled:opacity-60"
        >
          <span className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark shadow-[0_14px_30px_-12px_rgba(163,125,52,0.7)]">
            <span className="relative flex h-11 w-14 items-center justify-center rounded-lg border-3 border-white">
              <span className="absolute -top-2.25 left-3.5 h-1.75 w-5 rounded-t-sm bg-white" />
              <span className="h-5 w-5 rounded-full border-3 border-white" />
            </span>
          </span>
          <span className="flex flex-col items-center gap-1.5">
            <span className="text-[23px] font-bold text-ink">
              {isAtLimit ? 'Limit wykorzystany' : isUploading ? 'Wysyłanie...' : 'Zrób zdjęcie'}
            </span>
            <span className="text-sm text-[#6c7f8c]">
              {isAtLimit
                ? 'Nie możesz już dodać więcej zdjęć'
                : isUploading
                  ? 'Chwila, trwa zapisywanie'
                  : 'Dotknij — otworzy się aparat'}
            </span>
          </span>
        </button>

        {uploadError && <p className="text-center text-sm text-error">{uploadError}</p>}
      </div>

      <BottomNav />
    </main>
  );
}
