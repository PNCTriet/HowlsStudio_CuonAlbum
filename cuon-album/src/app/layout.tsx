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
    title: "🎓 Album Tốt Nghiệp - Howls Studio",
    description: "Album ảnh tốt nghiệp đặc biệt - Lưu giữ những khoảnh khắc đáng nhớ của các em học sinh. Chúc mừng tốt nghiệp! 🎉",
    url: 'https://cuon-album.vercel.app',
    siteName: 'Cuốn Studio',
    images: [
      {
        url: '/graduation-icon.svg',
        width: 32,
        height: 32,
        alt: 'Album Tốt Nghiệp - Cuốn Studio',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "🎓 Album Tốt Nghiệp - Cuốn Studio",
    description: "Album ảnh tốt nghiệp đặc biệt - Lưu giữ những khoảnh khắc đáng nhớ của các em học sinh. Chúc mừng tốt nghiệp! 🎉",
    images: ['/graduation-icon.svg'],
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
  themeColor: '#3b82f6',
  colorScheme: 'dark',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
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
