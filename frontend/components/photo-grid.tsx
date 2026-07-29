import type { Photo } from '@/lib/photo-repository';
import { getPhotoThumbnailUrl } from '@/lib/photo-repository';

type PhotoGridProps = {
  photos: Photo[];
  newPhotoIds: Set<string>;
  onPhotoClick: (photo: Photo) => void;
};

const THREE_COLUMN_MIN_PHOTOS = 20;

export function PhotoGrid({ photos, newPhotoIds, onPhotoClick }: PhotoGridProps) {
  const columnsClass = photos.length < THREE_COLUMN_MIN_PHOTOS ? 'columns-2' : 'columns-3';

  return (
    <div className={`${columnsClass} gap-2 px-3 pb-4`}>
      {photos.map((photo) => (
        <button
          key={photo.fileId}
          type="button"
          onClick={() => onPhotoClick(photo)}
          onContextMenu={(event) => event.preventDefault()}
          draggable={false}
          aria-label={`Zdjęcie od ${photo.uploaderName}`}
          className={`relative mb-2 block aspect-square w-full cursor-pointer break-inside-avoid overflow-hidden rounded-2xl bg-cover bg-center ${
            newPhotoIds.has(photo.fileId) ? 'animate-photo-in' : ''
          }`}
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
