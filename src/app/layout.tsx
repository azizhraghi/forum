import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const description =
  'Le 9e Forum ENSTAB explore la souveraineté énergétique. Rendez-vous le 25 novembre 2026 à l’ENSTAB, Borj Cédria.';
const poster = '/assets/forum/official-poster.jpg';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://forum.enstab.tn'
  ),
  title: 'Forum ENSTAB 2026 — Energy Sovereignty in Action',
  description,
  icons: { icon: '/assets/forum/forum-cube.webp' },
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    siteName: 'Forum ENSTAB 2026',
    title: 'Forum ENSTAB 2026 — Energy Sovereignty in Action',
    description,
    images: [{ url: poster, width: 1080, height: 1350, alt: 'Affiche du 9e Forum ENSTAB' }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
