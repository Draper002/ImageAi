import Link from "next/link";
import { DashboardIcon, ImageIcon, LayersIcon } from "@radix-ui/react-icons";
import { AccountMenu } from "@/components/account-menu";
import { CreditBadge } from "@/components/credit-badge";
import { CreateForm } from "@/components/create-form";
import { LanguageSwitch } from "@/components/language-switch";
import { RechargeButton } from "@/components/recharge-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { hasSupabasePublicConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/presets";

export const dynamic = "force-dynamic";

type CreateSearchParams = {
  locale?: string | string[];
};

type CreatePageProps = {
  searchParams?: Promise<CreateSearchParams>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const copy = {
  zh: {
    localUser: "本地预览用户",
    noEmail: "未设置邮箱",
    navCreate: "生成图片",
    navHistory: "历史记录",
    navAccount: "账户概览",
    statusTitle: "工作台状态",
    statusDescPrimary: "只填写主体也可以生成。",
    statusDescSecondary: "可选项是为了提高稳定性。",
    title: "创建图片",
    desc: "左侧配置生成目标，右侧实时预览当前提示词和生成进展。",
    history: "历史记录"
  },
  en: {
    localUser: "Local preview user",
    noEmail: "No email set",
    navCreate: "Create image",
    navHistory: "History",
    navAccount: "Account",
    statusTitle: "Studio status",
    statusDescPrimary: "The subject alone is enough to generate.",
    statusDescSecondary: "Every option is an optional stabilizer.",
    title: "Create image",
    desc: "Configure the goal on the left. Preview the current prompt and generation progress on the right.",
    history: "History"
  }
} satisfies Record<Locale, Record<string, string>>;

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const params = searchParams ? await searchParams : {};
  let credits = 2;
  let locale: Locale = firstParam(params.locale) === "en" ? "en" : "zh";
  let email = copy[locale].localUser;

  if (hasSupabasePublicConfig()) {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("credit_balance, locale")
      .eq("user_id", user.id)
      .single();
    credits = data?.credit_balance ?? 0;
    const requestedLocale = firstParam(params.locale);
    locale = requestedLocale === "en" ? "en" : requestedLocale === "zh" ? "zh" : data?.locale === "en" ? "en" : "zh";
    email = user.email ?? copy[locale].noEmail;
  }
  const t = copy[locale];

  return (
    <main id="main-content" className="create-shell min-h-[100dvh] px-2 py-2 md:px-3 lg:px-4">
      <div className="create-layout mx-auto grid items-stretch gap-2.5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="create-sidebar rounded-[1.35rem] border border-white/70 bg-white/80 p-2.5 shadow-[0_30px_80px_-60px_rgba(24,24,27,0.75)] backdrop-blur-xl lg:sticky lg:top-2 lg:self-stretch">
          <Link className="brand" href="/"><span className="logo">P</span>PromptCanvas</Link>
          <nav className="mt-5 grid gap-1">
            <Link className="flex items-center gap-3 rounded-[0.85rem] bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800" href={`/create?locale=${locale}`}>
              <DashboardIcon />{t.navCreate}
            </Link>
            <Link className="flex items-center gap-3 rounded-[0.85rem] px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950" href={`/history?locale=${locale}`}>
              <ImageIcon />{t.navHistory}
            </Link>
            <Link className="flex items-center gap-3 rounded-[0.85rem] px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950" href={`/account?locale=${locale}`}>
              <LayersIcon />{t.navAccount}
            </Link>
            <RechargeButton className="side-nav-button rounded-[0.85rem] px-3 py-2 text-left text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950" locale={locale} />
          </nav>
          <div className="mt-4">
            <CreditBadge credits={credits} locale={locale} />
          </div>
          <div className="mt-4 rounded-[1rem] bg-zinc-950 p-3 text-white">
            <p className="text-xs font-semibold text-zinc-400">{t.statusTitle}</p>
            <div className="mt-1.5 grid gap-1 text-sm leading-5 text-zinc-200">
              <p>{t.statusDescPrimary}</p>
              <p>{t.statusDescSecondary}</p>
            </div>
          </div>
          <AccountMenu email={email} credits={credits} locale={locale} placement="sidebar" />
        </aside>

        <section className="create-workspace">
          <div className="create-header-card relative z-30 mb-2.5 overflow-visible rounded-[1.35rem] border border-white/70 bg-white/72 p-3 shadow-[0_28px_80px_-60px_rgba(24,24,27,0.75)] backdrop-blur-xl">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <Badge variant="accent">Studio</Badge>
                <h1 className="mt-1.5 text-balance text-2xl font-semibold tracking-[-0.055em] text-zinc-950 md:text-3xl">{t.title}</h1>
                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-zinc-600 md:text-sm">
                  {t.desc}
                </p>
              </div>
              <div className="header-actions">
                <LanguageSwitch locale={locale} path="/create" />
                <Button asChild variant="secondary"><Link href={`/history?locale=${locale}`}>{t.history}</Link></Button>
              </div>
            </div>
          </div>
          <CreateForm locale={locale} credits={credits} />
        </section>
      </div>
    </main>
  );
}
