# AI Image SaaS MVP Design

Date: 2026-05-14

## Summary

Build a deployable SaaS MVP for AI image generation. The product helps users generate better images without writing a full prompt from scratch. Users provide a required subject, then optionally choose image type, aspect ratio, style, scene, whitespace/composition requirements, reference image, and additional requirements. The system assembles a structured prompt and calls the OpenAI GPT Image API.

The site defaults to Chinese, with an English language switch. The MVP targets overseas/global deployment using Next.js, Vercel, Supabase, and OpenAI.

## Goals

- Provide a complete first-version SaaS flow: home, auth, image creation, history, credits, and upgrade entry.
- Give every new user 2 free credits.
- Charge 1 credit per successful generated image.
- Show an upgrade prompt when credits are insufficient.
- Store generated images and optional reference images in private Supabase Storage.
- Let users generate with only a subject, while offering optional controls for better output.
- Keep the actual prompt submitted to OpenAI in the user's original language where practical, instead of forcing English translation.

## Non-Goals

- Real payment integration.
- Email verification, password reset, or notification emails.
- Admin dashboard.
- Blog system or complex SEO.
- Full image editor, masking, inpainting UI, object removal, or local edits.
- Multiple image model selection.
- Multiple reference images in one generation.
- Async job queue and advanced task dashboard.

The original scope excluded reference image uploads. The latest approved scope includes one optional reference image, constrained as described below.

## Recommended Architecture

Use a Next.js full-stack monolith:

- Next.js App Router for pages, layouts, route handlers, and middleware.
- Supabase Auth for email/password auth.
- Supabase Postgres for profiles, credits, and generation records.
- Supabase Storage for private reference and generated image files.
- OpenAI Images API for generation and reference-image-based generation/editing.
- Vercel for deployment.

This keeps the MVP simple to deploy and maintain. Generation queues, background workers, payment, and admin tools can be split out later if traffic or product needs justify it.

## Pages

### `/`

Home page. It explains the product in Chinese by default, shows a concise generation workflow, and has clear calls to action:

- Start creating.
- Sign in / sign up.
- Upgrade entry.

No complex SEO, blog, or marketing CMS in v1.

### `/login`

Email/password login and registration using Supabase Auth.

First version does not implement email verification, password reset, or email notifications. On successful registration, the system creates a profile and grants 2 credits.

### `/create`

Main guided image generator.

Required input:

- Subject: the core thing the user wants to generate.

Optional inputs:

- Image type: general, poster, social cover, product image, illustration, avatar, banner, and similar presets.
- Aspect ratio: `1:1`, `4:5`, `16:9`, `9:16`, `3:2`.
- Style: realistic, minimalist, 3D, illustration, cinematic, watercolor, cyberpunk, and similar presets.
- Scene: indoor, outdoor, studio, nature, city, festival, e-commerce studio, and similar presets.
- Whitespace/composition: no special requirement, top whitespace, bottom whitespace, left whitespace, right whitespace, centered subject.
- Reference image: optional 1 image upload.
- Additional requirements: free text.

Aspect ratio controls must show both the numeric ratio and a small preview icon. The icon should visually convey square, vertical, horizontal, or wide framing. The component should use stable dimensions so labels and icons do not resize the layout.

Prompt preview is collapsible, but available for transparency. It should show:

- Chinese preview: a Chinese explanation of the assembled prompt for comprehension.
- English reference preview: an English version for users who want to inspect it.
- Actual submitted prompt: the exact prompt body that the backend will submit, preserving the user's original input language by default.

If the UI language is Chinese, Chinese content is primary. If the UI language is English, English content is primary. The actual submitted prompt remains explicitly labeled so users understand what is sent.

### `/history`

Shows the user's generation history in reverse chronological order.

Each item should display:

- Generated image preview.
- Creation time.
- Status.
- Parameter summary.
- Whether a reference image was used.
- Download action for successful images.

Failed records may appear with error status, but the page should emphasize successful image outputs.

### `/upgrade`

Placeholder upgrade page.

It shows intended plan options and a clear "payment coming soon" state. No real checkout or subscription logic in v1.

Insufficient-credit dialogs route users here.

## Language Strategy

The site defaults to Chinese. Users can switch to English.

Language preference:

- Store in browser first for all users.
- Add `profiles.locale` for logged-in users so the setting can persist server-side later.

Prompt behavior:

- Do not force user-provided subject or additional requirements into English.
- Preserve Chinese, English, or mixed-language user input.
- Generate structured prompt sections in the current UI language by default.
- Keep technical parameters such as aspect ratio explicit and unambiguous.
- Treat English optimization as a future optional mode, not the v1 default.

This reduces the risk of meaning drift from automatic translation and keeps user intent closer to the API call.

## Reference Image Scope

Reference image upload is optional.

MVP constraints:

- Maximum 1 reference image.
- Allowed formats: JPEG, PNG, WebP.
- Frontend file size limit: 10 MB.
- Show a thumbnail preview and remove button.
- Store accepted reference images in a private Supabase Storage bucket.
- Do not support multi-image blending, masking, inpainting UI, background removal, or local editing tools.

If no reference image is uploaded, the backend uses normal text-to-image generation. If a reference image is uploaded, the backend uses the OpenAI image endpoint that supports image input/reference/edit behavior for the configured GPT Image model.

## Credit Rules

- New registered users receive 2 credits.
- One successful image generation costs 1 credit.
- If a user has 0 credits, `/api/generate` returns an insufficient-credit error before calling OpenAI.
- Failed OpenAI calls do not consume credits.
- If a credit was reserved before the OpenAI call and the call fails, the system records a refund in the credit ledger.
- Credit operations must be handled atomically to avoid concurrent requests driving the balance below zero.

## Data Model

### `profiles`

One row per Supabase auth user.

Fields:

- `user_id` UUID primary key, references `auth.users`.
- `email` text.
- `credit_balance` integer, default `2`.
- `locale` text, default `zh`.
- `created_at` timestamptz.
- `updated_at` timestamptz.

### `credit_ledger`

Append-only credit history.

Fields:

- `id` UUID primary key.
- `user_id` UUID.
- `amount` integer. Positive for grants/refunds, negative for usage.
- `reason` text, such as `signup_bonus`, `generation_debit`, `generation_refund`, `manual_adjustment`, `future_purchase`.
- `generation_id` UUID nullable.
- `created_at` timestamptz.

### `generations`

One row per generation attempt.

Fields:

- `id` UUID primary key.
- `user_id` UUID.
- `status` text: `processing`, `succeeded`, or `failed`.
- `subject` text.
- `image_type` text nullable.
- `aspect_ratio` text nullable.
- `style` text nullable.
- `scene` text nullable.
- `whitespace` text nullable.
- `additional_requirements` text nullable.
- `locale` text.
- `prompt_preview_zh` text nullable.
- `prompt_preview_en` text nullable.
- `submitted_prompt` text.
- `reference_image_path` text nullable.
- `generated_image_path` text nullable.
- `error_message` text nullable.
- `created_at` timestamptz.
- `updated_at` timestamptz.

### Storage Buckets

- `reference-images`: private bucket for uploaded reference images.
- `generated-images`: private bucket for generated outputs.

History views should use short-lived signed URLs rather than exposing private storage paths directly.

## Backend API

### `POST /api/generate`

Responsibilities:

1. Verify Supabase session.
2. Validate subject is present.
3. Validate optional fields and additional requirements length.
4. Validate optional reference image format, count, and size.
5. Create prompt previews and the submitted prompt.
6. Atomically reserve or debit 1 credit and create a `processing` generation record.
7. Upload the reference image to private storage if provided.
8. Call OpenAI Images API:
   - No reference image: text-to-image generation.
   - With reference image: image-input/reference/edit flow.
9. Store the generated result in private storage.
10. Mark the generation as `succeeded`.
11. On failure, mark the generation as `failed` and refund any reserved credit.

The backend must not trust a prompt assembled on the client. Client previews are for display only; server-side code performs final prompt assembly.

### `GET /api/generations`

Returns the current user's generation records with signed URLs for images.

### `GET /api/credits`

Returns the current user's credit balance.

### Auth Callback and Middleware

Use Supabase's recommended Next.js middleware/session pattern. Protected routes include `/create` and `/history`.

## Prompt Assembly

The prompt builder accepts structured inputs and returns:

- `promptPreviewZh`.
- `promptPreviewEn`.
- `submittedPrompt`.

Default behavior:

- Subject is required and preserved in original language.
- Missing image type means general high-quality image.
- Missing aspect ratio means default `1:1`.
- Missing style means clean, high-quality, visually appealing output.
- Missing scene means no extra scene constraint.
- Missing whitespace means no extra composition constraint.
- Missing additional requirements means no extra free-text section.
- Reference image adds an instruction to use the uploaded image as visual reference while following the prompt.

The submitted prompt should be structured and explicit. For Chinese UI, a Chinese submitted prompt is acceptable and expected. For English UI, an English submitted prompt is acceptable. User-provided content should not be machine-translated by default.

## Error Handling

User-facing errors should be concise:

- Not logged in: redirect to login.
- Missing subject: ask user to enter the subject.
- Invalid reference image: explain allowed formats and size.
- Insufficient credits: show upgrade dialog.
- Generation failed: show a retry-friendly message and do not consume credits.

Server logs should preserve enough detail for debugging, but avoid leaking API keys or private signed URLs.

## Security and Privacy

- Enable Row Level Security on all business tables.
- Users can only read their own profiles, ledger rows, and generation records.
- Storage buckets are private.
- Signed URLs should be short-lived.
- OpenAI API key and Supabase service role key must only be used server-side.
- File uploads must be validated before storage and OpenAI calls.

## Testing Plan

Cover these cases:

- Unauthenticated users are redirected from `/create` and `/history`.
- New user registration creates profile and grants 2 credits.
- Subject-only generation is allowed.
- Optional fields can be omitted without blocking generation.
- Aspect ratio selector shows numeric labels and preview icons on desktop and mobile.
- Reference image upload accepts only one JPEG, PNG, or WebP under the limit.
- Insufficient credits prevent OpenAI calls and show upgrade prompt.
- Successful generation deducts exactly 1 credit and creates history.
- Failed generation refunds or preserves credits and records failure.
- History only shows the current user's records.
- UI defaults to Chinese and can switch to English.
- Prompt preview shows Chinese, English reference, and actual submitted prompt.
- Backend submits a prompt that preserves user input language by default.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_IMAGE_MODEL`
- `NEXT_PUBLIC_APP_URL`

`OPENAI_IMAGE_MODEL` should default to the current GPT Image model available for the account during implementation. Keeping it configurable avoids hard-coding a model name if OpenAI availability changes.

## Implementation Notes

- Use local dictionary files for Chinese and English UI strings in v1.
- Use a focused `AspectRatioOption` component for ratio buttons with icons.
- Use a server-only prompt builder for final submitted prompt generation.
- Use database functions or transaction-safe SQL for credit debit and refund.
- Keep payment integration out of v1, but make ledger reasons compatible with future purchases.
- Keep reference image logic isolated so future multi-reference or edit features can be added without rewriting the main form.
