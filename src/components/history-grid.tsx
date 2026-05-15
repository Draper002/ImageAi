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
      <section className="panel">
        <h2>还没有生成记录</h2>
        <p>生成成功的图片会出现在这里。</p>
      </section>
    );
  }

  return (
    <div className="history-grid">
      {items.map((item) => (
        <article className="history-card" key={item.id}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.subject} />
          ) : (
            <div className="image-fallback result-canvas" />
          )}
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
