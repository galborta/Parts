import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Parts - IFS Therapy Companion',
  description: 'Talk to your inner parts. Hear them talk back. Powered by ElevenLabs voice AI.',
  keywords: ['IFS', 'Internal Family Systems', 'therapy', 'mental health', 'voice AI'],
  openGraph: {
    title: 'Parts',
    description: 'Talk to your inner parts. Hear them talk back.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
