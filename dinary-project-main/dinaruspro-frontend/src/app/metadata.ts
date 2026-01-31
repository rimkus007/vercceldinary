import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Dinary Pro',
  description: 'Progressive Web App for Algerian merchants',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dinary Pro',
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' }
  ],
};