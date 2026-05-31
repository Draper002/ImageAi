import Link from "next/link";
import { Cross2Icon, DashboardIcon, ExitIcon, ImageIcon, PersonIcon } from "@radix-ui/react-icons";
import { signOut } from "@/app/account/actions";
import type { Locale } from "@/lib/presets";
import { RechargeButton } from "./recharge-dialog";

type AccountMenuProps = {
  credits: number;
  email: string;
  locale?: Locale;
  placement?: "floating" | "sidebar";
};

const copy = {
  zh: {
    openLabel: "打开账号菜单",
    accountSummary: "账号",
    currentAccount: "当前账号",
    credits: "积分",
    account: "账户概览",
    create: "生图页面",
    history: "生成历史",
    recharge: "充值积分",
    signOut: "退出登录"
  },
  en: {
    openLabel: "Open account menu",
    accountSummary: "Account",
    currentAccount: "Current account",
    credits: "credits",
    account: "Account",
    create: "Create page",
    history: "Generation history",
    recharge: "Recharge credits",
    signOut: "Sign out"
  }
} satisfies Record<Locale, Record<string, string>>;

function initialFromEmail(email: string) {
  return email.trim().charAt(0).toUpperCase() || "U";
}

function href(path: string, locale: Locale) {
  return locale === "en" ? `${path}?locale=en` : path;
}

export function AccountMenu({ credits, email, locale = "zh", placement = "floating" }: AccountMenuProps) {
  const t = copy[locale];

  return (
    <details className={`account-menu account-menu-${placement}`}>
      <summary className="account-trigger" aria-label={t.openLabel}>
        <span className="account-avatar" aria-hidden="true">
          <span className="avatar-initial">{initialFromEmail(email)}</span>
          <Cross2Icon className="avatar-close" />
        </span>
        <span className="account-summary">
          <span>{t.accountSummary}</span>
          <strong>{email}</strong>
        </span>
      </summary>
      <div className="account-popover">
        <div className="account-meta">
          <span className="account-label">{t.currentAccount}</span>
          <strong className="account-email">{email}</strong>
          <span className="account-credits">{credits} {t.credits}</span>
        </div>
        <Link className="account-action" href={href("/account", locale)}><PersonIcon className="mr-2 h-4 w-4" />{t.account}</Link>
        <Link className="account-action" href={href("/create", locale)}><DashboardIcon className="mr-2 h-4 w-4" />{t.create}</Link>
        <Link className="account-action" href={href("/history", locale)}><ImageIcon className="mr-2 h-4 w-4" />{t.history}</Link>
        <RechargeButton className="account-action" label={t.recharge} locale={locale} />
        <form action={signOut}>
          <button className="account-action danger" type="submit"><ExitIcon className="mr-2 h-4 w-4" />{t.signOut}</button>
        </form>
      </div>
    </details>
  );
}
