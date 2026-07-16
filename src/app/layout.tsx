//src/app/layout.tsx

import type { Metadata } from "next";
import { Inter, Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSans = Noto_Sans_Myanmar({
  weight: ["400", "500", "700", "900"],
  subsets: ["myanmar"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PartTimeMM",
  description: "Part time jobs in Myanmar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}