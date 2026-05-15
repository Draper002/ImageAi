import { signIn, signUp } from "./actions";

export default function LoginPage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="panel login-card">
          <div className="brand"><span className="logo">P</span>PromptCanvas</div>
          <h1 style={{ fontSize: 28 }}>登录或注册</h1>
          <p>注册后自动获得 2 个免费积分。第一版不做邮件验证和找回密码。</p>
          <form action={signIn}>
            <label className="field-label">邮箱</label>
            <input type="email" name="email" required />
            <label className="field-label">密码</label>
            <input type="password" name="password" required />
            <button className="button primary" type="submit" style={{ width: "100%", marginTop: 16 }}>登录</button>
          </form>
          <form action={signUp}>
            <label className="field-label">邮箱</label>
            <input type="email" name="email" required aria-label="注册邮箱" />
            <label className="field-label">密码</label>
            <input type="password" name="password" required aria-label="注册密码" />
            <button className="button secondary" type="submit" style={{ width: "100%", marginTop: 16 }}>注册</button>
          </form>
        </div>
      </section>
    </main>
  );
}
