import type { Photo } from '@/lib/photo-repository';
import { getPhotoThumbnailUrl } from '@/lib/photo-repository';
import { PhotoColumn } from './photo-column';

type PhotoGridProps = {
  photos: Photo[];
  isScrollPaused: boolean;
  onInteractionChange: (isInteracting: boolean) => void;
  onPhotoClick: (photo: Photo) => void;
};

const AMBIENT_SCROLL_MIN_PHOTOS = 6;

export function PhotoGrid({
  photos,
  isScrollPaused,
  onInteractionChange,
  onPhotoClick,
}: PhotoGridProps) {
  if (photos.length < AMBIENT_SCROLL_MIN_PHOTOS) {
    return (
      <div className="columns-3 gap-2 px-3 pb-4">
        {photos.map((photo) => (
          <button
            key={photo.fileId}
            type="button"
            onClick={() => onPhotoClick(photo)}
            onContextMenu={(event) => event.preventDefault()}
            draggable={false}
            aria-label={`Zdjęcie od ${photo.uploaderName}`}
            className="relative mb-2 block aspect-square w-full cursor-pointer break-inside-avoid overflow-hidden rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: `url(${getPhotoThumbnailUrl(photo.fileId)})` }}
          >
            <span className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-left text-[11px] text-white">
              {photo.uploaderName}
            </span>
          </button>
        ))}
      </div>
    );
  }

  const leftColumnPhotos = photos.filter((_, index) => index % 3 === 0);
  const middleColumnPhotos = photos.filter((_, index) => index % 3 === 1);
  const rightColumnPhotos = photos.filter((_, index) => index % 3 === 2);

  return (
    <div className="flex gap-2 px-3 pb-4">
      <PhotoColumn
        photos={leftColumnPhotos}
        direction="down"
        isPaused={isScrollPaused}
        onInteractionChange={onInteractionChange}
        onPhotoClick={onPhotoClick}
      />
      <PhotoColumn
        photos={middleColumnPhotos}
        direction="up"
        isPaused={isScrollPaused}
        onInteractionChange={onInteractionChange}
        onPhotoClick={onPhotoClick}
      />
      <PhotoColumn
        photos={rightColumnPhotos}
        direction="down"
        isPaused={isScrollPaused}
        onInteractionChange={onInteractionChange}
        onPhotoClick={onPhotoClick}
      />
    </div>
  );
}
