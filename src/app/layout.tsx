import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: {
    default: "공구마켓 — 매일 새로운 공동구매",
    template: "%s | 공구마켓",
  },
  description:
    "매일 엄선된 상품을 공동구매 특가로 만나보세요. 최대 50% 할인, 한정 수량 공구 진행중!",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "공구마켓",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-orange-600">
              공구마켓
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/deals"
                className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                공구 목록
              </Link>
              <Link
                href="/admin"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                관리자
              </Link>
            </div>
          </nav>
        </header>

        <main className="min-h-screen">{children}</main>

        <footer className="bg-white border-t border-gray-200 py-8 mt-12">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} 공구마켓. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
