import type { Locale } from "@/lib/presets";

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const next = locale === "zh" ? "en" : "zh";

  return (
    <a className="button secondary" href={`?locale=${next}`} aria-label="Switch language">
      {locale === "zh" ? "EN" : "中文"}
    </a>
  );
}
