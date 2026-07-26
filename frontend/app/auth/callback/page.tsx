'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { completeMagicLinkSession } from '@/lib/magic-link-auth';
import { findProfileByUserId } from '@/lib/profile-repository';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginError, setLoginError] = useState<string | null>(null);

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');
  const isMissingParams = !userId || !secret;

  useEffect(() => {
    if (!userId || !secret) {
      return;
    }

    completeMagicLinkSession(userId, secret)
      .then(() => findProfileByUserId(userId))
      .then((profile) => {
        router.replace(profile ? '/upload' : '/onboarding');
      })
      .catch(() => {
        setLoginError('Nie udało się zalogować. Poproś o nowy link.');
      });
  }, [router, userId, secret]);

  const error = isMissingParams ? 'Nieprawidłowy link logowania.' : loginError;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      {error ? (
        <p className="text-base text-error">{error}</p>
      ) : (
        <p className="text-base text-slate">Logowanie...</p>
      )}
    </main>
  );
}
