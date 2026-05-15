import type { Locale } from "./presets";

export function normalizeLocale(value: string | undefined | null): Locale {
  return value?.toLowerCase().startsWith("en") ? "en" : "zh";
}

const dictionaries = {
  zh: {
    nav: {
      create: "生成图片",
      history: "历史记录",
      credits: "积分",
      upgrade: "升级",
      login: "登录"
    },
    create: {
      title: "创建图片",
      subtitle: "只填写主体也可以生成，其余选项都是可选增强项。",
      subjectLabel: "描述主体",
      generate: "生成图片",
      optional: "可选",
      required: "必填"
    }
  },
  en: {
    nav: {
      create: "Create",
      history: "History",
      credits: "Credits",
      upgrade: "Upgrade",
      login: "Log in"
    },
    create: {
      title: "Create image",
      subtitle: "Only the subject is required. Everything else is optional.",
      subjectLabel: "Describe the subject",
      generate: "Generate",
      optional: "Optional",
      required: "Required"
    }
  }
} as const;

export function getCopy(locale: Locale) {
  return dictionaries[locale];
}
