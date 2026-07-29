import type { Photo } from '@/lib/photo-repository';
import { PhotoColumn } from './photo-column';

type PhotoGridProps = {
  photos: Photo[];
  isScrollPaused: boolean;
  onPhotoClick: (photo: Photo) => void;
};

export function PhotoGrid({ photos, isScrollPaused, onPhotoClick }: PhotoGridProps) {
  const leftColumnPhotos = photos.filter((_, index) => index % 2 === 0);
  const rightColumnPhotos = photos.filter((_, index) => index % 2 === 1);

  return (
    <div className="flex gap-3 px-6 pb-4">
      <PhotoColumn
        photos={leftColumnPhotos}
        direction="down"
        isPaused={isScrollPaused}
        onPhotoClick={onPhotoClick}
      />
      <PhotoColumn
        photos={rightColumnPhotos}
        direction="up"
        isPaused={isScrollPaused}
        onPhotoClick={onPhotoClick}
      />
    </div>
  );
}
