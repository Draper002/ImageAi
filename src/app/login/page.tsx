import { signIn, signUp } from "./actions";

type LoginSearchParams = {
  error?: string | string[];
  notice?: string | string[];
};

type LoginPageProps = {
  searchParams?: Promise<LoginSearchParams>;
};

const errorMessages: Record<string, string> = {
  login: "登录失败，请检查邮箱和密码。",
  signup: "注册失败，请确认邮箱格式正确，或换一个未注册邮箱。",
  "signup-existing": "这个邮箱已经注册过，请直接登录，或换一个邮箱注册。",
  "signup-password": "注册失败，请确认密码至少 6 位。",
  "signup-rate-limited": "注册邮件发送过于频繁，请稍后再试。当前版本已改为不发送确认邮件，请刷新页面后重新注册。"
};

const noticeMessages: Record<string, string> = {
  "check-email": "注册已提交，但当前 Supabase 项目需要邮箱确认。请检查邮箱，或在 Supabase Auth 设置里关闭邮箱确认。"
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const errorMessage = errorMessages[firstParam(params.error) ?? ""];
  const noticeMessage = noticeMessages[firstParam(params.notice) ?? ""];

  return (
    <main className="shell">
      <section className="hero">
        <div className="panel login-card">
          <div className="brand"><span className="logo">P</span>PromptCanvas</div>
          <h1 style={{ fontSize: 28 }}>登录或注册</h1>
          <p>注册后自动获得 2 个免费积分。第一版不做邮件验证和找回密码。</p>

          {errorMessage ? (
            <p className="form-message error" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {noticeMessage ? (
            <p className="form-message success" role="status">
              {noticeMessage}
            </p>
          ) : null}

          <form action={signIn}>
            <label className="field-label" htmlFor="login-email">邮箱</label>
            <input id="login-email" type="email" name="email" required autoComplete="email" />
            <label className="field-label" htmlFor="login-password">密码</label>
            <input id="login-password" type="password" name="password" required autoComplete="current-password" />
            <button className="button primary" type="submit" style={{ width: "100%", marginTop: 16 }}>登录</button>
          </form>
          <form action={signUp}>
            <label className="field-label" htmlFor="signup-email">邮箱</label>
            <input id="signup-email" type="email" name="email" required autoComplete="email" aria-label="注册邮箱" />
            <label className="field-label" htmlFor="signup-password">密码</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
              aria-label="注册密码"
            />
            <button className="button secondary" type="submit" style={{ width: "100%", marginTop: 16 }}>注册</button>
          </form>
        </div>
      </section>
    </main>
  );
}
