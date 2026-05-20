import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ClearMe - 내 개인정보, 안전하게 지키세요",
  description:
    "인터넷에 노출된 내 개인정보를 스캔하고 삭제하세요. 클리어미가 안전한 디지털 생활을 도와드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[var(--font-dm-sans)]">
        {children}
      </body>
    </html>
  );
}
