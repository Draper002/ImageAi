import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptCanvas | AI 图片生成工作台",
  description: "用可选参数自动组装专业prompt 的 AI 图片生成 SaaS。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-950 focus:shadow-lg" href="#main-content">
          跳到主要内容
        </a>
        {children}
      </body>
    </html>
  );
}
