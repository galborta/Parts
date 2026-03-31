import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Baseline - Daily Burnout Recovery',
  description: 'Three short voice sessions a day that track your recovery across energy, meaning, and capability.',
  keywords: ['burnout recovery', 'coaching', 'voice AI', 'performance', 'wellbeing'],
  openGraph: {
    title: 'Baseline',
    description: 'Recover from burnout. Three voice sessions a day.',
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f0c1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}` }} />
      </body>
    </html>
  );
}
