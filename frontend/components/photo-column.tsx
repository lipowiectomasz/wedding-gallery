import type { Photo } from '@/lib/photo-repository';
import { getPhotoThumbnailUrl } from '@/lib/photo-repository';

type PhotoColumnProps = {
  photos: Photo[];
  direction: 'up' | 'down';
  isPaused: boolean;
  onPhotoClick: (photo: Photo) => void;
};

export function PhotoColumn({ photos, direction, isPaused, onPhotoClick }: PhotoColumnProps) {
  const shouldLoop = photos.length > 1;
  const loopedPhotos = shouldLoop ? [...photos, ...photos] : photos;
  const animationClass = shouldLoop
    ? direction === 'up'
      ? 'animate-scroll-up'
      : 'animate-scroll-down'
    : '';

  return (
    <div className="flex-1 overflow-hidden">
      <div
        className={`flex flex-col gap-2.5 ${animationClass} ${isPaused ? 'animate-scroll-paused' : ''}`}
      >
        {loopedPhotos.map((photo, index) => (
          <button
            key={`${photo.fileId}-${index}`}
            type="button"
            onClick={() => onPhotoClick(photo)}
            onContextMenu={(event) => event.preventDefault()}
            draggable={false}
            aria-label={`Zdjęcie od ${photo.uploaderName}`}
            className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: `url(${getPhotoThumbnailUrl(photo.fileId)})` }}
          >
            <span className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-left text-[11px] text-white">
              {photo.uploaderName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
