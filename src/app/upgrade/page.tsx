import Link from "next/link";

export default function UpgradePage() {
  return (
    <main className="workspace">
      <section className="panel" style={{ maxWidth: 620 }}>
        <h1>升级积分</h1>
        <p>真实支付将在后续版本接入。第一版先保留升级入口和套餐展示。</p>
        <div className="panel">
          <h2>Creator</h2>
          <p>适合持续生成图片的个人用户。支付即将上线。</p>
        </div>
        <Link className="button primary" href="/create">返回生成页</Link>
      </section>
    </main>
  );
}
