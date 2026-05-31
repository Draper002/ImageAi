import Link from "next/link";
import { LanguageSwitch } from "@/components/language-switch";
import { RechargeButton } from "@/components/recharge-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  return (
    <main id="main-content" className="min-h-[100dvh] px-4 py-5">
      <div className="mx-auto max-w-[980px]">
        <header className="relative z-30 overflow-visible rounded-[2rem] border border-white/70 bg-white/78 p-5 shadow-[0_28px_80px_-62px_rgba(24,24,27,0.72)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge variant="accent">Credits</Badge>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-zinc-950 md:text-5xl">充值积分</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">真实支付将在后续版本接入，第一版先保留充值入口和方案展示。</p>
            </div>
            <div className="header-actions">
              <LanguageSwitch locale="zh" path="/upgrade" />
              <Button asChild variant="secondary"><Link href="/create">返回生成页</Link></Button>
            </div>
          </div>
        </header>
        <section className="mt-5 rounded-[2rem] bg-zinc-950 p-6 text-white md:p-10">
          <p className="text-sm font-semibold text-emerald-300">PromptCanvas credits</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.055em]">按量购买或选择月度方案</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-300">当前版本不会发起真实支付。点击按钮可预览方案弹窗。</p>
          <RechargeButton className="button primary mt-6" locale="zh" />
        </section>
      </div>
    </main>
  );
}
