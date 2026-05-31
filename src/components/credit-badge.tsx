import { LightningBoltIcon } from "@radix-ui/react-icons";
import type { Locale } from "@/lib/presets";

const copy = {
  zh: {
    label: "当前积分",
    helper: "每生成一张图片扣 1 积分"
  },
  en: {
    label: "Current credits",
    helper: "Each image costs 1 credit"
  }
} satisfies Record<Locale, Record<string, string>>;

export function CreditBadge({ credits, locale = "zh" }: { credits: number; locale?: Locale }) {
  const t = copy[locale];

  return (
    <div className="rounded-[1.35rem] border border-emerald-900/10 bg-emerald-50/80 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900/75">
        <LightningBoltIcon className="h-4 w-4" />
        {t.label}
      </div>
      <strong className="mt-3 block font-mono text-4xl tracking-[-0.05em] text-emerald-900">{credits}</strong>
      <p className="mt-1 text-xs leading-5 text-emerald-900/60">{t.helper}</p>
    </div>
  );
}
