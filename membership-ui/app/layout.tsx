import type { Metadata } from 'next';
import { Instrument_Serif, IBM_Plex_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display-loaded',
  display: 'swap',
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Private Membership',
    template: '%s · Private Membership',
  },
  description:
    'Enterprise private allowlist access on Midnight — prove membership without revealing secrets or identity.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
