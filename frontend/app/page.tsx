'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FloralDecoration } from '@/components/floral-decoration';
import { PrimaryButton } from '@/components/primary-button';
import { buildAuthCallbackUrl, buildAuthFailureUrl } from '@/lib/auth-callback-url';
import { getCurrentUser } from '@/lib/current-user';
import { findProfileByUserId } from '@/lib/profile-repository';
import { sendMagicLink } from '@/lib/magic-link-auth';
import { startGoogleLogin } from '@/lib/google-oauth';

export default function HomePage() {
  const router = useRouter();
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [isConsentChecked, setIsConsentChecked] = useState(false);

  useEffect(() => {
    async function redirectIfLoggedIn() {
      const user = await getCurrentUser();
      if (!user) {
        return;
      }

      const profile = await findProfileByUserId(user.$id);
      router.replace(profile ? '/upload' : '/onboarding');
    }

    redirectIfLoggedIn();
  }, [router]);

  function handleGoogleLogin() {
    if (!isConsentChecked) {
      return;
    }
    startGoogleLogin(buildAuthCallbackUrl(), buildAuthFailureUrl());
  }

  async function handleEmailSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isConsentChecked) {
      return;
    }
    setStatus('sending');
    try {
      await sendMagicLink(email, buildAuthCallbackUrl());
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden md:items-center md:justify-center">
      <FloralDecoration position="top-right" />
      <FloralDecoration position="bottom-left" />

      <div className="relative flex flex-col items-center gap-3.5 px-8 pt-24 text-center md:pt-0 md:pb-8">
        <p className="text-xs font-semibold tracking-[0.26em] text-gold uppercase">
          15 · 08 · 2026
        </p>
        <h1 className="font-heading text-5xl leading-tight">Nasze wesele</h1>
        <div className="my-1 h-px w-13 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <p className="max-w-70 text-base leading-relaxed text-slate">
          Zrób zdjęcie i dodaj je do wspólnej galerii. Zobaczą je wszyscy goście.
        </p>
      </div>

      <div className="relative mx-auto mt-auto flex w-full max-w-[350px] flex-col gap-3 px-6.5 pb-8 md:mt-0 md:pb-0">
        <label className="flex items-start gap-2.5 rounded-2xl bg-accent-bg p-3.5">
          <input
            type="checkbox"
            checked={isConsentChecked}
            onChange={(event) => setIsConsentChecked(event.target.checked)}
            className="mt-0.5 h-5 w-5 flex-none rounded-md border border-accent bg-paper-light"
          />
          <span className="text-xs leading-relaxed text-[#4a6373]">
            Zgadzam się na publikację moich zdjęć w galerii wesela.{' '}
            <span className="text-accent-dark underline">Szczegóły i RODO</span>
          </span>
        </label>

        <PrimaryButton
          type="button"
          onClick={handleGoogleLogin}
          disabled={!isConsentChecked}
          className="w-full"
        >
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
              disabled={!isConsentChecked || status === 'sending' || status === 'sent'}
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
            disabled={!isConsentChecked}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#c6cfd5] text-base font-medium text-ink-soft disabled:opacity-50"
          >
            Zaloguj e-mailem
          </button>
        )}
      </div>
    </main>
  );
}
