'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FloralDecoration } from '@/components/floral-decoration';
import { PrimaryButton } from '@/components/primary-button';
import { getCurrentUser } from '@/lib/current-user';
import { getDeviceId } from '@/lib/device-id';
import { createProfile } from '@/lib/profile-repository';

export default function OnboardingPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) {
        router.replace('/');
      }
    });
  }, [router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const user = await getCurrentUser();
      if (!user) {
        router.replace('/');
        return;
      }

      const fullName = `${firstName} ${lastName}`.trim();
      await createProfile(user.$id, fullName, getDeviceId());
      router.push('/upload');
    } catch {
      setError('Nie udało się zapisać danych. Spróbuj ponownie.');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <FloralDecoration position="bottom-right-mirrored" />

      <form
        onSubmit={handleSubmit}
        className="relative mx-auto flex w-full max-w-[350px] flex-1 flex-col gap-6.5 px-7.5 pt-21"
      >
        <div className="flex flex-col gap-2.5">
          <h1 className="font-heading text-4xl leading-tight">
            Jak się
            <br />
            przedstawisz?
          </h1>
          <p className="text-sm leading-relaxed text-slate">
            Podpiszemy tak Twoje zdjęcia w galerii. Nic więcej nie musisz wypełniać.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wider text-sage uppercase">Imię</span>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
              className="h-14.5 rounded-2xl border-[1.5px] border-accent bg-white px-4 text-lg text-ink shadow-[0_0_0_4px_rgba(107,164,206,0.15)] outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wider text-sage uppercase">
              Nazwisko
            </span>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
              className="h-14.5 rounded-2xl border border-border-soft bg-white px-4 text-lg text-ink outline-none"
            />
          </label>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="relative mt-auto pb-8.5">
          <PrimaryButton type="submit" disabled={isSubmitting} className="w-full">
            Dalej
          </PrimaryButton>
        </div>
      </form>
    </main>
  );
}
