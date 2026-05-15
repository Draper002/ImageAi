# PromptCanvas

AI 生图 SaaS MVP。用户填写主体，也可以选择图片类型、比例、风格、场景、留白要求和 1 张参考图。系统组装结构化提示词，调用 OpenAI 图片接口生成图片，并用 Supabase 保存账号、积分、历史和私有图片。

## 本地开发

1. 安装依赖：

```bash
npm.cmd install --cache .npm-cache
```

2. 复制环境变量：

```bash
copy docs\env.example .env.local
```

3. 填写 `.env.local` 中的 Supabase 和 OpenAI 配置。

4. 启动开发服务器：

```bash
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

5. 打开：

```text
http://127.0.0.1:3000
```

## Supabase

初始化数据库时执行：

```bash
supabase db push
```

迁移文件：

```text
supabase/migrations/001_initial_schema.sql
```

## 验证

```bash
npm.cmd test
npm.cmd exec tsc -- --noEmit --pretty false
npm.cmd run build
```

## MVP 限制

- 第一版不接真实支付。
- 第一版不做邮箱验证、找回密码或邮件通知。
- 每次生成最多支持 1 张可选参考图。
- 图片生成当前是同步请求；如果生成耗时明显，再加入队列和任务状态面板。
