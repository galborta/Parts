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
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
