import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Free Learning Platforms',
  description: 'Access your favourite educational platforms from one place. 100% Free.',
  openGraph: {
    title: 'Free Learning Platforms',
    description: 'Access your favourite educational platforms from one place. 100% Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Learning Platforms',
    description: 'Access your favourite educational platforms from one place. 100% Free.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
