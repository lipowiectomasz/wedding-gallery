import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Karla } from 'next/font/google';
import './globals.css';

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

const karla = Karla({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Galeria weselna',
  description: 'Zrób zdjęcie i dodaj je do wspólnej galerii.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f4f1ea',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${cormorantGaramond.variable} ${karla.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden bg-paper text-ink font-body">
        {children}
      </body>
    </html>
  );
}
