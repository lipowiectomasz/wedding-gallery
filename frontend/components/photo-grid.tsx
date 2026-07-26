import Image from 'next/image';
import type { Photo } from '@/lib/photo-repository';
import { getPhotoThumbnailUrl } from '@/lib/photo-repository';

type PhotoGridProps = {
  photos: Photo[];
};

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="columns-2 gap-2.5 px-4 pb-4">
      {photos.map((photo) => (
        <figure
          key={photo.fileId}
          className="relative mb-2.5 break-inside-avoid overflow-hidden rounded-2xl"
        >
          <Image
            src={getPhotoThumbnailUrl(photo.fileId)}
            alt={`Zdjęcie od ${photo.uploaderName}`}
            width={480}
            height={480}
            unoptimized
            className="w-full object-cover"
          />
          <figcaption className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 py-2 text-xs text-white">
            {photo.uploaderName}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
