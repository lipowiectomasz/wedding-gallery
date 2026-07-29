'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FloralDecoration } from '@/components/floral-decoration';
import { BottomNav } from '@/components/bottom-nav';
import { PrimaryButton } from '@/components/primary-button';
import { PhotoGrid } from '@/components/photo-grid';
import { Lightbox } from '@/components/lightbox';
import { getCurrentUser } from '@/lib/current-user';
import { listPhotos, Photo } from '@/lib/photo-repository';

type Filter = 'all' | 'mine';

const RESUME_DELAY_MS = 4000;

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function loadGallery() {
      const [user, allPhotos] = await Promise.all([getCurrentUser(), listPhotos()]);
      setCurrentUserId(user?.$id ?? null);
      setPhotos(allPhotos);
      setIsLoading(false);
    }

    loadGallery();
  }, []);

  function scheduleResume() {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, RESUME_DELAY_MS);
  }

  function handleColumnInteractionChange(isInteracting: boolean) {
    setIsUserInteracting(isInteracting);
    if (isInteracting && resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    } else if (!isInteracting) {
      scheduleResume();
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    function handleUserInteraction() {
      setIsUserInteracting(true);
      scheduleResume();
    }

    container.addEventListener('wheel', handleUserInteraction, { passive: true });
    container.addEventListener('touchmove', handleUserInteraction, { passive: true });
    container.addEventListener('scroll', handleUserInteraction, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleUserInteraction);
      container.removeEventListener('touchmove', handleUserInteraction);
      container.removeEventListener('scroll', handleUserInteraction);
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [isLoading]);

  const isScrollPaused = isUserInteracting || activeIndex !== null;

  const visiblePhotos =
    filter === 'mine' ? photos.filter((photo) => photo.uploaderId === currentUserId) : photos;

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <FloralDecoration position="top-right" />
      <FloralDecoration position="bottom-left" />

      <div className="relative mx-auto flex w-full max-w-[350px] items-center justify-between px-4 pt-3.5 pb-3">
        <h1 className="font-heading text-[22px]">Galeria</h1>
        {photos.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-border-soft bg-paper-light p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`cursor-pointer rounded-full px-3 py-1 ${filter === 'all' ? 'bg-ink text-paper-light' : 'text-slate-light'}`}
            >
              Wszystkie
            </button>
            <button
              type="button"
              onClick={() => setFilter('mine')}
              className={`cursor-pointer rounded-full px-3 py-1 ${filter === 'mine' ? 'bg-ink text-paper-light' : 'text-slate-light'}`}
            >
              Moje
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate">Wczytywanie...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="relative mx-auto flex w-full max-w-[350px] flex-1 flex-col items-center justify-center gap-5 px-8.5 text-center">
          <span className="flex h-27.5 w-27.5 items-center justify-center rounded-full border border-accent-border bg-accent-bg">
            <span className="relative flex h-10.5 w-13 items-center justify-center rounded-lg border-[2.5px] border-accent">
              <span className="absolute -top-2 left-3.25 h-1.5 w-4.75 rounded-t-sm bg-accent" />
              <span className="h-4.5 w-4.5 rounded-full border-[2.5px] border-accent" />
            </span>
          </span>
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-[32px] leading-tight">
              Jeszcze pusto.
              <br />
              Zaczniesz?
            </h2>
            <p className="text-[15px] leading-relaxed text-slate">
              Pierwsze zdjęcie wieczoru może być Twoje. Reszta gości dołączy w kilka minut.
            </p>
          </div>
          <Link href="/upload" className="self-stretch">
            <PrimaryButton className="w-full">Zrób pierwsze zdjęcie</PrimaryButton>
          </Link>
        </div>
      ) : visiblePhotos.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-8.5 text-center">
          <p className="text-[15px] leading-relaxed text-slate">
            Nie dodałeś jeszcze żadnego zdjęcia.
          </p>
        </div>
      ) : (
        <div ref={scrollContainerRef} className="relative flex-1 overflow-y-auto pb-16">
          <PhotoGrid
            photos={visiblePhotos}
            isScrollPaused={isScrollPaused}
            onInteractionChange={handleColumnInteractionChange}
            onPhotoClick={(photo) => setActiveIndex(visiblePhotos.indexOf(photo))}
          />
        </div>
      )}

      {activeIndex !== null && (
        <Lightbox
          photos={visiblePhotos}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}

      <BottomNav />
    </main>
  );
}
