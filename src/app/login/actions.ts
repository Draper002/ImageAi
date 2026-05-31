"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

function signupErrorTarget(error?: AuthErrorLike | null) {
  const message = error?.message?.toLowerCase() ?? "";
  if (error?.code === "over_email_send_rate_limit" || error?.status === 429) {
    return "/login?mode=signup&error=signup-rate-limited";
  }
  if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
    return "/login?mode=signup&error=signup-existing";
  }
  if (message.includes("password")) {
    return "/login?mode=signup&error=signup-password";
  }
  return "/login?mode=signup&error=signup";
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/login?error=login");
  }
  redirect("/create");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 6) {
    redirect("/login?mode=signup&error=signup-password");
  }

  const admin = createSupabaseAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (createError) {
    redirect(signupErrorTarget(createError));
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect(signupErrorTarget(signInError));
  }

  redirect("/create");
}
