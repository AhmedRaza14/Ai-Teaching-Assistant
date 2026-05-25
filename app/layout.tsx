import type { Metadata } from 'next';
// @ts-ignore: allow importing global CSS without type declarations
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Teacher — Exam Prep',
  description: 'Upload PDF, get Hinglish lecture, English summary & chat!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}