import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "華ちゃんのフォトアルバム 🌸",
  description: "家族専用の華ちゃんの成長記録フォトアルバム",
  keywords: ["フォトアルバム", "家族", "成長記録", "写真", "華ちゃん"],
  authors: [{ name: "華ちゃんファミリー" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fce7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#7a1d8a" },
  ],
  // manifest: "/manifest.json", // 一時的に無効化
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "華ちゃんのアルバム",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={nunito.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${nunito.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
