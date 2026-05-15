# AI Image SaaS MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first deployable Next.js SaaS MVP for guided AI image generation with auth, credits, history, optional reference image upload, bilingual UI, and OpenAI image generation.

**Architecture:** Use a Next.js App Router monolith. Keep product logic in small server-side modules: dictionaries and presets, prompt assembly, Supabase clients, credit RPC wrappers, storage helpers, and OpenAI image service. UI pages consume those modules through route handlers and server/client components.

**Tech Stack:** Next.js, React, TypeScript, Supabase Auth/Postgres/Storage, OpenAI Node SDK, Vitest, React Testing Library, and plain global CSS.

---

## File Structure

Create this structure from an empty workspace:

- `package.json`: scripts and dependencies.
- `next.config.ts`: Next.js config.
- `tsconfig.json`: TypeScript config.
- `vitest.config.ts`: unit/component test config.
- `src/test/setup.ts`: test environment setup.
- `src/app/layout.tsx`: root layout and global shell.
- `src/app/page.tsx`: Chinese-first landing page.
- `src/app/login/page.tsx`: email/password auth UI.
- `src/app/create/page.tsx`: protected image creation page.
- `src/app/history/page.tsx`: protected generation history page.
- `src/app/upgrade/page.tsx`: upgrade entry page without real payment.
- `src/app/api/generate/route.ts`: generation API.
- `src/app/api/credits/route.ts`: credit balance API.
- `src/app/api/generations/route.ts`: history API.
- `src/components/aspect-ratio-option.tsx`: ratio selector with visual icon.
- `src/components/create-form.tsx`: guided generation form.
- `src/components/language-switch.tsx`: Chinese/English toggle.
- `src/components/credit-badge.tsx`: credit display.
- `src/components/history-grid.tsx`: history cards.
- `src/lib/i18n.ts`: locale dictionaries.
- `src/lib/presets.ts`: image type, ratio, style, scene, whitespace presets.
- `src/lib/prompt-builder.ts`: server-safe prompt preview and submitted prompt builder.
- `src/lib/env.ts`: environment variable validation.
- `src/lib/supabase/server.ts`: server Supabase client helpers.
- `src/lib/supabase/admin.ts`: service-role Supabase helper for trusted server operations.
- `src/lib/credits.ts`: credit debit/refund wrappers.
- `src/lib/storage.ts`: private image upload and signed URL helpers.
- `src/lib/openai-images.ts`: OpenAI image generation abstraction.
- `src/lib/auth.ts`: auth guard helpers.
- `src/types/generation.ts`: shared generation input and record types.
- `src/middleware.ts`: Supabase session middleware and protected-route redirect.
- `supabase/migrations/001_initial_schema.sql`: tables, RLS, storage buckets, and credit functions.
- `docs/env.example`: required environment variables.

Each task below is scoped so it can be implemented and verified independently.

---

### Task 1: Project Foundation and Test Harness

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/lib/env.ts`
- Test: `src/lib/env.test.ts`

- [ ] **Step 1: Create package and config files**

Create `package.json`:

```json
{
  "name": "prompt-canvas",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/ssr": "^0.6.1",
    "@supabase/supabase-js": "^2.49.4",
    "next": "^15.3.2",
    "openai": "^4.103.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^22.15.17",
    "@types/react": "^19.0.12",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.4.1",
    "jsdom": "^26.1.0",
    "typescript": "^5.8.3",
    "vitest": "^3.1.3"
  }
}
```

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb"
    }
  }
};

export default nextConfig;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test/setup.ts"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Write the failing env validation test**

Create `src/lib/env.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  test("returns typed environment values when all required keys exist", () => {
    const result = parseEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      OPENAI_API_KEY: "openai",
      OPENAI_IMAGE_MODEL: "gpt-image-1",
      NEXT_PUBLIC_APP_URL: "https://app.example.com"
    });

    expect(result.OPENAI_IMAGE_MODEL).toBe("gpt-image-1");
    expect(result.NEXT_PUBLIC_APP_URL).toBe("https://app.example.com");
  });

  test("throws a useful error when a required key is missing", () => {
    expect(() => parseEnv({})).toThrow("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run:

```bash
npm install
npm test -- src/lib/env.test.ts
```

Expected: FAIL because `src/lib/env.ts` does not exist.

- [ ] **Step 4: Implement environment parsing**

Create `src/lib/env.ts`:

```ts
const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "OPENAI_IMAGE_MODEL",
  "NEXT_PUBLIC_APP_URL"
] as const;

export type AppEnv = Record<(typeof requiredKeys)[number], string>;

export function parseEnv(source: NodeJS.ProcessEnv | Record<string, string | undefined>): AppEnv {
  const values = {} as AppEnv;

  for (const key of requiredKeys) {
    const value = source[key];
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    values[key] = value;
  }

  return values;
}

export function getEnv(): AppEnv {
  return parseEnv(process.env);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run:

```bash
npm test -- src/lib/env.test.ts
```

Expected: PASS.

---

### Task 2: Presets and Bilingual Copy

**Files:**
- Create: `src/lib/presets.ts`
- Create: `src/lib/i18n.ts`
- Test: `src/lib/presets.test.ts`
- Test: `src/lib/i18n.test.ts`

- [ ] **Step 1: Write failing tests for presets and locale fallback**

Create `src/lib/presets.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { aspectRatios, getPresetLabel } from "./presets";

describe("presets", () => {
  test("aspect ratios include numeric labels and icon shapes", () => {
    expect(aspectRatios).toEqual([
      { value: "1:1", label: "1:1", shape: "square" },
      { value: "4:5", label: "4:5", shape: "portrait" },
      { value: "16:9", label: "16:9", shape: "wide" },
      { value: "9:16", label: "9:16", shape: "tall" },
      { value: "3:2", label: "3:2", shape: "landscape" }
    ]);
  });

  test("returns Chinese and English labels for image type presets", () => {
    expect(getPresetLabel("imageTypes", "social_cover", "zh")).toBe("社媒封面");
    expect(getPresetLabel("imageTypes", "social_cover", "en")).toBe("Social cover");
  });
});
```

Create `src/lib/i18n.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { getCopy, normalizeLocale } from "./i18n";

describe("i18n", () => {
  test("defaults to Chinese for unknown locale values", () => {
    expect(normalizeLocale(undefined)).toBe("zh");
    expect(normalizeLocale("fr")).toBe("zh");
  });

  test("returns localized page copy", () => {
    expect(getCopy("zh").nav.create).toBe("生成图片");
    expect(getCopy("en").nav.create).toBe("Create");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/lib/presets.test.ts src/lib/i18n.test.ts
```

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement presets**

Create `src/lib/presets.ts`:

```ts
export type Locale = "zh" | "en";

type Preset = {
  value: string;
  zh: string;
  en: string;
};

export const imageTypes = [
  { value: "general", zh: "通用图片", en: "General image" },
  { value: "poster", zh: "海报", en: "Poster" },
  { value: "social_cover", zh: "社媒封面", en: "Social cover" },
  { value: "product", zh: "商品图", en: "Product image" },
  { value: "illustration", zh: "插画", en: "Illustration" },
  { value: "avatar", zh: "头像", en: "Avatar" },
  { value: "banner", zh: "横幅", en: "Banner" }
] satisfies Preset[];

export const styles = [
  { value: "realistic", zh: "真实摄影", en: "Realistic" },
  { value: "minimal", zh: "极简", en: "Minimal" },
  { value: "three_d", zh: "3D", en: "3D" },
  { value: "cinematic", zh: "电影感", en: "Cinematic" },
  { value: "watercolor", zh: "水彩", en: "Watercolor" },
  { value: "cyberpunk", zh: "赛博朋克", en: "Cyberpunk" }
] satisfies Preset[];

export const scenes = [
  { value: "indoor", zh: "室内", en: "Indoor" },
  { value: "outdoor", zh: "户外", en: "Outdoor" },
  { value: "studio", zh: "工作室", en: "Studio" },
  { value: "nature", zh: "自然", en: "Nature" },
  { value: "city", zh: "城市", en: "City" },
  { value: "festival", zh: "节日", en: "Festival" }
] satisfies Preset[];

export const whitespaceOptions = [
  { value: "none", zh: "无特殊要求", en: "No special requirement" },
  { value: "top", zh: "顶部留白", en: "Top whitespace" },
  { value: "bottom", zh: "底部留白", en: "Bottom whitespace" },
  { value: "left", zh: "左侧留白", en: "Left whitespace" },
  { value: "right", zh: "右侧留白", en: "Right whitespace" },
  { value: "center", zh: "主体居中", en: "Centered subject" }
] satisfies Preset[];

export const aspectRatios = [
  { value: "1:1", label: "1:1", shape: "square" },
  { value: "4:5", label: "4:5", shape: "portrait" },
  { value: "16:9", label: "16:9", shape: "wide" },
  { value: "9:16", label: "9:16", shape: "tall" },
  { value: "3:2", label: "3:2", shape: "landscape" }
] as const;

const groups = {
  imageTypes,
  styles,
  scenes,
  whitespaceOptions
};

export type PresetGroup = keyof typeof groups;

export function getPresetLabel(group: PresetGroup, value: string | undefined, locale: Locale): string | undefined {
  if (!value) return undefined;
  return groups[group].find((preset) => preset.value === value)?.[locale];
}
```

- [ ] **Step 4: Implement dictionaries**

Create `src/lib/i18n.ts`:

```ts
import type { Locale } from "./presets";

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === "en" ? "en" : "zh";
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
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- src/lib/presets.test.ts src/lib/i18n.test.ts
```

Expected: PASS.

---

### Task 3: Prompt Builder

**Files:**
- Create: `src/types/generation.ts`
- Create: `src/lib/prompt-builder.ts`
- Test: `src/lib/prompt-builder.test.ts`

- [ ] **Step 1: Write failing prompt builder tests**

Create `src/lib/prompt-builder.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { buildPrompt } from "./prompt-builder";

describe("buildPrompt", () => {
  test("requires a non-empty subject", () => {
    expect(() => buildPrompt({ subject: "  ", locale: "zh" })).toThrow("Subject is required");
  });

  test("preserves Chinese user input in the submitted prompt", () => {
    const result = buildPrompt({
      locale: "zh",
      subject: "一只穿着宇航服的橘猫",
      aspectRatio: "16:9",
      style: "cinematic",
      whitespace: "right",
      additionalRequirements: "不要出现水印"
    });

    expect(result.submittedPrompt).toContain("一只穿着宇航服的橘猫");
    expect(result.submittedPrompt).toContain("不要出现水印");
    expect(result.submittedPrompt).toContain("画面比例：16:9");
    expect(result.promptPreviewZh).toContain("右侧留白");
    expect(result.promptPreviewEn).toContain("Right whitespace");
  });

  test("adds reference image guidance when a reference image exists", () => {
    const result = buildPrompt({
      locale: "en",
      subject: "a red running shoe",
      hasReferenceImage: true
    });

    expect(result.submittedPrompt).toContain("Use the uploaded image as visual reference");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- src/lib/prompt-builder.test.ts
```

Expected: FAIL because `prompt-builder.ts` and shared types do not exist.

- [ ] **Step 3: Create shared generation types**

Create `src/types/generation.ts`:

```ts
import type { Locale } from "@/lib/presets";

export type GenerationInput = {
  locale: Locale;
  subject: string;
  imageType?: string;
  aspectRatio?: string;
  style?: string;
  scene?: string;
  whitespace?: string;
  additionalRequirements?: string;
  hasReferenceImage?: boolean;
};

export type PromptResult = {
  promptPreviewZh: string;
  promptPreviewEn: string;
  submittedPrompt: string;
};

export type GenerationStatus = "processing" | "succeeded" | "failed";
```

- [ ] **Step 4: Implement prompt builder**

Create `src/lib/prompt-builder.ts`:

```ts
import type { GenerationInput, PromptResult } from "@/types/generation";
import { getPresetLabel } from "./presets";

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildPrompt(input: GenerationInput): PromptResult {
  const subject = clean(input.subject);
  if (!subject) {
    throw new Error("Subject is required");
  }

  const aspectRatio = input.aspectRatio ?? "1:1";
  const zhType = getPresetLabel("imageTypes", input.imageType ?? "general", "zh") ?? "通用高质量图片";
  const enType = getPresetLabel("imageTypes", input.imageType ?? "general", "en") ?? "General high-quality image";
  const zhStyle = getPresetLabel("styles", input.style, "zh") ?? "清晰、高质量、有视觉吸引力";
  const enStyle = getPresetLabel("styles", input.style, "en") ?? "Clean, high-quality, visually appealing";
  const zhScene = getPresetLabel("scenes", input.scene, "zh");
  const enScene = getPresetLabel("scenes", input.scene, "en");
  const zhWhitespace = getPresetLabel("whitespaceOptions", input.whitespace, "zh");
  const enWhitespace = getPresetLabel("whitespaceOptions", input.whitespace, "en");
  const additional = clean(input.additionalRequirements);

  const zhLines = [
    `请生成一张高质量图片。`,
    `主体：${subject}`,
    `图片类型：${zhType}`,
    `画面比例：${aspectRatio}`,
    `视觉风格：${zhStyle}`,
    zhScene ? `场景：${zhScene}` : undefined,
    zhWhitespace ? `构图要求：${zhWhitespace}` : undefined,
    additional ? `补充要求：${additional}` : undefined,
    input.hasReferenceImage ? "请参考上传图片的主体、构图或风格，同时遵守以上要求。" : undefined,
    "避免无意义文字、水印、低清细节和明显畸形。"
  ].filter(Boolean);

  const enLines = [
    "Create a high-quality image.",
    `Subject: ${subject}`,
    `Image type: ${enType}`,
    `Aspect ratio: ${aspectRatio}`,
    `Visual style: ${enStyle}`,
    enScene ? `Scene: ${enScene}` : undefined,
    enWhitespace ? `Composition requirement: ${enWhitespace}` : undefined,
    additional ? `Additional requirements: ${additional}` : undefined,
    input.hasReferenceImage ? "Use the uploaded image as visual reference while following the prompt." : undefined,
    "Avoid meaningless text, watermarks, low-resolution details, and obvious distortions."
  ].filter(Boolean);

  return {
    promptPreviewZh: zhLines.join("\n"),
    promptPreviewEn: enLines.join("\n"),
    submittedPrompt: input.locale === "en" ? enLines.join("\n") : zhLines.join("\n")
  };
}
```

- [ ] **Step 5: Run the prompt builder test**

Run:

```bash
npm test -- src/lib/prompt-builder.test.ts
```

Expected: PASS.

---

### Task 4: Supabase Schema, RLS, and Credit Functions

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `docs/env.example`

- [ ] **Step 1: Create SQL migration**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  credit_balance integer not null default 2 check (credit_balance >= 0),
  locale text not null default 'zh' check (locale in ('zh', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  amount integer not null,
  reason text not null check (
    reason in ('signup_bonus', 'generation_debit', 'generation_refund', 'manual_adjustment', 'future_purchase')
  ),
  generation_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  status text not null check (status in ('processing', 'succeeded', 'failed')),
  subject text not null,
  image_type text,
  aspect_ratio text,
  style text,
  scene text,
  whitespace text,
  additional_requirements text,
  locale text not null default 'zh' check (locale in ('zh', 'en')),
  prompt_preview_zh text,
  prompt_preview_en text,
  submitted_prompt text not null,
  reference_image_path text,
  generated_image_path text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.credit_ledger
  add constraint credit_ledger_generation_id_fkey
  foreign key (generation_id) references public.generations(id) on delete set null;

alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.generations enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles_update_own_locale" on public.profiles
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "credit_ledger_select_own" on public.credit_ledger
  for select using (auth.uid() = user_id);

create policy "generations_select_own" on public.generations
  for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, credit_balance)
  values (new.id, coalesce(new.email, ''), 2);

  insert into public.credit_ledger (user_id, amount, reason)
  values (new.id, 2, 'signup_bonus');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.reserve_generation_credit(p_user_id uuid, p_generation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set credit_balance = credit_balance - 1,
        updated_at = now()
    where user_id = p_user_id
      and credit_balance >= 1;

  if not found then
    return false;
  end if;

  insert into public.credit_ledger (user_id, amount, reason, generation_id)
  values (p_user_id, -1, 'generation_debit', p_generation_id);

  return true;
end;
$$;

create or replace function public.refund_generation_credit(p_user_id uuid, p_generation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set credit_balance = credit_balance + 1,
        updated_at = now()
    where user_id = p_user_id;

  insert into public.credit_ledger (user_id, amount, reason, generation_id)
  values (p_user_id, 1, 'generation_refund', p_generation_id);
end;
$$;

insert into storage.buckets (id, name, public)
values ('reference-images', 'reference-images', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('generated-images', 'generated-images', false)
on conflict (id) do nothing;
```

- [ ] **Step 2: Create environment example**

Create `docs/env.example`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
OPENAI_IMAGE_MODEL=gpt-image-1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 3: Manual SQL verification**

Run in Supabase SQL editor or Supabase CLI:

```bash
supabase db push
```

Expected:

- Tables `profiles`, `credit_ledger`, and `generations` exist.
- Functions `reserve_generation_credit` and `refund_generation_credit` exist.
- Storage buckets `reference-images` and `generated-images` exist.
- RLS is enabled on the three business tables.

---

### Task 5: Supabase Clients, Auth Guards, Credits, and Storage Helpers

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/auth.ts`
- Create: `src/lib/credits.ts`
- Create: `src/lib/storage.ts`
- Test: `src/lib/credits.test.ts`
- Test: `src/lib/storage.test.ts`

- [ ] **Step 1: Write failing tests for credit service**

Create `src/lib/credits.test.ts`:

```ts
import { describe, expect, test, vi } from "vitest";
import { refundGenerationCredit, reserveGenerationCredit } from "./credits";

describe("credits", () => {
  test("returns true when Supabase RPC reserves credit", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    await expect(reserveGenerationCredit({ rpc } as never, "user-1", "gen-1")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("reserve_generation_credit", {
      p_user_id: "user-1",
      p_generation_id: "gen-1"
    });
  });

  test("throws when refund RPC fails", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "db down" } });
    await expect(refundGenerationCredit({ rpc } as never, "user-1", "gen-1")).rejects.toThrow("db down");
  });
});
```

Create `src/lib/storage.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { buildStoragePath, validateReferenceFile } from "./storage";

describe("storage helpers", () => {
  test("builds deterministic user-scoped storage path", () => {
    expect(buildStoragePath("user-1", "gen-1", "image.png")).toMatch(/^user-1\/gen-1\/\d+-image\.png$/);
  });

  test("validates reference image type and size", () => {
    const file = new File(["x"], "ref.png", { type: "image/png" });
    expect(validateReferenceFile(file)).toEqual({ ok: true });

    const bad = new File(["x"], "ref.gif", { type: "image/gif" });
    expect(validateReferenceFile(bad)).toEqual({ ok: false, message: "Reference image must be JPEG, PNG, or WebP." });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/lib/credits.test.ts src/lib/storage.test.ts
```

Expected: FAIL because helpers do not exist.

- [ ] **Step 3: Implement Supabase clients and auth guard**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const env = getEnv();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      }
    }
  });
}
```

Create `src/lib/supabase/admin.ts`:

```ts
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  const env = getEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
```

Create `src/lib/auth.ts`:

```ts
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  return data.user;
}
```

- [ ] **Step 4: Implement credit helpers**

Create `src/lib/credits.ts`:

```ts
type RpcClient = {
  rpc: (name: string, args: Record<string, string>) => Promise<{ data: unknown; error: { message: string } | null }>;
};

export async function reserveGenerationCredit(client: RpcClient, userId: string, generationId: string): Promise<boolean> {
  const { data, error } = await client.rpc("reserve_generation_credit", {
    p_user_id: userId,
    p_generation_id: generationId
  });

  if (error) throw new Error(error.message);
  return data === true;
}

export async function refundGenerationCredit(client: RpcClient, userId: string, generationId: string): Promise<void> {
  const { error } = await client.rpc("refund_generation_credit", {
    p_user_id: userId,
    p_generation_id: generationId
  });

  if (error) throw new Error(error.message);
}
```

- [ ] **Step 5: Implement storage helpers**

Create `src/lib/storage.ts`:

```ts
const allowedReferenceTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxReferenceBytes = 10 * 1024 * 1024;

export function validateReferenceFile(file: File): { ok: true } | { ok: false; message: string } {
  if (!allowedReferenceTypes.has(file.type)) {
    return { ok: false, message: "Reference image must be JPEG, PNG, or WebP." };
  }

  if (file.size > maxReferenceBytes) {
    return { ok: false, message: "Reference image must be 10MB or smaller." };
  }

  return { ok: true };
}

export function buildStoragePath(userId: string, generationId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${userId}/${generationId}/${Date.now()}-${safeName}`;
}

export async function uploadPrivateFile(
  client: { storage: { from: (bucket: string) => { upload: (path: string, file: Blob, options: { contentType?: string; upsert: boolean }) => Promise<{ error: { message: string } | null }> } } },
  bucket: string,
  path: string,
  file: Blob,
  contentType?: string
): Promise<void> {
  const { error } = await client.storage.from(bucket).upload(path, file, { contentType, upsert: false });
  if (error) throw new Error(error.message);
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test -- src/lib/credits.test.ts src/lib/storage.test.ts
```

Expected: PASS.

---

### Task 6: OpenAI Image Service

**Files:**
- Create: `src/lib/openai-images.ts`
- Test: `src/lib/openai-images.test.ts`

- [ ] **Step 1: Write failing tests for service branching**

Create `src/lib/openai-images.test.ts`:

```ts
import { describe, expect, test, vi } from "vitest";
import { generateImage } from "./openai-images";

describe("generateImage", () => {
  test("uses text generation when no reference image exists", async () => {
    const generate = vi.fn().mockResolvedValue({ data: [{ b64_json: "aGVsbG8=" }] });
    const edit = vi.fn();

    const bytes = await generateImage({
      client: { images: { generate, edit } } as never,
      model: "gpt-image-1",
      prompt: "生成一张图片",
      aspectRatio: "1:1"
    });

    expect(generate).toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
    expect(bytes.toString("utf8")).toBe("hello");
  });

  test("uses edit flow when reference image exists", async () => {
    const generate = vi.fn();
    const edit = vi.fn().mockResolvedValue({ data: [{ b64_json: "aGVsbG8=" }] });

    await generateImage({
      client: { images: { generate, edit } } as never,
      model: "gpt-image-1",
      prompt: "Create image",
      aspectRatio: "16:9",
      referenceImage: new File(["image"], "ref.png", { type: "image/png" })
    });

    expect(edit).toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/openai-images.test.ts
```

Expected: FAIL because service does not exist.

- [ ] **Step 3: Implement OpenAI image service**

Create `src/lib/openai-images.ts`:

```ts
import OpenAI from "openai";

type OpenAIImageClient = Pick<OpenAI, "images">;

type GenerateImageArgs = {
  client: OpenAIImageClient;
  model: string;
  prompt: string;
  aspectRatio: string;
  referenceImage?: File;
};

function sizeForAspectRatio(aspectRatio: string): "1024x1024" | "1536x1024" | "1024x1536" {
  if (aspectRatio === "16:9" || aspectRatio === "3:2") return "1536x1024";
  if (aspectRatio === "9:16" || aspectRatio === "4:5") return "1024x1536";
  return "1024x1024";
}

function decodeImage(data: unknown): Buffer {
  const first = Array.isArray(data) ? data[0] : undefined;
  if (!first || typeof first !== "object" || !("b64_json" in first) || typeof first.b64_json !== "string") {
    throw new Error("OpenAI did not return image data.");
  }
  return Buffer.from(first.b64_json, "base64");
}

export async function generateImage(args: GenerateImageArgs): Promise<Buffer> {
  const size = sizeForAspectRatio(args.aspectRatio);

  if (args.referenceImage) {
    const response = await args.client.images.edit({
      model: args.model,
      image: args.referenceImage,
      prompt: args.prompt,
      size
    });
    return decodeImage(response.data);
  }

  const response = await args.client.images.generate({
    model: args.model,
    prompt: args.prompt,
    size
  });
  return decodeImage(response.data);
}

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- src/lib/openai-images.test.ts
```

Expected: PASS.

---

### Task 7: Generation API Route

**Files:**
- Create: `src/app/api/generate/route.ts`
- Modify: `src/types/generation.ts`
- Test: `src/app/api/generate/route.test.ts`

- [ ] **Step 1: Add route-level tests for validation and insufficient credit**

Create `src/app/api/generate/route.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { parseGenerateForm } from "./route";

describe("parseGenerateForm", () => {
  test("requires subject", async () => {
    const form = new FormData();
    await expect(parseGenerateForm(form)).rejects.toThrow("Subject is required");
  });

  test("accepts subject-only generation input", async () => {
    const form = new FormData();
    form.set("subject", "一杯冰美式");
    const input = await parseGenerateForm(form);
    expect(input.subject).toBe("一杯冰美式");
    expect(input.locale).toBe("zh");
    expect(input.aspectRatio).toBe("1:1");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/app/api/generate/route.test.ts
```

Expected: FAIL because route parser does not exist.

- [ ] **Step 3: Implement route parser and API skeleton**

Create `src/app/api/generate/route.ts`:

```ts
import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt-builder";
import { createOpenAIClient, generateImage } from "@/lib/openai-images";
import { getEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reserveGenerationCredit, refundGenerationCredit } from "@/lib/credits";
import { buildStoragePath, uploadPrivateFile, validateReferenceFile } from "@/lib/storage";
import type { GenerationInput } from "@/types/generation";

export async function parseGenerateForm(form: FormData): Promise<GenerationInput & { referenceImage?: File }> {
  const subject = String(form.get("subject") ?? "").trim();
  if (!subject) throw new Error("Subject is required");

  const reference = form.get("referenceImage");
  const referenceImage = reference instanceof File && reference.size > 0 ? reference : undefined;
  if (referenceImage) {
    const validation = validateReferenceFile(referenceImage);
    if (!validation.ok) throw new Error(validation.message);
  }

  return {
    locale: form.get("locale") === "en" ? "en" : "zh",
    subject,
    imageType: String(form.get("imageType") ?? "general"),
    aspectRatio: String(form.get("aspectRatio") ?? "1:1"),
    style: String(form.get("style") ?? "") || undefined,
    scene: String(form.get("scene") ?? "") || undefined,
    whitespace: String(form.get("whitespace") ?? "") || undefined,
    additionalRequirements: String(form.get("additionalRequirements") ?? "") || undefined,
    hasReferenceImage: Boolean(referenceImage),
    referenceImage
  };
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  const env = getEnv();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed: Awaited<ReturnType<typeof parseGenerateForm>>;
  try {
    parsed = await parseGenerateForm(await request.formData());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }

  const prompt = buildPrompt(parsed);
  const generationId = crypto.randomUUID();

  const { error: insertError } = await admin.from("generations").insert({
    id: generationId,
    user_id: user.id,
    status: "processing",
    subject: parsed.subject,
    image_type: parsed.imageType,
    aspect_ratio: parsed.aspectRatio,
    style: parsed.style,
    scene: parsed.scene,
    whitespace: parsed.whitespace,
    additional_requirements: parsed.additionalRequirements,
    locale: parsed.locale,
    prompt_preview_zh: prompt.promptPreviewZh,
    prompt_preview_en: prompt.promptPreviewEn,
    submitted_prompt: prompt.submittedPrompt
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const reserved = await reserveGenerationCredit(admin, user.id, generationId);
  if (!reserved) {
    await admin.from("generations").update({ status: "failed", error_message: "Insufficient credits" }).eq("id", generationId);
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  try {
    let referencePath: string | undefined;
    if (parsed.referenceImage) {
      referencePath = buildStoragePath(user.id, generationId, parsed.referenceImage.name);
      await uploadPrivateFile(admin, "reference-images", referencePath, parsed.referenceImage, parsed.referenceImage.type);
    }

    const openai = createOpenAIClient(env.OPENAI_API_KEY);
    const imageBytes = await generateImage({
      client: openai,
      model: env.OPENAI_IMAGE_MODEL,
      prompt: prompt.submittedPrompt,
      aspectRatio: parsed.aspectRatio ?? "1:1",
      referenceImage: parsed.referenceImage
    });

    const generatedPath = buildStoragePath(user.id, generationId, "generated.png");
    await uploadPrivateFile(admin, "generated-images", generatedPath, new Blob([imageBytes], { type: "image/png" }), "image/png");

    await admin.from("generations").update({
      status: "succeeded",
      reference_image_path: referencePath,
      generated_image_path: generatedPath,
      updated_at: new Date().toISOString()
    }).eq("id", generationId);

    return NextResponse.json({ id: generationId, status: "succeeded" });
  } catch (error) {
    await refundGenerationCredit(admin, user.id, generationId);
    await admin.from("generations").update({
      status: "failed",
      error_message: error instanceof Error ? error.message : "Generation failed",
      updated_at: new Date().toISOString()
    }).eq("id", generationId);

    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run route parser tests**

Run:

```bash
npm test -- src/app/api/generate/route.test.ts
```

Expected: PASS.

---

### Task 8: Credits and History API Routes

**Files:**
- Create: `src/app/api/credits/route.ts`
- Create: `src/app/api/generations/route.ts`
- Test: `src/app/api/credits/route.test.ts`

- [ ] **Step 1: Write a failing pure helper test for signed URL mapping**

Create `src/app/api/credits/route.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { readCreditBalance } from "./route";

describe("readCreditBalance", () => {
  test("returns zero when profile has no balance value", () => {
    expect(readCreditBalance({ credit_balance: null })).toBe(0);
  });

  test("returns profile credit balance", () => {
    expect(readCreditBalance({ credit_balance: 2 })).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/app/api/credits/route.test.ts
```

Expected: FAIL because route does not exist.

- [ ] **Step 3: Implement credits API**

Create `src/app/api/credits/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function readCreditBalance(profile: { credit_balance: number | null } | null): number {
  return profile?.credit_balance ?? 0;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("credit_balance")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ credits: readCreditBalance(data) });
}
```

- [ ] **Step 4: Implement history API**

Create `src/app/api/generations/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const records = await Promise.all(
    (data ?? []).map(async (item) => {
      let imageUrl: string | null = null;
      if (item.generated_image_path) {
        const signed = await supabase.storage.from("generated-images").createSignedUrl(item.generated_image_path, 60 * 10);
        imageUrl = signed.data?.signedUrl ?? null;
      }
      return { ...item, imageUrl };
    })
  );

  return NextResponse.json({ records });
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- src/app/api/credits/route.test.ts
```

Expected: PASS.

---

### Task 9: UI Components

**Files:**
- Create: `src/components/aspect-ratio-option.tsx`
- Create: `src/components/language-switch.tsx`
- Create: `src/components/credit-badge.tsx`
- Create: `src/components/create-form.tsx`
- Test: `src/components/aspect-ratio-option.test.tsx`
- Test: `src/components/create-form.test.tsx`

- [ ] **Step 1: Write failing component tests**

Create `src/components/aspect-ratio-option.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { AspectRatioOption } from "./aspect-ratio-option";

describe("AspectRatioOption", () => {
  test("renders numeric ratio and accessible visual shape", () => {
    render(<AspectRatioOption value="16:9" label="16:9" shape="wide" selected={true} />);
    expect(screen.getByText("16:9")).toBeInTheDocument();
    expect(screen.getByLabelText("16:9 aspect ratio preview")).toHaveAttribute("data-shape", "wide");
  });
});
```

Create `src/components/create-form.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CreateForm } from "./create-form";

describe("CreateForm", () => {
  test("renders subject as required and optional controls as optional", () => {
    render(<CreateForm locale="zh" credits={2} />);
    expect(screen.getByText("1. 描述主体")).toBeInTheDocument();
    expect(screen.getByText("必填")).toBeInTheDocument();
    expect(screen.getByText("2. 可选参数")).toBeInTheDocument();
    expect(screen.getAllByText("可选").length).toBeGreaterThan(0);
    expect(screen.getByText("中文预览")).toBeInTheDocument();
    expect(screen.getByText("实际提交内容")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/components/aspect-ratio-option.test.tsx src/components/create-form.test.tsx
```

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement ratio option component**

Create `src/components/aspect-ratio-option.tsx`:

```tsx
type AspectRatioOptionProps = {
  value: string;
  label: string;
  shape: string;
  selected?: boolean;
};

export function AspectRatioOption({ value, label, shape, selected = false }: AspectRatioOptionProps) {
  return (
    <label className={`ratio-option ${selected ? "is-selected" : ""}`}>
      <input type="radio" name="aspectRatio" value={value} defaultChecked={selected} />
      <span aria-label={`${label} aspect ratio preview`} data-shape={shape} className={`ratio-shape ratio-${shape}`} />
      <span>{label}</span>
    </label>
  );
}
```

- [ ] **Step 4: Implement support components**

Create `src/components/language-switch.tsx`:

```tsx
import type { Locale } from "@/lib/presets";

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const next = locale === "zh" ? "en" : "zh";
  return (
    <a className="button secondary" href={`?locale=${next}`} aria-label="Switch language">
      {locale === "zh" ? "EN" : "中文"}
    </a>
  );
}
```

Create `src/components/credit-badge.tsx`:

```tsx
export function CreditBadge({ credits }: { credits: number }) {
  return (
    <div className="credit-badge">
      <span>当前积分</span>
      <strong>{credits}</strong>
    </div>
  );
}
```

- [ ] **Step 5: Implement create form component**

Create `src/components/create-form.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { aspectRatios, imageTypes, scenes, styles, whitespaceOptions, type Locale } from "@/lib/presets";
import { buildPrompt } from "@/lib/prompt-builder";
import { AspectRatioOption } from "./aspect-ratio-option";

export function CreateForm({ locale, credits }: { locale: Locale; credits: number }) {
  const [subject, setSubject] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const preview = useMemo(() => {
    try {
      return buildPrompt({ locale, subject: subject || "一只穿着宇航服的橘猫", aspectRatio });
    } catch {
      return null;
    }
  }, [aspectRatio, locale, subject]);

  return (
    <form className="create-form" action="/api/generate" method="post" encType="multipart/form-data">
      <input type="hidden" name="locale" value={locale} />
      <section className="panel">
        <div className="section-title">
          <h2>1. 描述主体</h2>
          <span className="tag">必填</span>
        </div>
        <textarea
          name="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          aria-label="主体，例如：一只穿着宇航服的橘猫，站在月球咖啡馆门口"
          required
        />
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>2. 可选参数</h2>
          <span className="tag">可选</span>
        </div>
        <label>图片类型</label>
        <div className="chips">
          {imageTypes.slice(0, 5).map((item) => (
            <label className="chip" key={item.value}>
              <input type="radio" name="imageType" value={item.value} />
              {item[locale]}
            </label>
          ))}
        </div>

        <label>画面比例</label>
        <div className="ratio-grid" onChange={(event) => setAspectRatio((event.target as HTMLInputElement).value)}>
          {aspectRatios.map((ratio) => (
            <AspectRatioOption key={ratio.value} {...ratio} selected={ratio.value === aspectRatio} />
          ))}
        </div>

        <label>风格 / 场景 / 留白</label>
        <div className="chips">
          {[...styles.slice(0, 2), ...scenes.slice(0, 1), ...whitespaceOptions.slice(3, 4)].map((item) => (
            <label className="chip" key={item.value}>
              <input type="checkbox" name={item.value} value={item.value} />
              {item[locale]}
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>3. 参考图与补充要求</h2>
          <span className="tag">可选</span>
        </div>
        <input name="referenceImage" type="file" accept="image/png,image/jpeg,image/webp" />
        <textarea name="additionalRequirements" aria-label="补充要求，例如：不要出现乱码文字、水印或低清细节。" />
      </section>

      <section className="panel prompt-preview">
        <h2>中文预览</h2>
        <pre>{preview?.promptPreviewZh}</pre>
        <h2>English reference</h2>
        <pre>{preview?.promptPreviewEn}</pre>
        <h2>实际提交内容</h2>
        <pre>{preview?.submittedPrompt}</pre>
      </section>

      {credits < 1 ? (
        <a className="button primary" href="/upgrade">积分不足，查看升级方案</a>
      ) : (
        <button className="button primary" type="submit">生成图片</button>
      )}
    </form>
  );
}
```

- [ ] **Step 6: Run component tests**

Run:

```bash
npm test -- src/components/aspect-ratio-option.test.tsx src/components/create-form.test.tsx
```

Expected: PASS.

---

### Task 10: App Pages, Styling, and Middleware

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/login/page.tsx`
- Create: `src/app/create/page.tsx`
- Create: `src/app/history/page.tsx`
- Create: `src/app/upgrade/page.tsx`
- Create: `src/components/history-grid.tsx`
- Create: `src/middleware.ts`

- [ ] **Step 1: Create global styles based on approved preview**

Create `src/app/globals.css`:

```css
:root {
  --ink: #18231f;
  --muted: #64706b;
  --line: #dfe6e2;
  --paper: #f7f8f5;
  --surface: #ffffff;
  --green: #1f7a5a;
  --green-soft: #e5f2ec;
  --amber-soft: #fff5df;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
  letter-spacing: 0;
}
a { color: inherit; text-decoration: none; }
.shell { min-height: 100vh; }
.nav { height: 68px; display: flex; align-items: center; justify-content: space-between; padding: 0 42px; border-bottom: 1px solid var(--line); background: var(--surface); }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 800; }
.logo { width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; background: var(--ink); color: #fff; }
.button { min-height: 40px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; padding: 0 14px; border: 1px solid var(--line); font-weight: 700; }
.button.primary { background: var(--green); border-color: var(--green); color: #fff; }
.button.secondary { background: #fff; color: var(--ink); }
.hero { display: grid; grid-template-columns: 1fr 1fr; gap: 42px; align-items: center; padding: 72px 42px; }
.hero h1 { max-width: 650px; margin: 0; font-size: 52px; line-height: 1.08; }
.hero p { color: var(--muted); font-size: 17px; line-height: 1.8; }
.app-grid { display: grid; grid-template-columns: 230px 1fr; min-height: calc(100vh - 68px); }
.sidebar { border-right: 1px solid var(--line); padding: 22px; background: #fff; }
.workspace { padding: 28px; }
.create-layout { display: grid; grid-template-columns: minmax(360px, 0.9fr) minmax(420px, 1.1fr); gap: 22px; }
.panel { border: 1px solid var(--line); border-radius: 8px; background: var(--surface); padding: 18px; margin-bottom: 14px; }
.section-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.tag { border: 1px solid var(--line); border-radius: 999px; padding: 5px 9px; color: var(--muted); font-size: 12px; }
textarea, input[type="email"], input[type="password"] { width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 12px; font: inherit; background: #fff; }
textarea { min-height: 96px; resize: vertical; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 16px; }
.chip { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; background: #fff; color: var(--muted); font-weight: 650; }
.chip input { margin-right: 6px; }
.ratio-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 8px 0 16px; }
.ratio-option { min-height: 78px; border: 1px solid var(--line); border-radius: 8px; display: grid; place-items: center; gap: 5px; padding: 8px; background: #fff; color: var(--muted); font-weight: 750; }
.ratio-option input { position: absolute; opacity: 0; }
.ratio-option.is-selected { border-color: #7cbaa0; background: var(--green-soft); color: var(--green); }
.ratio-shape { border: 2px solid currentColor; border-radius: 4px; display: block; }
.ratio-square { width: 28px; height: 28px; }
.ratio-portrait { width: 22px; height: 34px; }
.ratio-wide { width: 42px; height: 24px; }
.ratio-tall { width: 18px; height: 38px; }
.ratio-landscape { width: 36px; height: 25px; }
.prompt-preview pre { white-space: pre-wrap; background: #0d2119; color: #dce9e2; border-radius: 8px; padding: 12px; min-height: 110px; }
.result-canvas { min-height: 420px; border: 1px solid var(--line); border-radius: 8px; background: linear-gradient(150deg, rgba(31,122,90,0.18), transparent 44%), #edf1ec; }
.history-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.history-card { border: 1px solid var(--line); border-radius: 8px; overflow: hidden; background: #fff; }
.history-card img { width: 100%; height: 180px; object-fit: cover; display: block; }
.history-card-body { padding: 14px; }
@media (max-width: 920px) {
  .nav { padding: 0 18px; }
  .hero, .app-grid, .create-layout { grid-template-columns: 1fr; }
  .hero { padding: 34px 18px; }
  .hero h1 { font-size: 34px; }
  .sidebar { display: none; }
  .workspace { padding: 18px; }
  .ratio-grid { grid-template-columns: repeat(3, 1fr); }
  .history-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Create root layout**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptCanvas",
  description: "Guided AI image generation with credits and history."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Create landing page**

Create `src/app/page.tsx`:

```tsx
import Link from "next/link";
import { LanguageSwitch } from "@/components/language-switch";

export default function HomePage() {
  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand"><span className="logo">P</span>PromptCanvas</div>
        <div style={{ display: "flex", gap: 10 }}>
          <LanguageSwitch locale="zh" />
          <Link className="button secondary" href="/login">登录</Link>
          <Link className="button primary" href="/create">开始生成</Link>
        </div>
      </nav>
      <section className="hero">
        <div>
          <h1>不用写复杂提示词，也能生成更稳定的 AI 图片。</h1>
          <p>填写主体，按需选择类型、比例、风格、场景和留白要求。系统会整理成结构化提示词，也支持上传 1 张参考图。</p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link className="button primary" href="/create">免费试用 2 次</Link>
            <Link className="button secondary" href="/login">登录账号</Link>
          </div>
        </div>
        <div className="result-canvas" aria-label="AI image preview" />
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Create login page**

Create `src/app/login/page.tsx`:

```tsx
export default function LoginPage() {
  return (
    <main className="shell">
      <section className="hero">
        <form className="panel" style={{ maxWidth: 420 }}>
          <div className="brand"><span className="logo">P</span>PromptCanvas</div>
          <h1 style={{ fontSize: 28 }}>登录或注册</h1>
          <p>注册后自动获得 2 个免费积分。第一版不做邮件验证和找回密码。</p>
          <label>邮箱</label>
          <input type="email" name="email" required />
          <label>密码</label>
          <input type="password" name="password" required />
          <button className="button primary" type="submit" style={{ width: "100%", marginTop: 16 }}>继续</button>
        </form>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Create protected create page**

Create `src/app/create/page.tsx`:

```tsx
import { CreditBadge } from "@/components/credit-badge";
import { CreateForm } from "@/components/create-form";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CreatePage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("credit_balance, locale").eq("user_id", user.id).single();
  const credits = data?.credit_balance ?? 0;

  return (
    <main className="app-grid">
      <aside className="sidebar">
        <div className="brand"><span className="logo">P</span>PromptCanvas</div>
        <CreditBadge credits={credits} />
      </aside>
      <section className="workspace">
        <h1>创建图片</h1>
        <p>只填写主体也可以生成，其余选项都是可选增强项。</p>
        <div className="create-layout">
          <CreateForm locale={data?.locale === "en" ? "en" : "zh"} credits={credits} />
          <div className="result-canvas" />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Create history and upgrade pages**

Create `src/components/history-grid.tsx`:

```tsx
type HistoryItem = {
  id: string;
  subject: string;
  aspect_ratio: string | null;
  style: string | null;
  created_at: string;
  imageUrl: string | null;
};

export function HistoryGrid({ items }: { items: HistoryItem[] }) {
  return (
    <div className="history-grid">
      {items.map((item) => (
        <article className="history-card" key={item.id}>
          {item.imageUrl ? <img src={item.imageUrl} alt={item.subject} /> : <div className="result-canvas" />}
          <div className="history-card-body">
            <h2>{item.subject}</h2>
            <p>{item.aspect_ratio ?? "1:1"} · {item.style ?? "默认风格"}</p>
            <small>{new Date(item.created_at).toLocaleString("zh-CN")}</small>
          </div>
        </article>
      ))}
    </div>
  );
}
```

Create `src/app/history/page.tsx`:

```tsx
import Link from "next/link";
import { HistoryGrid } from "@/components/history-grid";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("generations").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  const items = await Promise.all((data ?? []).map(async (item) => {
    const signed = item.generated_image_path
      ? await supabase.storage.from("generated-images").createSignedUrl(item.generated_image_path, 600)
      : { data: null };
    return { ...item, imageUrl: signed.data?.signedUrl ?? null };
  }));

  return (
    <main className="workspace">
      <h1>生成历史</h1>
      <Link className="button primary" href="/create">继续生成</Link>
      <HistoryGrid items={items} />
    </main>
  );
}
```

Create `src/app/upgrade/page.tsx`:

```tsx
import Link from "next/link";

export default function UpgradePage() {
  return (
    <main className="workspace">
      <section className="panel" style={{ maxWidth: 620 }}>
        <h1>升级积分</h1>
        <p>真实支付将在后续版本接入。第一版先保留升级入口和套餐展示。</p>
        <div className="panel">
          <h2>Creator</h2>
          <p>适合持续生成图片的个人用户。</p>
        </div>
        <Link className="button primary" href="/create">返回生成页</Link>
      </section>
    </main>
  );
}
```

- [ ] **Step 7: Create middleware**

Create `src/middleware.ts`:

```ts
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
```

- [ ] **Step 8: Run component tests and build**

Run:

```bash
npm test
npm run build
```

Expected: tests PASS and Next build succeeds.

---

### Task 11: Auth Form Actions

**Files:**
- Create: `src/app/login/actions.ts`
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Implement Supabase login/signup actions**

Create `src/app/login/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/login?error=login");
  }
  redirect("/create");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect("/login?error=signup");
  }
  redirect("/create");
}
```

- [ ] **Step 2: Wire actions into login page**

Modify `src/app/login/page.tsx`:

```tsx
import { signIn, signUp } from "./actions";

export default function LoginPage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="panel" style={{ maxWidth: 420 }}>
          <div className="brand"><span className="logo">P</span>PromptCanvas</div>
          <h1 style={{ fontSize: 28 }}>登录或注册</h1>
          <p>注册后自动获得 2 个免费积分。第一版不做邮件验证和找回密码。</p>
          <form action={signIn}>
            <label>邮箱</label>
            <input type="email" name="email" required />
            <label>密码</label>
            <input type="password" name="password" required />
            <button className="button primary" type="submit" style={{ width: "100%", marginTop: 16 }}>登录</button>
          </form>
          <form action={signUp}>
            <input type="email" name="email" required aria-label="注册邮箱" />
            <input type="password" name="password" required aria-label="注册密码" />
            <button className="button secondary" type="submit" style={{ width: "100%", marginTop: 10 }}>注册</button>
          </form>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds and login page compiles.

---

### Task 12: Final Verification

**Files:**
- Modify: `docs/superpowers/specs/2026-05-14-ai-image-saas-design.zh.md` if implementation decisions changed.
- Modify: `docs/env.example` if environment variables changed.

- [ ] **Step 1: Run all automated checks**

Run:

```bash
npm test
npm run build
```

Expected:

- All Vitest tests pass.
- Next.js production build succeeds.

- [ ] **Step 2: Start local dev server**

Run:

```bash
npm run dev
```

Expected:

- Dev server starts on `http://localhost:3000` or another printed port.
- `/` renders the Chinese landing page.
- `/login` renders email/password forms.
- `/create` redirects to `/login` when logged out.

- [ ] **Step 3: Manual Supabase/OpenAI verification**

With real environment variables configured:

1. Register a new user.
2. Confirm `profiles.credit_balance` is `2`.
3. Generate one subject-only image.
4. Confirm `profiles.credit_balance` becomes `1`.
5. Confirm a `generations` row is `succeeded`.
6. Confirm a generated image file exists in `generated-images`.
7. Generate with one reference image.
8. Confirm a reference file exists in `reference-images`.
9. Set credits to `0` manually and confirm `/api/generate` returns `402` without calling OpenAI.

- [ ] **Step 4: Document known limitations**

Add a short section to `README.md`:

```md
## MVP limitations

- Payment is not connected yet.
- Email verification and password reset are not enabled in v1.
- Only one optional reference image is supported.
- Image generation is synchronous; a queue can be added if generation latency becomes a problem.
```

---

## Self-Review

Spec coverage:

- Home, login, create, history, upgrade entry: Tasks 10 and 11.
- Credits and signup bonus: Tasks 4, 5, 7, 8, 11.
- Optional fields and reference image: Tasks 2, 3, 5, 7, 9.
- Ratio options with preview icons: Tasks 2 and 9.
- Chinese default and English switch: Tasks 2, 9, 10.
- Prompt preserves original language: Task 3.
- OpenAI image generation and reference image branch: Tasks 6 and 7.
- Private storage and signed history URLs: Tasks 4, 5, 8, 10.
- Testing and verification: Tasks 1 through 12.

No planned step requires real payment, email delivery, admin tools, complex SEO, multiple models, multiple reference images, or a full image editor.
