import Link from "next/link";
import { LanguageSwitch } from "@/components/language-switch";

export default function HomePage() {
  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand"><span className="logo">P</span>PromptCanvas</div>
        <div style={{ display: "flex", gap: 10 }}>
          <LanguageSwitch locale="zh" />
          <Link className="button secondary" href="/login">登录</Link>
          <Link className="button primary" href="/create">开始生成</Link>
        </div>
      </nav>
      <section className="hero">
        <div>
          <h1>不用写复杂提示词，也能生成更稳定的 AI 图片。</h1>
          <p>填写主体，按需选择类型、比例、风格、场景和留白要求。系统会整理成结构化提示词，也支持上传 1 张参考图。</p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link className="button primary" href="/create">免费试用 2 次</Link>
            <Link className="button secondary" href="/login">登录账号</Link>
          </div>
        </div>
        <div className="result-canvas" aria-label="AI image preview" />
      </section>
    </main>
  );
}
