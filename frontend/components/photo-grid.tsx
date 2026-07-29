import { useEffect, useState } from 'react';
import type { Photo } from '@/lib/photo-repository';
import { getPhotoThumbnailUrl } from '@/lib/photo-repository';

type PhotoGridProps = {
  photos: Photo[];
  newPhotoIds: Set<string>;
  onPhotoClick: (photo: Photo) => void;
};

const THREE_COLUMN_MIN_PHOTOS = 20;
const DESKTOP_COLUMN_COUNT = 4;
const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

function splitIntoColumns(photos: Photo[], columnCount: number): Photo[][] {
  return Array.from({ length: columnCount }, (_, columnIndex) =>
    photos.filter((_, index) => index % columnCount === columnIndex),
  );
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    function handleChange(event: MediaQueryListEvent) {
      setIsDesktop(event.matches);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isDesktop;
}

export function PhotoGrid({ photos, newPhotoIds, onPhotoClick }: PhotoGridProps) {
  const isDesktop = useIsDesktop();
  const columnCount = isDesktop
    ? DESKTOP_COLUMN_COUNT
    : photos.length < THREE_COLUMN_MIN_PHOTOS
      ? 2
      : 3;
  const columns = splitIntoColumns(photos, columnCount);

  return (
    <div className="flex gap-2 px-3 pb-4">
      {columns.map((columnPhotos, columnIndex) => (
        <div key={columnIndex} className="flex flex-1 flex-col gap-2">
          {columnPhotos.map((photo) => (
            <button
              key={photo.fileId}
              type="button"
              onClick={() => onPhotoClick(photo)}
              onContextMenu={(event) => event.preventDefault()}
              draggable={false}
              aria-label={`Zdjęcie od ${photo.uploaderName}`}
              className={`relative block aspect-square w-full cursor-pointer overflow-hidden rounded-2xl bg-cover bg-center ${
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
      ))}
    </div>
  );
}
