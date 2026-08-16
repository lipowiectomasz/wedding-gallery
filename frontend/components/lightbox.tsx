import { useEffect, useRef } from 'react';
import type { Photo } from '@/lib/photo-repository';
import { getPhotoLightboxUrl } from '@/lib/photo-repository';

type LightboxProps = {
  photos: Photo[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

const SWIPE_THRESHOLD_PX = 50;

export function Lightbox({ photos, activeIndex, onClose, onNavigate }: LightboxProps) {
  const photo = photos[activeIndex];
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < photos.length - 1;
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && hasPrevious) {
        onNavigate(activeIndex - 1);
      } else if (event.key === 'ArrowRight' && hasNext) {
        onNavigate(activeIndex + 1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, hasPrevious, hasNext, onClose, onNavigate]);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;

    if (deltaX <= -SWIPE_THRESHOLD_PX && hasNext) {
      onNavigate(activeIndex + 1);
    } else if (deltaX >= SWIPE_THRESHOLD_PX && hasPrevious) {
      onNavigate(activeIndex - 1);
    }
  }

  if (!photo) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-2xl text-white/80"
        >
          ×
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hasPrevious && (
          <button
            type="button"
            onClick={() => onNavigate(activeIndex - 1)}
            aria-label="Poprzednie zdjęcie"
            className="absolute left-1 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-2xl text-white/80"
          >
            ‹
          </button>
        )}

        <div
          role="img"
          aria-label={`Zdjęcie od ${photo.uploaderName}`}
          onContextMenu={(event) => event.preventDefault()}
          className="h-full w-full max-w-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${getPhotoLightboxUrl(photo.fileId)})` }}
        />

        {hasNext && (
          <button
            type="button"
            onClick={() => onNavigate(activeIndex + 1)}
            aria-label="Następne zdjęcie"
            className="absolute right-1 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-2xl text-white/80"
          >
            ›
          </button>
        )}
      </div>

      <p className="px-4 pb-6 text-center text-sm text-white/80">{photo.uploaderName}</p>
    </div>
  );
}
