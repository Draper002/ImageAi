import { ChevronDownIcon, GlobeIcon } from "@radix-ui/react-icons";
import type { Locale } from "@/lib/presets";

type LanguageSwitchProps = {
  locale: Locale;
  path?: string;
};

function localeHref(path: string | undefined, locale: Locale) {
  return path ? `${path}?locale=${locale}` : `?locale=${locale}`;
}

export function LanguageSwitch({ locale, path }: LanguageSwitchProps) {
  const label = locale === "en" ? "Language" : "语言";

  return (
    <details className="language-menu" data-testid="language-menu">
      <summary className="button secondary language-switch" aria-label={locale === "en" ? "Choose language" : "选择语言"}>
        <GlobeIcon className="h-4 w-4" />
        <span>{label}</span>
        <strong>{locale === "zh" ? "中文" : "English"}</strong>
        <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
      </summary>
      <div className="language-popover">
        <a className={locale === "en" ? "is-active" : ""} href={localeHref(path, "en")}>English</a>
        <a className={locale === "zh" ? "is-active" : ""} href={localeHref(path, "zh")}>中文</a>
      </div>
    </details>
  );
}
