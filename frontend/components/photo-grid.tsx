import type { Photo } from '@/lib/photo-repository';
import { getPhotoThumbnailUrl } from '@/lib/photo-repository';

type PhotoGridProps = {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
};

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  return (
    <div className="columns-2 gap-2.5 px-4 pb-4">
      {photos.map((photo) => (
        <button
          key={photo.fileId}
          type="button"
          onClick={() => onPhotoClick(photo)}
          onContextMenu={(event) => event.preventDefault()}
          draggable={false}
          aria-label={`Zdjęcie od ${photo.uploaderName}`}
          className="relative mb-2.5 block aspect-square w-full break-inside-avoid overflow-hidden rounded-2xl bg-cover bg-center"
          style={{ backgroundImage: `url(${getPhotoThumbnailUrl(photo.fileId)})` }}
        >
          <span className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 py-2 text-left text-xs text-white">
            {photo.uploaderName}
          </span>
        </button>
      ))}
    </div>
  );
}
