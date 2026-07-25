import Link from 'next/link';
import { FloralDecoration } from '@/components/floral-decoration';
import { BottomNav } from '@/components/bottom-nav';
import { PrimaryButton } from '@/components/primary-button';

export default function GalleryPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <FloralDecoration position="top-right" />
      <FloralDecoration position="bottom-left" />

      <div className="relative flex items-center justify-between px-4 pt-3.5 pb-3">
        <h1 className="font-heading text-[22px]">Galeria</h1>
        <div className="flex items-center gap-1.75">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-border bg-accent-bg text-[11px] font-bold text-accent-dark">
            KF
          </span>
          <span className="text-[11.5px] text-slate-light underline">Wyloguj</span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-8.5 text-center">
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

      <BottomNav />
    </main>
  );
}
