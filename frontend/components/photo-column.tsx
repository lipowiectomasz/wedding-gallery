import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Photo } from '@/lib/photo-repository';
import { getPhotoThumbnailUrl } from '@/lib/photo-repository';

type PhotoColumnProps = {
  photos: Photo[];
  direction: 'up' | 'down';
  isPaused: boolean;
  onInteractionChange: (isInteracting: boolean) => void;
  onPhotoClick: (photo: Photo) => void;
};

const PIXELS_PER_SECOND = 12;
const DRAG_CLICK_THRESHOLD_PX = 6;

export function PhotoColumn({
  photos,
  direction,
  isPaused,
  onInteractionChange,
  onPhotoClick,
}: PhotoColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const cycleHeightRef = useRef(0);
  const [repeatCount, setRepeatCount] = useState(2);
  const dragStateRef = useRef<{ startY: number; startOffset: number } | null>(null);
  const wasDraggedRef = useRef(false);

  const shouldLoop = photos.length > 1;
  const loopedPhotos = shouldLoop
    ? Array.from({ length: repeatCount }, () => photos).flat()
    : photos;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track || !shouldLoop || photos.length === 0) {
      return;
    }

    const children = Array.from(track.children) as HTMLElement[];
    const originalSetLength = photos.length;
    const firstSet = children.slice(0, originalSetLength);
    if (firstSet.length === 0) {
      return;
    }

    const lastElementOfSet = firstSet[firstSet.length - 1];
    const singleSetHeight = lastElementOfSet.offsetTop + lastElementOfSet.offsetHeight;
    if (singleSetHeight <= 0) {
      return;
    }

    const containerHeight = container.clientHeight;
    const neededRepeats = Math.max(2, Math.ceil((containerHeight * 2) / singleSetHeight) + 1);

    cycleHeightRef.current = singleSetHeight;

    setRepeatCount((current) => (current === neededRepeats ? current : neededRepeats));
  }, [photos, shouldLoop]);

  useEffect(() => {
    if (!shouldLoop) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    let frameId: number;
    let lastTimestamp: number | null = null;

    function tick(timestamp: number) {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }
      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (!isPaused && !dragStateRef.current && cycleHeightRef.current > 0) {
        const delta = PIXELS_PER_SECOND * deltaSeconds;
        offsetRef.current += direction === 'up' ? -delta : delta;
        normalizeOffset();
        applyOffset();
      }

      frameId = requestAnimationFrame(tick);
    }

    function normalizeOffset() {
      const cycleHeight = cycleHeightRef.current;
      if (cycleHeight <= 0) {
        return;
      }
      if (offsetRef.current <= -cycleHeight) {
        offsetRef.current += cycleHeight;
      } else if (offsetRef.current >= 0) {
        offsetRef.current -= cycleHeight;
      }
    }

    function applyOffset() {
      if (trackRef.current) {
        trackRef.current.style.transform = `translateY(${offsetRef.current}px)`;
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [direction, isPaused, shouldLoop]);

  function handlePointerDown(event: React.PointerEvent) {
    if (!shouldLoop) {
      return;
    }
    dragStateRef.current = { startY: event.clientY, startOffset: offsetRef.current };
    onInteractionChange(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const dragState = dragStateRef.current;
    if (!dragState) {
      return;
    }

    const deltaY = event.clientY - dragState.startY;
    if (Math.abs(deltaY) > DRAG_CLICK_THRESHOLD_PX) {
      wasDraggedRef.current = true;
    }

    offsetRef.current = dragState.startOffset + deltaY;
    const cycleHeight = cycleHeightRef.current;
    if (cycleHeight > 0) {
      while (offsetRef.current <= -cycleHeight) {
        offsetRef.current += cycleHeight;
      }
      while (offsetRef.current >= 0) {
        offsetRef.current -= cycleHeight;
      }
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translateY(${offsetRef.current}px)`;
    }
  }

  function handlePointerUp() {
    dragStateRef.current = null;
    onInteractionChange(false);
  }

  return (
    <div ref={containerRef} className="flex-1 touch-pan-x overflow-hidden">
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex cursor-grab flex-col gap-2.5 active:cursor-grabbing"
      >
        {loopedPhotos.map((photo, index) => (
          <button
            key={`${photo.fileId}-${index}`}
            type="button"
            onClick={(event) => {
              if (wasDraggedRef.current) {
                wasDraggedRef.current = false;
                event.preventDefault();
                return;
              }
              onPhotoClick(photo);
            }}
            onContextMenu={(event) => event.preventDefault()}
            draggable={false}
            aria-label={`Zdjęcie od ${photo.uploaderName}`}
            className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-2xl bg-cover bg-center"
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
