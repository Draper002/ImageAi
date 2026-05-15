import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptCanvas",
  description: "Guided AI image generation with credits and history."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
