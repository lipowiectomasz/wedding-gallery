import type { ButtonHTMLAttributes } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ className = '', children, ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`flex h-[60px] items-center justify-center gap-3 rounded-2xl bg-ink text-lg font-semibold text-paper-light shadow-[0_10px_24px_-10px_rgba(42,58,69,0.6)] disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
