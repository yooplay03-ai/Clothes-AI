import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'MoodFit — AI Outfit Recommendations',
    template: '%s | MoodFit',
  },
  description:
    'Discover outfit recommendations tailored to your mood, weather, and personal style using AI.',
  keywords: ['outfit', 'fashion', 'AI', 'wardrobe', 'style', 'clothing', 'recommendation'],
  authors: [{ name: 'MoodFit Team' }],
  openGraph: {
    title: 'MoodFit — AI Outfit Recommendations',
    description: 'Your AI-powered personal stylist. Get outfit recommendations based on weather, mood, and occasions.',
    type: 'website',
    url: 'https://moodfit.app',
  },
};

export const viewport: Viewport = {
  themeColor: '#d946ef',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
