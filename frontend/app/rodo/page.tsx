import Link from 'next/link';

export default function RodoPage() {
  return (
    <main className="flex flex-1 flex-col overflow-y-auto px-6.5 py-10">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6">
        <Link href="/" className="text-sm text-accent-dark underline">
          &larr; Powrót
        </Link>

        <h1 className="font-heading text-3xl leading-tight">
          Informacja o przetwarzaniu danych osobowych
        </h1>

        <div className="flex flex-col gap-5 text-sm leading-relaxed text-ink-soft">
          <section className="flex flex-col gap-1.5">
            <h2 className="font-heading text-lg text-ink">Administrator danych</h2>
            <p>
              Administratorem danych osobowych jest Tomasz Lipowiec, kontakt:{' '}
              <a href="mailto:lipowiectomasz@gmail.com" className="text-accent-dark underline">
                lipowiectomasz@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="font-heading text-lg text-ink">Jakie dane przetwarzamy</h2>
            <p>
              Zdjęcia dodane przez Ciebie do galerii weselnej oraz dane niezbędne do
              zalogowania: adres e-mail lub dane konta Google (imię, nazwisko, adres e-mail,
              zdjęcie profilowe) udostępnione przez dostawcę logowania.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="font-heading text-lg text-ink">Cel i podstawa przetwarzania</h2>
            <p>
              Dane przetwarzamy w celu utworzenia i udostępnienia wspólnej galerii zdjęć z
              uroczystości weselnej gościom wesela, na podstawie Twojej dobrowolnej zgody
              (art. 6 ust. 1 lit. a RODO), wyrażonej przy logowaniu.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="font-heading text-lg text-ink">Odbiorcy danych</h2>
            <p>
              Zdjęcia w galerii są widoczne dla innych gości wesela zalogowanych do serwisu.
              Dane techniczne przetwarza dostawca infrastruktury hostingowej wykorzystywanej do
              działania serwisu.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="font-heading text-lg text-ink">Okres przechowywania</h2>
            <p>
              Zdjęcia i dane konta przechowujemy do czasu zakończenia obsługi galerii
              weselnej lub do momentu wycofania zgody, w zależności od tego, co nastąpi
              wcześniej.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="font-heading text-lg text-ink">Twoje prawa</h2>
            <p>
              Masz prawo do dostępu do swoich danych, ich sprostowania, usunięcia,
              ograniczenia przetwarzania, przenoszenia oraz wycofania zgody w dowolnym
              momencie, a także wniesienia skargi do Prezesa Urzędu Ochrony Danych
              Osobowych. W celu usunięcia zdjęć lub konta skontaktuj się pod adresem{' '}
              <a href="mailto:lipowiectomasz@gmail.com" className="text-accent-dark underline">
                lipowiectomasz@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
