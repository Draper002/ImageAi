import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircledIcon,
  ImageIcon,
  MagicWandIcon,
  MixerHorizontalIcon
} from "@radix-ui/react-icons";
import { LanguageSwitch } from "@/components/language-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/presets";

type HomeSearchParams = {
  locale?: string | string[];
};

type HomePageProps = {
  searchParams?: Promise<HomeSearchParams>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const copy = {
  zh: {
    login: "登录",
    start: "开始生成",
    eyebrow: "面向创作者和小团队的 AI 图片 SaaS",
    headline: "不会写复杂 prompt，也能稳定产出好图片",
    subhead: "选择图片类型、尺寸、风格、场景和留白要求，再写下主体。PromptCanvas 会把这些信息整理成专业prompt，并交给最先进的 GPT Image-2 生成图片。",
    trial: "免费试用 2 次",
    loginAccount: "登录账号",
    values: [
      "参数勾选替代复杂 prompt 记忆",
      "中文输入，自动生成可提交的专业 prompt",
      "支持比例、风格、场景、留白和参考图",
      "生成结果自动进入历史作品库"
    ],
    stack: ["商品图", "4:5", "真实摄影", "工作室", "顶部留白"],
    promptStackLabel: "提示词组合",
    promptExample: "生成一张高端商品图，使用工作室布光，控制负空间，呈现自然材质纹理...",
    examples: ["商品主图", "社媒封面", "海报视觉"],
    flow: "产品流程",
    flowTitle: "从中文想法到可提交英文 prompt",
    steps: [
      ["01", "选择画面结构", "图片类型、比例、风格、场景和留白要求都可选，不懂 prompt 也能控制方向。"],
      ["02", "补充主体和限制", "输入主体、补充要求，也可以上传参考图，让生成目标更稳定。"],
      ["03", "系统整理 prompt", "前端展示中文预览和英文参考，实际提交内容保持原语言信息。"],
      ["04", "生成并归档", "每生成一张扣 1 积分，结果进入历史作品库，方便复用和对比。"]
    ],
    ctaTitle: "先把第一张图跑通，再把好用的 prompt 流程固化下来",
    enter: "进入工作台"
  },
  en: {
    login: "Log in",
    start: "Start creating",
    eyebrow: "AI image SaaS for creators and small teams",
    headline: "Create usable AI images without writing complex prompts",
    subhead: "Choose image type, size, style, scene, and whitespace, then describe your subject. PromptCanvas turns the inputs into a professional prompt and sends it to the GPTImage API.",
    trial: "Try 2 credits free",
    loginAccount: "Log in",
    values: [
      "Guided controls instead of prompt memorization",
      "Write naturally, preview a production-ready prompt",
      "Control ratio, style, scene, whitespace, and references",
      "Generated images are saved to your library"
    ],
    stack: ["Product image", "4:5", "Realistic", "Studio", "Top whitespace"],
    promptStackLabel: "Prompt stack",
    promptExample: "Create a premium product image with studio lighting, controlled negative space, natural material texture...",
    examples: ["Product visual", "Social cover", "Poster concept"],
    flow: "Workflow",
    flowTitle: "From rough idea to production prompt",
    steps: [
      ["01", "Shape the frame", "Image type, ratio, style, scene, and whitespace are optional controls for direction."],
      ["02", "Add subject details", "Describe the subject, add constraints, or upload a reference image to stabilize the result."],
      ["03", "Assemble the prompt", "The UI shows a readable preview and keeps the submitted content faithful to your source language."],
      ["04", "Generate and archive", "Each image costs one credit and is saved to the history library for reuse and comparison."]
    ],
    ctaTitle: "Turn one useful generation into a repeatable image workflow",
    enter: "Open studio"
  }
} satisfies Record<Locale, {
  login: string;
  start: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  trial: string;
  loginAccount: string;
  values: string[];
  stack: string[];
  promptStackLabel: string;
  promptExample: string;
  examples: string[];
  flow: string;
  flowTitle: string;
  steps: string[][];
  ctaTitle: string;
  enter: string;
}>;

const images = [
  "https://picsum.photos/seed/promptcanvas-product/720/900",
  "https://picsum.photos/seed/promptcanvas-social/960/540",
  "https://picsum.photos/seed/promptcanvas-poster/900/600"
];

const icons = [MixerHorizontalIcon, ImageIcon, MagicWandIcon, CheckCircledIcon];

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : {};
  const locale: Locale = firstParam(params.locale) === "en" ? "en" : "zh";
  const t = copy[locale];

  return (
    <main id="main-content" className="shell overflow-hidden">
      <nav className="nav">
        <Link className="brand" href="/"><span className="logo">P</span>PromptCanvas</Link>
        <div className="nav-actions">
          <LanguageSwitch locale={locale} path="/" />
          <Button asChild variant="secondary"><Link href={`/login?locale=${locale}`}>{t.login}</Link></Button>
          <Button asChild variant="accent"><Link href={`/create?locale=${locale}`}>{t.start}</Link></Button>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100dvh-80px)] w-[min(1180px,calc(100%-2rem))] items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-5">{t.eyebrow}</Badge>
          <h1 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-zinc-950 md:text-7xl">
            {t.headline}
          </h1>
          <p className="mt-6 max-w-[62ch] text-lg leading-8 text-zinc-600">{t.subhead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href={`/create?locale=${locale}`}>{t.trial} <ArrowRightIcon /></Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={`/login?locale=${locale}`}>{t.loginAccount}</Link>
            </Button>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {t.values.map((value) => (
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700" key={value}>
                <CheckCircledIcon className="h-4 w-4 text-emerald-700" />
                {value}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 top-12 hidden h-24 w-24 rounded-[2rem] bg-emerald-100 blur-2xl lg:block" />
          <div className="relative rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-[0_34px_90px_-54px_rgba(24,24,27,0.75)] backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[0.78fr_1fr]">
              <div className="rounded-[1.4rem] bg-zinc-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">{t.promptStackLabel}</span>
                  <MagicWandIcon className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="mt-6 space-y-3">
                  {t.stack.map((item) => (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-sm" key={item}>{item}</div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-emerald-500/12 p-3 text-xs leading-5 text-emerald-100">
                  {t.promptExample}
                </div>
              </div>
              <div className="grid gap-3">
                <img
                  className="aspect-[4/3] rounded-[1.35rem] object-cover"
                  src="https://picsum.photos/seed/promptcanvas-hero/920/690"
                  alt={locale === "en" ? "PromptCanvas generated image preview" : "PromptCanvas 示例生成图预览"}
                />
                <div className="grid grid-cols-3 gap-3">
                  {t.examples.map((example, index) => (
                    <div className="overflow-hidden rounded-[1rem] bg-zinc-100" key={example}>
                      <img className="aspect-square object-cover" src={images[index]} alt={example} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(1180px,calc(100%-2rem))] py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge>{t.flow}</Badge>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] text-zinc-950 md:text-5xl">
              {t.flowTitle}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {t.steps.map(([step, title, desc], index) => {
              const Icon = icons[index];
              return (
                <article className="rounded-[1.5rem] border border-zinc-200/80 bg-white/80 p-5 shadow-[0_22px_60px_-48px_rgba(24,24,27,0.65)]" key={step}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-zinc-400">{step}</span>
                    <Icon className="h-5 w-5 text-emerald-700" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-zinc-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto mb-8 w-[min(1180px,calc(100%-2rem))] rounded-[2rem] bg-zinc-950 p-6 text-white md:p-10">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-300">PromptCanvas</p>
            <h2 className="mt-3 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
              {t.ctaTitle}
            </h2>
          </div>
          <Button asChild size="lg" variant="accent">
            <Link href={`/create?locale=${locale}`}>{t.enter} <ArrowRightIcon /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
