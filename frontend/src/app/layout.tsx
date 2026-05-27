import type { Metadata } from "next";
import { Playfair_Display, Noto_Serif_SC, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  style: ["italic", "normal"],
  weight: ["700", "800"],
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  variable: "--font-serif-cn",
  weight: ["400", "600"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: `${APP_NAME} - 电影片场抓拍生成器`,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`h-full antialiased ${inter.variable} ${playfair.variable} ${notoSerifSC.variable} ${geistMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-hollywood-cream text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
