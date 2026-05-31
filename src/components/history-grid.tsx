import Link from "next/link";
import { ImageIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type HistoryItem = {
  id: string;
  subject: string;
  aspect_ratio: string | null;
  style: string | null;
  created_at: string;
  imageUrl: string | null;
};

export function HistoryGrid({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) {
    return (
      <section className="grid min-h-[420px] place-items-center rounded-[2rem] border border-dashed border-zinc-300 bg-white/75 p-8 text-center shadow-[0_28px_80px_-62px_rgba(24,24,27,0.65)]">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-[1.2rem] bg-zinc-950 text-white">
            <ImageIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-950">还没有生成记录</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">生成成功的图片会以作品库形式出现在这里，方便回看和对比。</p>
          <Button asChild className="mt-6" variant="accent">
            <Link href="/create">创建第一张图片</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="history-grid">
      {items.map((item, index) => (
        <article className="history-card group" key={item.id}>
          <div className="relative overflow-hidden">
            {item.imageUrl ? (
              <img className="transition duration-500 group-hover:scale-[1.03]" src={item.imageUrl} alt={item.subject} />
            ) : (
              <div className="grid min-h-64 place-items-center bg-[radial-gradient(circle_at_35%_20%,rgba(4,120,87,0.16),transparent_16rem),#f4f4f5]">
                <MagicWandIcon className="h-8 w-8 text-zinc-500" />
              </div>
            )}
            <div className="absolute left-3 top-3">
              <Badge variant={index % 2 === 0 ? "dark" : "accent"}>{item.aspect_ratio ?? "1:1"}</Badge>
            </div>
          </div>
          <div className="history-card-body">
            <h2>{item.subject}</h2>
            <p>{item.style ?? "默认风格"}</p>
            <small>{new Date(item.created_at).toLocaleString("zh-CN")}</small>
          </div>
        </article>
      ))}
    </div>
  );
}
