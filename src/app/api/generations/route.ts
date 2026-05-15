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
