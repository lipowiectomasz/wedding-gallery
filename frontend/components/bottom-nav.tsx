'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/upload', label: 'Dodaj' },
  { href: '/gallery', label: 'Galeria' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto mt-auto flex w-full max-w-[350px] border-t border-border-soft bg-paper-light md:mt-8">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 ${
              isActive ? '-mt-px border-t-2 border-gold' : ''
            }`}
          >
            <span
              className={`text-xs ${isActive ? 'font-bold text-ink' : 'font-medium text-slate-light'}`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
