import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import LineFloatingWidget from "@/components/layout/LineFloatingWidget";
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
  title: "南一 AI 教學助手",
  description: "AI 驅動的教學輔助平台 - 自動生成評量、漫畫、學習單、Podcast",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-gray-300 py-5 text-center text-base leading-relaxed" style={{ backgroundColor: "#666", color: "#ddd" }}>
          <p>本系統建議使用chrome、firefox瀏覽器</p>
          <p>南一書局企業股份有限公司Copyright &copy; 2017 NANI BOOK ENTERPRISE CO.,LTD. All Rights Reserved.</p>
        </footer>
        <LineFloatingWidget />
      </body>
    </html>
  );
}
