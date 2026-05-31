"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { CheckCircledIcon, ImageIcon, MagicWandIcon, MixIcon } from "@radix-ui/react-icons";
import { buildPrompt } from "@/lib/prompt-builder";
import {
  aspectRatios,
  imageTypes,
  scenes,
  styles,
  whitespaceOptions,
  type Locale
} from "@/lib/presets";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { AspectRatioOption } from "./aspect-ratio-option";
import { RechargeButton } from "./recharge-dialog";

type GenerateResponse = {
  error?: string;
  id?: string;
  imageUrl?: string | null;
  status?: string;
};

const formCopy = {
  zh: {
    authExpired: "登录状态已过期，请重新登录后再生成。",
    insufficientCredits: "积分不足，请先充值积分。",
    generationFailed: "生成失败，请检查 OpenAI 配置、模型权限或稍后重试。",
    genericFailed: "生成失败，请稍后重试。",
    networkFailed: "网络请求失败，请确认本地服务正在运行后再试。",
    success: "生成成功，图片已保存到历史记录。",
    fallbackSubject: "一只穿着宇航服的橘猫",
    subjectTitle: "1. 描述主体",
    required: "必填",
    optional: "可选",
    subjectHelp: "写清楚图片主体即可，其它信息可以交给下面的参数补足。",
    subjectLabel: "主体，例如：一只穿着宇航服的橘猫，站在月球咖啡馆门口",
    subjectPlaceholder: "例如：一只穿着宇航服的橘猫，站在月球咖啡馆门口",
    optionsTitle: "2. 可选参数",
    imageType: "图片类型",
    aspectRatio: "画面比例",
    style: "风格",
    scene: "场景",
    whitespace: "留白 / 构图",
    referenceTitle: "3. 参考图与补充要求",
    selectedReference: "已选择参考图",
    uploadReference: "上传参考图，可选",
    additionalLabel: "补充要求，例如：不要出现乱码文字、水印或低清细节。",
    additionalPlaceholder: "补充要求，例如：不要出现乱码文字、水印或低清细节。",
    recharge: "积分不足，充值积分",
    generating: "生成中...",
    generate: "生成图片",
    outputAria: "提示词预览和生成进展",
    zhPreview: "中文预览",
    previewHelp: "默认折叠复杂度，用户无需理解英文 prompt。",
    submitted: "实际提交内容",
    progress: "生成进展",
    progressHelp: "结果、错误和空状态都在这里反馈。",
    credits: "积分",
    result: "生成结果",
    history: "查看历史",
    waiting: "等待生成",
    emptyHelp: "填写主体后点击生成图片，成品图会显示在这里，并保存到历史作品库。"
  },
  en: {
    authExpired: "Your login session has expired. Please log in again before generating.",
    insufficientCredits: "Not enough credits. Please recharge first.",
    generationFailed: "Generation failed. Check OpenAI configuration, model access, or try again later.",
    genericFailed: "Generation failed. Please try again later.",
    networkFailed: "Network request failed. Make sure the local service is running and try again.",
    success: "Generation succeeded. The image has been saved to history.",
    fallbackSubject: "An orange cat in an astronaut suit",
    subjectTitle: "1. Describe subject",
    required: "Required",
    optional: "Optional",
    subjectHelp: "Describe the image subject. The optional controls below can add structure.",
    subjectLabel: "Subject, for example: an orange cat in an astronaut suit outside a moon cafe",
    subjectPlaceholder: "Example: an orange cat in an astronaut suit outside a moon cafe",
    optionsTitle: "2. Optional controls",
    imageType: "Image type",
    aspectRatio: "Aspect ratio",
    style: "Style",
    scene: "Scene",
    whitespace: "Whitespace / composition",
    referenceTitle: "3. Reference and details",
    selectedReference: "Reference image selected",
    uploadReference: "Upload reference image, optional",
    additionalLabel: "Additional requirements, for example: avoid garbled text, watermarks, or low-res details.",
    additionalPlaceholder: "Additional requirements, for example: avoid garbled text, watermarks, or low-res details.",
    recharge: "Not enough credits, recharge",
    generating: "Generating...",
    generate: "Generate image",
    outputAria: "Prompt preview and generation progress",
    zhPreview: "Readable preview",
    previewHelp: "The advanced prompt stays available, but users do not need to understand it.",
    submitted: "Submitted content",
    progress: "Generation progress",
    progressHelp: "Result, error, loading, and empty states appear here.",
    credits: "credits",
    result: "Generated result",
    history: "View history",
    waiting: "Waiting to generate",
    emptyHelp: "Describe a subject and generate. The result will appear here and be saved to your library."
  }
} satisfies Record<Locale, Record<string, string>>;

function friendlyGenerateError(error: string | undefined, status: number, locale: Locale) {
  const t = formCopy[locale];
  if (status === 401) return t.authExpired;
  if (status === 402) return t.insufficientCredits;
  if (error === "Generation failed") return t.generationFailed;
  return error || t.genericFailed;
}

function SectionHeading({ icon, title, tag }: { icon: ReactNode; title: string; tag: string }) {
  return (
    <div className="section-title">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-[14px] bg-zinc-950 text-white">{icon}</span>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950">{title}</h2>
      </div>
      <span className="tag">{tag}</span>
    </div>
  );
}

export function CreateForm({ locale, credits }: { locale: Locale; credits: number }) {
  const t = formCopy[locale];
  const [subject, setSubject] = useState("");
  const [imageType, setImageType] = useState("general");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("");
  const [scene, setScene] = useState("");
  const [whitespace, setWhitespace] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [hasReferenceImage, setHasReferenceImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const preview = useMemo(() => {
    try {
      return buildPrompt({
        locale,
        subject: subject || t.fallbackSubject,
        imageType: imageType || undefined,
        aspectRatio: aspectRatio || undefined,
        style: style || undefined,
        scene: scene || undefined,
        whitespace: whitespace || undefined,
        additionalRequirements: additionalRequirements || undefined,
        hasReferenceImage
      });
    } catch {
      return null;
    }
  }, [additionalRequirements, aspectRatio, hasReferenceImage, imageType, locale, scene, style, subject, t.fallbackSubject]);
  const currentPromptPreview = locale === "en" ? preview?.promptPreviewEn : preview?.promptPreviewZh;
  const currentPreviewTitle = locale === "en" ? "Current prompt preview" : "当前提示词预览";
  const currentPreviewHelp = locale === "en"
    ? "Generated from the current language and the information entered here. Only one readable version is shown."
    : "下面是基于你提供的信息生成的提示词内容";
  const submittedPromptTitle = locale === "en" ? "Actual prompt sent to the model" : "实际提交给模型的提示词";
  const submittedPromptHelp = locale === "en"
    ? "Kept collapsed for transparency and debugging when generation results need review."
    : "用于确认接口最终收到的内容，默认收起，方便排查生成效果。";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");
    setGeneratedImageUrl(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: new FormData(event.currentTarget)
      });
      const result = await response.json().catch(() => ({})) as GenerateResponse;

      if (!response.ok) {
        setSubmitError(friendlyGenerateError(result.error, response.status, locale));
        return;
      }

      setSuccessMessage(t.success);
      setGeneratedImageUrl(result.imageUrl ?? null);
    } catch {
      setSubmitError(t.networkFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="create-form create-studio create-studio-compact create-studio-balanced grid gap-2.5 xl:grid-cols-[minmax(480px,1.02fr)_minmax(380px,0.98fr)]"
      action="/api/generate"
      method="post"
      encType="multipart/form-data"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="locale" value={locale} />

      <div className="create-controls space-y-2.5">
        <section className="panel p-4">
          <SectionHeading icon={<MagicWandIcon />} title={t.subjectTitle} tag={t.required} />
          <p className="mt-2 text-xs leading-5 text-zinc-500">{t.subjectHelp}</p>
          <Textarea
            className="mt-2.5 min-h-16"
            name="subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            aria-label={t.subjectLabel}
            placeholder={t.subjectPlaceholder}
            required
          />
        </section>

        <section className="panel p-4">
          <SectionHeading icon={<MixIcon />} title={t.optionsTitle} tag={t.optional} />

          <label className="field-label mt-2.5">{t.imageType}</label>
          <div className="flex flex-wrap gap-2">
            {imageTypes.slice(0, 5).map((item) => (
              <label className={`chip ${imageType === item.value ? "is-selected" : ""}`} key={item.value}>
                <input
                  type="radio"
                  name="imageType"
                  value={item.value}
                  checked={imageType === item.value}
                  onClick={() => setImageType((current) => current === item.value ? "" : item.value)}
                  onChange={() => undefined}
                />
                {item[locale]}
              </label>
            ))}
          </div>

          <label className="field-label mt-2.5">{t.aspectRatio}</label>
          <div className="grid grid-cols-5 gap-2 max-sm:grid-cols-3">
            {aspectRatios.map((ratio) => (
              <AspectRatioOption
                key={ratio.value}
                {...ratio}
                selected={ratio.value === aspectRatio}
                onChange={(value) => setAspectRatio((current) => current === value ? "" : value)}
              />
            ))}
          </div>

          <label className="field-label mt-2.5">{t.style}</label>
          <div className="flex flex-wrap gap-2">
            {styles.slice(0, 4).map((item) => (
              <label className={`chip ${style === item.value ? "is-selected" : ""}`} key={item.value}>
                <input
                  type="radio"
                  name="style"
                  value={item.value}
                  checked={style === item.value}
                  onClick={() => setStyle((current) => current === item.value ? "" : item.value)}
                  onChange={() => undefined}
                />
                {item[locale]}
              </label>
            ))}
          </div>

          <label className="field-label mt-2.5">{t.scene}</label>
          <div className="flex flex-wrap gap-2">
            {scenes.slice(0, 4).map((item) => (
              <label className={`chip ${scene === item.value ? "is-selected" : ""}`} key={item.value}>
                <input
                  type="radio"
                  name="scene"
                  value={item.value}
                  checked={scene === item.value}
                  onClick={() => setScene((current) => current === item.value ? "" : item.value)}
                  onChange={() => undefined}
                />
                {item[locale]}
              </label>
            ))}
          </div>

          <label className="field-label mt-2.5">{t.whitespace}</label>
          <div className="flex flex-wrap gap-2">
            {whitespaceOptions.map((item) => (
              <label className={`chip ${whitespace === item.value ? "is-selected" : ""}`} key={item.value}>
                <input
                  type="radio"
                  name="whitespace"
                  value={item.value}
                  checked={whitespace === item.value}
                  onClick={() => setWhitespace((current) => current === item.value ? "" : item.value)}
                  onChange={() => undefined}
                />
                {item[locale]}
              </label>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <SectionHeading icon={<ImageIcon />} title={t.referenceTitle} tag={t.optional} />
          <div className="reference-fields mt-2.5 grid gap-2.5 md:grid-cols-[0.86fr_1.14fr]">
            <label className="reference-upload flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-[1rem] border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-center text-sm text-zinc-500 transition hover:border-emerald-700/40 hover:bg-emerald-50/60">
              <ImageIcon className="mb-2 h-5 w-5 text-zinc-500" />
              <span>{hasReferenceImage ? t.selectedReference : t.uploadReference}</span>
              <input
                className="sr-only"
                name="referenceImage"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setHasReferenceImage(Boolean(event.currentTarget.files?.[0]))}
              />
            </label>
            <Textarea
              className="min-h-16 md:h-full"
              name="additionalRequirements"
              value={additionalRequirements}
              onChange={(event) => setAdditionalRequirements(event.target.value)}
              aria-label={t.additionalLabel}
              placeholder={t.additionalPlaceholder}
            />
          </div>
        </section>

        <div className="create-submit-row">
          {credits < 1 ? (
            <RechargeButton className="button primary full-width compact-submit min-h-12 text-base" label={t.recharge} locale={locale} />
          ) : (
            <button className={`button primary full-width compact-submit min-h-12 text-base${isSubmitting ? " is-pending" : ""}`} type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? <span className="button-spinner" aria-hidden="true" /> : null}
              {isSubmitting ? t.generating : t.generate}
            </button>
          )}
        </div>
      </div>

      <aside className="create-output create-output-balanced space-y-2.5 xl:sticky xl:top-2" aria-label={t.outputAria}>
        <section className="panel overflow-hidden">
          <div className="border-b border-zinc-200/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-zinc-950">{currentPreviewTitle}</h2>
                <p className="mt-1 text-sm text-zinc-500">{currentPreviewHelp}</p>
              </div>
              <Badge variant="accent">Prompt</Badge>
            </div>
          </div>
          <div className="grid gap-2 p-4">
            <pre
              className="max-h-40 overflow-auto rounded-[1rem] bg-zinc-950 p-4 text-xs leading-6 text-zinc-100"
              data-testid="current-prompt-preview"
            >
              {currentPromptPreview}
            </pre>
            <details className="submitted-prompt rounded-[1rem] border border-zinc-200 bg-white px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-700">{submittedPromptTitle}</summary>
              <p className="mt-2 text-xs leading-5 text-zinc-500">{submittedPromptHelp}</p>
              <pre
                className="mt-3 max-h-32 overflow-auto rounded-[0.85rem] bg-zinc-50 p-4 text-xs leading-6 text-zinc-600"
                data-testid="submitted-prompt-preview"
              >
                {preview?.submittedPrompt}
              </pre>
            </details>
          </div>
        </section>

        <section className="generation-panel panel overflow-hidden">
          <div className="section-title border-b border-zinc-200/80 p-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950">{t.progress}</h2>
              <p className="mt-1 text-sm text-zinc-500">{t.progressHelp}</p>
            </div>
            <span className="tag">{credits} {t.credits}</span>
          </div>

          <div className="generation-panel-body min-h-[330px] p-4">
            {submitError ? (
              <div className="form-message error" role="alert">
                {submitError}
              </div>
            ) : null}

            {successMessage ? (
              <div className="generation-success-state grid gap-4" role="status">
                <div className="section-title">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-950">{t.result}</h3>
                    <p className="text-sm text-zinc-500">{successMessage}</p>
                  </div>
                  <a className="button secondary" href={`/history?locale=${locale}`}>{t.history}</a>
                </div>
                {generatedImageUrl ? <img className="rounded-[1.25rem] border border-zinc-200 bg-zinc-50 object-contain" src={generatedImageUrl} alt={t.result} /> : null}
              </div>
            ) : null}

            {!submitError && !successMessage && isSubmitting ? (
              <div className="generation-loading-state grid gap-4">
                <div className="h-60 animate-pulse rounded-[1.35rem] bg-gradient-to-br from-zinc-200 via-zinc-100 to-emerald-100" />
                <div className="space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded-full bg-zinc-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-zinc-200" />
                </div>
              </div>
            ) : null}

            {!submitError && !successMessage && !isSubmitting ? (
              <div className="generation-empty-state grid min-h-[260px] place-items-center rounded-[1.35rem] border border-dashed border-zinc-300 bg-[radial-gradient(circle_at_30%_20%,rgba(4,120,87,0.12),transparent_24rem),#fafafa] p-6 text-center">
                <div>
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-[1rem] bg-zinc-950 text-white">
                    <MagicWandIcon />
                  </span>
                  <strong className="mt-5 block text-xl tracking-tight text-zinc-950">{t.waiting}</strong>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">{t.emptyHelp}</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </aside>
    </form>
  );
}
