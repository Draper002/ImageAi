import Link from "next/link";
import { CheckCircledIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { LanguageSwitch } from "@/components/language-switch";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "./actions";

type LoginSearchParams = {
  error?: string | string[];
  mode?: string | string[];
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

const signupErrors = new Set(["signup", "signup-existing", "signup-password", "signup-rate-limited"]);

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const errorKey = firstParam(params.error) ?? "";
  const errorMessage = errorMessages[errorKey];
  const noticeMessage = noticeMessages[firstParam(params.notice) ?? ""];
  const isSignupMode = firstParam(params.mode) === "signup" || signupErrors.has(errorKey);

  return (
    <main id="main-content" className="shell auth-shell px-4">
      <div className="auth-topbar">
        <Link className="brand" href="/">
          <span className="logo">P</span>
          PromptCanvas
        </Link>
        <LanguageSwitch locale="zh" path="/login" />
      </div>

      <section className="mx-auto grid min-h-[calc(100dvh-82px)] w-[min(1120px,100%)] items-center gap-8 py-10 lg:grid-cols-[1fr_440px]">
        <div>
          <Badge variant="accent">Account</Badge>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-zinc-950 md:text-6xl">
            登录后进入你的 AI 图片创作工作台
          </h1>
          <p className="mt-6 max-w-[62ch] text-lg leading-8 text-zinc-600">
            新用户自动获得 2 个积分。你可以先用参数化表单生成图片，再从历史作品库里获取灵感。
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["参数化 prompt", "提示词预览", "积分账单", "历史作品库"].map((item) => (
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700" key={item}>
                <CheckCircledIcon className="h-4 w-4 text-emerald-700" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-zinc-950 text-white">
                <MagicWandIcon />
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950">{isSignupMode ? "创建账号" : "登录账号"}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{isSignupMode ? "填写邮箱和密码后即可进入生图工作台。" : "输入账号信息后继续使用生图工作台。"}</p>
            </div>
          </div>

          {errorMessage ? (
            <p className="form-message error mb-4" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {noticeMessage ? (
            <p className="form-message success mb-4" role="status">
              {noticeMessage}
            </p>
          ) : null}

          {isSignupMode ? (
            <>
              <form action={signUp} className="space-y-4">
                <div>
                  <label className="field-label" htmlFor="signup-email">邮箱</label>
                  <Input id="signup-email" type="email" name="email" required autoComplete="email" aria-label="注册邮箱" />
                </div>
                <div>
                  <label className="field-label" htmlFor="signup-password">密码</label>
                  <Input
                    id="signup-password"
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    aria-label="注册密码"
                  />
                </div>
                <SubmitButton className="button primary full-width min-h-12" pendingChildren="创建中...">创建账号</SubmitButton>
              </form>
              <div className="auth-switch">
                <span>已经有账号？</span>
                <Button asChild variant="secondary"><Link href="/login">返回登录</Link></Button>
              </div>
            </>
          ) : (
            <>
              <form action={signIn} className="space-y-4">
                <div>
                  <label className="field-label" htmlFor="login-email">邮箱</label>
                  <Input id="login-email" type="email" name="email" required autoComplete="email" />
                </div>
                <div>
                  <label className="field-label" htmlFor="login-password">密码</label>
                  <Input id="login-password" type="password" name="password" required autoComplete="current-password" />
                </div>
                <SubmitButton className="button primary full-width min-h-12" pendingChildren="登录中...">登录</SubmitButton>
              </form>
              <div className="auth-switch">
                <span>还没有账号？</span>
                <Button asChild variant="secondary"><Link href="/login?mode=signup">创建账号</Link></Button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
