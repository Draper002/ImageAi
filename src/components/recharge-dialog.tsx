"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircledIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/presets";
import { cn } from "@/lib/utils";

type RechargeButtonProps = {
  className?: string;
  label?: string;
  locale?: Locale;
};

type RechargePlan = "points" | "monthly";

const copy = {
  zh: {
    trigger: "充值积分",
    title: "充值积分",
    description: "第一版仅展示方案，不会发起真实支付。",
    close: "关闭",
    groupLabel: "充值方案",
    pointsPlan: "按量充值",
    pointsPrice: "1元1积分",
    monthlyPlan: "月度方案",
    monthlyPrice: "30元/月（内含50积分）",
    pointsDescription: "按实际需要购买积分，第一版先展示金额。",
    quantityLabel: "积分数量",
    amountDue: (points: number) => `应付金额：${points} 元`,
    monthlyDescription: "适合持续生成图片的用户。月付 30 元，内含 50 积分，支付能力后续接入。",
    disabledPay: "支付功能待接入"
  },
  en: {
    trigger: "Recharge credits",
    title: "Recharge credits",
    description: "The first version only previews plans and will not start a real payment.",
    close: "Close",
    groupLabel: "Recharge plans",
    pointsPlan: "Pay-as-you-go",
    pointsPrice: "1 yuan / credit",
    monthlyPlan: "Monthly plan",
    monthlyPrice: "30 yuan / month, includes 50 credits",
    pointsDescription: "Buy credits as needed. This version only previews the amount.",
    quantityLabel: "Credit quantity",
    amountDue: (points: number) => `Amount due: ${points} yuan`,
    monthlyDescription: "For users who generate images regularly. 30 yuan per month includes 50 credits. Payment will be connected later.",
    disabledPay: "Payment coming later"
  }
} satisfies Record<Locale, {
  trigger: string;
  title: string;
  description: string;
  close: string;
  groupLabel: string;
  pointsPlan: string;
  pointsPrice: string;
  monthlyPlan: string;
  monthlyPrice: string;
  pointsDescription: string;
  quantityLabel: string;
  amountDue: (points: number) => string;
  monthlyDescription: string;
  disabledPay: string;
}>;

export function RechargeButton({ className = "button primary", label, locale = "zh" }: RechargeButtonProps) {
  const t = copy[locale];
  const [selectedPlan, setSelectedPlan] = useState<RechargePlan>("points");
  const [points, setPoints] = useState(10);
  const pointAmount = Math.max(1, Number.isFinite(points) ? points : 1);

  return (
    <Dialog.Root onOpenChange={(open) => open && setSelectedPlan("points")}>
      <Dialog.Trigger asChild>
        <button className={className} type="button">
          {label ?? t.trigger}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-zinc-950/45 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[1.6rem] border border-white/20 bg-white p-5 shadow-[0_28px_90px_-34px_rgba(24,24,27,0.75)]"
        >
          <div className="section-title">
            <div>
              <Dialog.Title className="text-2xl font-semibold tracking-[-0.04em] text-zinc-950">
                {t.title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-zinc-500">
                {t.description}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="icon-button" type="button" aria-label={t.close}>
                <Cross2Icon className="mx-auto h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="recharge-options" role="group" aria-label={t.groupLabel}>
            <button
              className={cn("recharge-card recharge-plan", selectedPlan === "points" && "is-selected")}
              type="button"
              aria-pressed={selectedPlan === "points"}
              onClick={() => setSelectedPlan("points")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3>{t.pointsPlan}</h3>
                  <strong>{t.pointsPrice}</strong>
                </div>
                {selectedPlan === "points" ? <CheckCircledIcon className="h-5 w-5 text-emerald-700" /> : null}
              </div>
            </button>

            <button
              className={cn("recharge-card recharge-plan", selectedPlan === "monthly" && "is-selected")}
              type="button"
              aria-pressed={selectedPlan === "monthly"}
              onClick={() => setSelectedPlan("monthly")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3>{t.monthlyPlan}</h3>
                  <strong>{t.monthlyPrice}</strong>
                </div>
                {selectedPlan === "monthly" ? <CheckCircledIcon className="h-5 w-5 text-emerald-700" /> : null}
              </div>
            </button>
          </div>

          <div className="recharge-plan-detail">
            {selectedPlan === "points" ? (
              <>
                <p>{t.pointsDescription}</p>
                <label className="field-label mt-4" htmlFor="recharge-points">{t.quantityLabel}</label>
                <Input
                  id="recharge-points"
                  type="number"
                  min={1}
                  max={999}
                  value={pointAmount}
                  onChange={(event) => setPoints(Number(event.target.value))}
                />
                <p className="recharge-price">{t.amountDue(pointAmount)}</p>
              </>
            ) : (
              <p>{t.monthlyDescription}</p>
            )}
          </div>

          <Button className="mt-4 w-full" type="button" disabled variant="accent">
            {t.disabledPay}
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
