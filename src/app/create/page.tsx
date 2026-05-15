import Link from "next/link";
import { CreditBadge } from "@/components/credit-badge";
import { CreateForm } from "@/components/create-form";
import { requireUser } from "@/lib/auth";
import { hasSupabasePublicConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  let credits = 2;
  let locale: "zh" | "en" = "zh";

  if (hasSupabasePublicConfig()) {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("credit_balance, locale")
      .eq("user_id", user.id)
      .single();
    credits = data?.credit_balance ?? 0;
    locale = data?.locale === "en" ? "en" : "zh";
  }

  return (
    <main className="app-grid">
      <aside className="sidebar">
        <div className="brand"><span className="logo">P</span>PromptCanvas</div>
        <nav className="side-nav">
          <Link className="active" href="/create">生成图片</Link>
          <Link href="/history">历史记录</Link>
          <Link href="/upgrade">升级积分</Link>
        </nav>
        <CreditBadge credits={credits} />
      </aside>
      <section className="workspace">
        <div className="workspace-header">
          <div>
            <h1>创建图片</h1>
            <p>只填写主体也可以生成，其余选项都是可选增强项。</p>
          </div>
          <Link className="button secondary" href="/history">历史记录</Link>
        </div>
        <div className="create-layout">
          <CreateForm locale={locale} credits={credits} />
          <div className="result-canvas" aria-label="生成结果预览区域" />
        </div>
      </section>
    </main>
  );
}
