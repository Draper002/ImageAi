import Link from "next/link";
import { CheckCircledIcon, ClockIcon, DashboardIcon, ImageIcon } from "@radix-ui/react-icons";
import { AccountMenu } from "@/components/account-menu";
import { LanguageSwitch } from "@/components/language-switch";
import { RechargeButton } from "@/components/recharge-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { hasSupabasePublicConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AccountStats = {
  credits: number;
  email: string;
  locale: "zh" | "en";
  generationCount: number;
  successCount: number;
  failedCount: number;
  joinedAt: string;
};

export default async function AccountPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <AccountDashboard
        stats={{
          credits: 2,
          email: "本地预览用户",
          locale: "zh",
          generationCount: 0,
          successCount: 0,
          failedCount: 0,
          joinedAt: new Date().toISOString()
        }}
      />
    );
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("credit_balance, locale, created_at")
    .eq("user_id", user.id)
    .single();
  const { data: generations } = await supabase
    .from("generations")
    .select("id, status")
    .eq("user_id", user.id);

  const items = generations ?? [];
  return (
    <AccountDashboard
      stats={{
        credits: profile?.credit_balance ?? 0,
        email: user.email ?? "未设置邮箱",
        locale: profile?.locale === "en" ? "en" : "zh",
        generationCount: items.length,
        successCount: items.filter((item) => item.status === "succeeded").length,
        failedCount: items.filter((item) => item.status === "failed").length,
        joinedAt: profile?.created_at ?? user.created_at ?? new Date().toISOString()
      }}
    />
  );
}

function AccountDashboard({ stats }: { stats: AccountStats }) {
  const successRate = stats.generationCount > 0 ? Math.round((stats.successCount / stats.generationCount) * 100) : 0;

  return (
    <main id="main-content" className="min-h-[100dvh] px-4 py-5">
      <div className="mx-auto max-w-[1180px]">
        <header className="relative z-30 overflow-visible rounded-[2rem] border border-white/70 bg-white/78 p-5 shadow-[0_28px_80px_-62px_rgba(24,24,27,0.72)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge variant="accent">Dashboard</Badge>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-zinc-950 md:text-5xl">账户概览</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">查看当前积分、生成状态和账户入口。支付和订阅能力仍是预留展示。</p>
            </div>
            <div className="header-actions">
              <LanguageSwitch locale={stats.locale} path="/account" />
              <Button asChild variant="secondary"><Link href="/history">作品库</Link></Button>
              <Button asChild variant="accent"><Link href="/create">创建图片</Link></Button>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            { label: "当前积分", value: stats.credits, Icon: DashboardIcon },
            { label: "生成总数", value: stats.generationCount, Icon: ImageIcon },
            { label: "成功率", value: `${successRate}%`, Icon: CheckCircledIcon },
            { label: "失败记录", value: stats.failedCount, Icon: ClockIcon }
          ].map(({ label, value, Icon }) => (
            <article className="rounded-[1.5rem] border border-zinc-200/80 bg-white/80 p-5 shadow-[0_22px_60px_-50px_rgba(24,24,27,0.7)]" key={label}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-500">{label}</span>
                <Icon className="h-5 w-5 text-emerald-700" />
              </div>
              <strong className="mt-6 block font-mono text-4xl tracking-[-0.06em] text-zinc-950">{value}</strong>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
          <article className="rounded-[1.8rem] border border-zinc-200/80 bg-white/82 p-6 shadow-[0_28px_80px_-60px_rgba(24,24,27,0.72)]">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">账号信息</h2>
            <div className="mt-6 divide-y divide-zinc-200 text-sm">
              <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
                <span className="font-semibold text-zinc-500">邮箱</span>
                <span className="break-all text-zinc-950">{stats.email}</span>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
                <span className="font-semibold text-zinc-500">界面语言</span>
                <span className="text-zinc-950">{stats.locale === "zh" ? "中文" : "English"}</span>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
                <span className="font-semibold text-zinc-500">注册时间</span>
                <span className="text-zinc-950">{new Date(stats.joinedAt).toLocaleString("zh-CN")}</span>
              </div>
            </div>
          </article>

          <article className="rounded-[1.8rem] bg-zinc-950 p-6 text-white shadow-[0_28px_80px_-58px_rgba(24,24,27,0.9)]">
            <h2 className="text-2xl font-semibold tracking-tight">充值入口</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">按量充值和月度方案已作为前端入口展示，后续接入真实支付后可复用这块区域。</p>
            <RechargeButton className="button primary mt-6 w-full" locale={stats.locale} />
          </article>
        </section>
      </div>
      <AccountMenu email={stats.email} credits={stats.credits} locale={stats.locale} />
    </main>
  );
}
