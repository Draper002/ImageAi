import Link from "next/link";
import { HistoryGrid } from "@/components/history-grid";
import { requireUser } from "@/lib/auth";
import { hasSupabasePublicConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <main className="workspace">
        <div className="workspace-header">
          <div>
            <h1>生成历史</h1>
            <p>暂无生成记录，完成第一次生成后会显示在这里。</p>
          </div>
          <Link className="button primary" href="/create">继续生成</Link>
        </div>
        <HistoryGrid items={[]} />
      </main>
    );
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = await Promise.all((data ?? []).map(async (item) => {
    const signed = item.generated_image_path
      ? await supabase.storage.from("generated-images").createSignedUrl(item.generated_image_path, 600)
      : { data: null };
    return { ...item, imageUrl: signed.data?.signedUrl ?? null };
  }));

  return (
    <main className="workspace">
      <div className="workspace-header">
        <div>
          <h1>生成历史</h1>
          <p>按时间倒序展示，图片通过私有存储 signed URL 访问。</p>
        </div>
        <Link className="button primary" href="/create">继续生成</Link>
      </div>
      <HistoryGrid items={items} />
    </main>
  );
}
