import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { HistoryGrid } from "@/components/history-grid";
import { LanguageSwitch } from "@/components/language-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { hasSupabasePublicConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <main id="main-content" className="min-h-[100dvh] px-4 py-5">
        <HistoryShell locale="zh" email="本地预览用户" credits={2} items={[]} />
      </main>
    );
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("credit_balance, locale")
    .eq("user_id", user.id)
    .single();
  const { data } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const credits = profile?.credit_balance ?? 0;
  const locale = profile?.locale === "en" ? "en" : "zh";
  const email = user.email ?? "未设置邮箱";

  const items = await Promise.all((data ?? []).map(async (item) => {
    const signed = item.generated_image_path
      ? await supabase.storage.from("generated-images").createSignedUrl(item.generated_image_path, 600)
      : { data: null };
    return { ...item, imageUrl: signed.data?.signedUrl ?? null };
  }));

  return (
    <main id="main-content" className="min-h-[100dvh] px-4 py-5">
      <HistoryShell locale={locale} email={email} credits={credits} items={items} />
    </main>
  );
}

function HistoryShell({
  credits,
  email,
  items,
  locale
}: {
  credits: number;
  email: string;
  items: Parameters<typeof HistoryGrid>[0]["items"];
  locale: "zh" | "en";
}) {
  return (
    <div className="mx-auto max-w-[1320px]">
      <header className="relative z-30 mb-6 overflow-visible rounded-[2rem] border border-white/70 bg-white/78 p-5 shadow-[0_28px_80px_-62px_rgba(24,24,27,0.72)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="accent">Library</Badge>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-zinc-950 md:text-5xl">生成历史</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">按时间倒序展示作品。这里不做表格，把每次生成都当成可复用的视觉资产。</p>
          </div>
          <div className="header-actions">
            <LanguageSwitch locale={locale} path="/history" />
            <Button asChild variant="accent"><Link href="/create">继续生成</Link></Button>
          </div>
        </div>
      </header>
      <HistoryGrid items={items} />
      <AccountMenu email={email} credits={credits} locale={locale} />
    </div>
  );
}
