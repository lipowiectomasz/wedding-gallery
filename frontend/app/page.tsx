'use client';

import { useState } from 'react';
import { FloralDecoration } from '@/components/floral-decoration';
import { PrimaryButton } from '@/components/primary-button';
import { buildAuthCallbackUrl, buildAuthFailureUrl } from '@/lib/auth-callback-url';
import { sendMagicLink } from '@/lib/magic-link-auth';
import { startGoogleLogin } from '@/lib/google-oauth';

export default function HomePage() {
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  function handleGoogleLogin() {
    startGoogleLogin(buildAuthCallbackUrl(), buildAuthFailureUrl());
  }

  async function handleEmailSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('sending');
    try {
      await sendMagicLink(email, buildAuthCallbackUrl());
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <FloralDecoration position="top-right" />
      <FloralDecoration position="bottom-left" />

      <div className="relative flex flex-col items-center gap-3.5 px-8 pt-24 text-center">
        <p className="text-xs font-semibold tracking-[0.26em] text-gold uppercase">
          15 · 08 · 2026
        </p>
        <h1 className="font-heading text-5xl leading-tight">Nasze wesele</h1>
        <div className="my-1 h-px w-13 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <p className="max-w-70 text-base leading-relaxed text-slate">
          Zrób zdjęcie i dodaj je do wspólnej galerii. Zobaczą je wszyscy goście.
        </p>
      </div>

      <div className="relative mx-auto mt-auto flex w-full max-w-[350px] flex-col gap-3 px-6.5 pb-8">
        <PrimaryButton type="button" onClick={handleGoogleLogin} className="w-full">
          <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-paper-light font-heading text-lg font-semibold text-ink">
            G
          </span>
          Zaloguj przez Google
        </PrimaryButton>

        {isEmailFormOpen ? (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Twój adres e-mail"
              required
              disabled={status === 'sending' || status === 'sent'}
              className="h-14 w-full rounded-2xl border border-[#c6cfd5] px-4 text-base text-ink outline-none"
            />
            <button
              type="submit"
              disabled={status === 'sending' || status === 'sent'}
              className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#c6cfd5] text-base font-medium text-ink-soft disabled:opacity-50"
            >
              {status === 'sent' ? 'Link wysłany, sprawdź e-mail' : 'Wyślij link logowania'}
            </button>
            {status === 'error' && (
              <p className="text-center text-xs text-error">
                Nie udało się wysłać linku. Spróbuj ponownie.
              </p>
            )}
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsEmailFormOpen(true)}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#c6cfd5] text-base font-medium text-ink-soft"
          >
            Zaloguj e-mailem
          </button>
        )}

        <label className="mt-1.5 flex items-start gap-2.5 rounded-2xl bg-accent-bg p-3.5">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-5 w-5 flex-none rounded-md border border-accent bg-paper-light"
          />
          <span className="text-xs leading-relaxed text-[#4a6373]">
            Zgadzam się na publikację moich zdjęć w galerii wesela.{' '}
            <span className="text-accent-dark underline">Szczegóły i RODO</span>
          </span>
        </label>
      </div>
    </main>
  );
}
