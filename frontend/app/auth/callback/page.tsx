'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { completeMagicLinkSession } from '@/lib/magic-link-auth';
import { findProfileByUserId } from '@/lib/profile-repository';
import { getCurrentUser } from '@/lib/current-user';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginError, setLoginError] = useState<string | null>(null);

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  useEffect(() => {
    async function completeLogin() {
      if (userId && secret) {
        await completeMagicLinkSession(userId, secret);
      }

      const user = await getCurrentUser();
      if (!user) {
        setLoginError('Nie udało się zalogować. Poproś o nowy link.');
        return;
      }

      const profile = await findProfileByUserId(user.$id);
      router.replace(profile ? '/upload' : '/onboarding');
    }

    completeLogin().catch(() => {
      setLoginError('Nie udało się zalogować. Poproś o nowy link.');
    });
  }, [router, userId, secret]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      {loginError ? (
        <p className="text-base text-error">{loginError}</p>
      ) : (
        <p className="text-base text-slate">Logowanie...</p>
      )}
    </main>
  );
}
