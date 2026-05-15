"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const supabase = await createSupabaseServerClient();

  if (!email || password.length < 6) {
    redirect("/login?error=signup");
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect("/login?error=signup");
  }
  if (!data.session) {
    redirect("/login?notice=check-email");
  }
  redirect("/create");
}
