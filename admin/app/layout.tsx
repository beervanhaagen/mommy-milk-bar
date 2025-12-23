import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mommy Milk Bar',
  description: 'Safe drinking calculator for breastfeeding mothers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
