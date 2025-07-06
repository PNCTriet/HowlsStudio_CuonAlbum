import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🎓 Album Tốt Nghiệp",
  description: "Album ảnh tốt nghiệp đặc biệt - Lưu giữ những khoảnh khắc đáng nhớ của các em học sinh. Chúc mừng tốt nghiệp! 🎉",
  keywords: ["tốt nghiệp", "graduation", "album", "ảnh", "cuốn studio", "banh cuon"],
  authors: [{ name: "Cuốn Studio", url: "https://www.instagram.com/banhcuonniengrang/" }],
  creator: "Cuốn Studio",
  publisher: "Cuốn Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cuon-album.vercel.app'),
  openGraph: {
    title: "🎓 Album Tốt Nghiệp - 2025",
    description: "Album ảnh tốt nghiệp đặc biệt - Lưu giữ những khoảnh khắc đáng nhớ của các em học sinh. Chúc mừng tốt nghiệp! 🎉",
    url: 'https://cuon-album.vercel.app',
    siteName: 'Howls Studio',
    images: [
      {
        url: 'https://cimvwqfnbrikogsyaqic.supabase.co/storage/v1/object/public/test//graduation.jpg',
        width: 1200,
        height: 630,
        alt: 'Graduates of 2025 - Hoa Sen University',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "🎓 Album Tốt Nghiệp - Cuốn Studio",
    description: "Album ảnh tốt nghiệp đặc biệt - Lưu giữ những khoảnh khắc đáng nhớ của các em học sinh. Chúc mừng tốt nghiệp! 🎉",
    images: ['/thumb.jpg'],
    creator: '@banhcuonniengrang',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/graduation-icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/graduation-icon.svg',
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
