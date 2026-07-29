'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FloralDecoration } from '@/components/floral-decoration';
import { BottomNav } from '@/components/bottom-nav';
import { UploadProgressBar } from '@/components/upload-progress-bar';
import { UploadQueueList } from '@/components/upload-queue-list';
import { getCurrentUser } from '@/lib/current-user';
import { getDeviceId } from '@/lib/device-id';
import { logout } from '@/lib/logout';
import { findProfileByUserId, Profile } from '@/lib/profile-repository';
import { countPhotosForDevice } from '@/lib/photo-repository';
import { uploadPhoto } from '@/lib/upload-photo';
import { validatePhotoFile } from '@/lib/validate-photo-file';
import {
  createQueueItem,
  isQueueSettled,
  nextQueuedItem,
  QueueItem,
  updateQueueItem,
} from '@/lib/upload-queue';

const PHOTO_LIMIT = 20;
const MAX_FILES_PER_SELECTION = 3;

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

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
      setPhotoCount(await countPhotosForDevice(getDeviceId()));
    }

    loadState();
  }, [router]);

  useEffect(() => {
    if (isProcessingRef.current) {
      return;
    }

    const item = nextQueuedItem(queue);
    if (!item || !profile) {
      return;
    }

    isProcessingRef.current = true;

    Promise.resolve()
      .then(() => setQueue((current) => updateQueueItem(current, item.id, { status: 'uploading' })))
      .then(() =>
        uploadPhoto(item.file, profile.fullName, getDeviceId(), (progress) => {
          setQueue((current) => updateQueueItem(current, item.id, { progress }));
        }),
      )
      .then((result) => {
        if (result.status === 'created') {
          setPhotoCount((count) => Math.min(PHOTO_LIMIT, count + 1));
          setQueue((current) =>
            updateQueueItem(current, item.id, { status: 'done', progress: 100 }),
          );
        } else if (result.status === 'limit_reached') {
          setPhotoCount(PHOTO_LIMIT);
          setQueue((current) =>
            updateQueueItem(current, item.id, {
              status: 'error',
              errorMessage: 'Osiągnięto limit 20 zdjęć na to urządzenie.',
            }),
          );
        } else {
          setQueue((current) =>
            updateQueueItem(current, item.id, {
              status: 'error',
              errorMessage: 'Sieć się urwała w połowie. Spróbuj jeszcze raz.',
            }),
          );
        }
        isProcessingRef.current = false;
      });
  }, [queue, profile]);

  useEffect(() => {
    if (queue.length === 0) {
      return;
    }

    const hasErrors = queue.some((item) => item.status === 'error');
    if (!hasErrors && isQueueSettled(queue)) {
      const timeout = setTimeout(() => setQueue([]), 1500);
      return () => clearTimeout(timeout);
    }
  }, [queue]);

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (files.length === 0 || !profile) {
      return;
    }

    const remainingSlots = PHOTO_LIMIT - photoCount;
    const selectedFiles = files.slice(0, Math.min(MAX_FILES_PER_SELECTION, remainingSlots));

    const oversizedFile = selectedFiles.map(validatePhotoFile).find((error) => error !== null);
    if (oversizedFile) {
      setRejectionError(oversizedFile);
      return;
    }

    setRejectionError(null);
    setQueue((current) => [
      ...current,
      ...selectedFiles.map((file) => createQueueItem(crypto.randomUUID(), file)),
    ]);
  }

  function handleRetry(id: string) {
    setQueue((current) =>
      updateQueueItem(current, id, { status: 'queued', progress: 0, errorMessage: null }),
    );
  }

  function handleSkip(id: string) {
    setQueue((current) => current.filter((item) => item.id !== id));
  }

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  const isAtLimit = photoCount >= PHOTO_LIMIT;
  const isUploading = queue.some((item) => item.status === 'uploading' || item.status === 'queued');

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden md:items-center md:justify-center">
      <FloralDecoration position="bottom-left" />

      <div className="relative mx-auto flex w-full max-w-[350px] items-center justify-between px-5 pt-4 pb-3 md:pt-0">
        <h1 className="font-heading text-[22px]">Dodaj zdjęcie</h1>
        {profile && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2"
            aria-label="Wyloguj się"
          >
            <span className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-accent-border bg-accent-bg text-xs font-bold text-accent-dark">
              {profile.fullName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <span className="text-xs text-slate-light">{profile.fullName.split(' ')[0]}</span>
          </button>
        )}
      </div>

      <div className="relative mx-auto flex w-full max-w-[350px] flex-col gap-4.5 px-5">
        <UploadProgressBar used={photoCount} limit={PHOTO_LIMIT} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelected}
          disabled={isAtLimit || isUploading || !profile}
          className="hidden"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileSelected}
          disabled={isAtLimit || isUploading || !profile}
          className="hidden"
        />

        {queue.length > 0 ? (
          <>
            <p className="text-sm text-slate">
              Możesz spokojnie robić kolejne zdjęcia — wysyłanie leci w tle.
            </p>
            <UploadQueueList queue={queue} onRetry={handleRetry} onSkip={handleSkip} />
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAtLimit || !profile}
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
                  {isAtLimit ? 'Limit wykorzystany' : 'Dodaj zdjęcia'}
                </span>
                <span className="text-sm text-[#6c7f8c]">
                  {isAtLimit ? 'Nie możesz już dodać więcej zdjęć' : 'Dotknij — wybierz z galerii'}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isAtLimit || !profile}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border-soft py-3 text-sm font-medium text-slate-light disabled:opacity-60 md:hidden"
            >
              Zrób zdjęcie aparatem
            </button>
          </>
        )}

        {rejectionError && <p className="text-center text-sm text-error">{rejectionError}</p>}
      </div>

      <BottomNav />
    </main>
  );
}
