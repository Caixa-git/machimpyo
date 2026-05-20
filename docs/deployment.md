# Vercel Deployment Guide — 마침표 (ClearMe)

> **App**: [github.com/Caixa-git/machimpyo](https://github.com/Caixa-git/machimpyo)
> **Stack**: Next.js 16 + TypeScript + Tailwind v4 + Supabase + Resend

---

## Prerequisites

1. **A Vercel account** — [vercel.com](https://vercel.com) (log in with GitHub)
2. **A Supabase project** — [supabase.com](https://supabase.com) dashboard
3. **A Resend API key** — [resend.com/api-keys](https://resend.com/api-keys)
4. **Vercel CLI** (optional, for local deploy) — `npm i -g vercel`

---

## Step 1: Environment Variables

These **must** be set in the Vercel Project Dashboard (Settings → Environment Variables):

| Variable | Public | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ No | Supabase → Settings → API → service_role key |
| `RESEND_API_KEY` | ❌ No | Resend → API Keys |
| `NEXT_PUBLIC_BASE_URL` | ✅ Yes | `https://your-project.vercel.app` (or custom domain) |

**Copy reference**: see `.env.example` in the repo root.

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` has admin privileges — **never** expose it to the client. Vercel keeps server-only env vars out of client bundles automatically when prefixed without `NEXT_PUBLIC_`.

---

## Step 2: Deploy from GitHub (Recommended)

1. Push the repo to GitHub (`git push origin master`)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the `Caixa-git/machimpyo` repository
4. Vercel auto-detects:
   - **Framework**: Next.js
   - **Build Command**: `next build` (from `vercel.json`)
   - **Output Directory**: `.next` (from `vercel.json`)
5. Add all **5 environment variables** from Step 1
6. Click **Deploy**

The first deploy takes ~2 minutes. Subsequent deploys are incremental.

---

## Step 3: Deploy via CLI (Alternative)

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Log in (browser opens for authentication)
vercel login

# From the project root, deploy
cd ~/machimpyo
vercel

# Follow prompts — Vercel will ask to link to an existing project or create one.
# Set env vars interactively with:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add NEXT_PUBLIC_BASE_URL

# For production deploy:
vercel --prod
```

---

## Step 4: Configure Domain (Optional)

1. In Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `clearme.kr` or `machimpyo.com`)
3. Follow Vercel's DNS instructions (add CNAME record at your DNS provider)
4. Update `NEXT_PUBLIC_BASE_URL` env var to the custom domain

---

## Post-Deploy Checklist

- [ ] Visit the deployed URL — landing page loads correctly
- [ ] Test `/machimpyo` subpath — machimpyo layout renders
- [ ] Test sign-up flow at `/machimpyo/auth/signup`
- [ ] Verify Supabase auth callback at `/auth/callback`
- [ ] Check Vercel Function Logs for any runtime errors
- [ ] Send a test email (trigger a scan or waitlist action)

---

## Troubleshooting

### Build fails — "Missing environment variables"
Make sure all **5 env vars** are set in Vercel Dashboard → Settings → Environment Variables for the **Production** environment.

### Supabase auth callback returns 404
The callback route is at `/auth/callback` — in Supabase Dashboard → Authentication → Settings, set **Site URL** to your Vercel deployment URL and add the URL to **Redirect URLs**.

### Emails not sending
Verify the `RESEND_API_KEY` is correct. Resend requires domain verification for production — add and verify your sending domain in Resend dashboard.

### Session cookies not working on custom domain
Make sure the Supabase `AUTH_COOKIE_DOMAIN` is configured correctly in Supabase settings if using a subdomain.

---

## Architecture Notes

- **Routing**: `/` = ClearMe landing page; `/machimpyo/*` = machimpyo service routes
- **Middleware**: `src/middleware.ts` refreshes Supabase auth session on every request
- **API routes**: All under `src/app/api/` — scan triggers, admin callbacks, waitlist
- **Email**: Built with `@react-email/components`, sent via Resend SDK
- **Database**: Supabase (Postgres) — migrations in `supabase/migrations/`
