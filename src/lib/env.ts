const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "OPENAI_IMAGE_MODEL",
  "NEXT_PUBLIC_APP_URL"
] as const;

export type AppEnv = Record<(typeof requiredKeys)[number], string>;
const supabasePublicKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

export function hasSupabasePublicConfig(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
) {
  return supabasePublicKeys.every((key) => Boolean(source[key]));
}

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
