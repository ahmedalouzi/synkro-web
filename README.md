# synkro-web

The Synkro website: landing page, pricing, docs, download, account and billing.
Next.js 14 (App Router) + Tailwind CSS. English only.

## Run locally

```bash
npm install
cp .env.example .env.local   # then edit the values
npm run dev                  # http://localhost:3000
```

Sign-in and the account pages need the Synkro server running (`SYNKRO_API_URL`, default `http://localhost:8080`).

## Pages

| Path | What it is | Linked from the desktop app |
|---|---|---|
| `/` | Landing page | — |
| `/pricing` | Free vs Pro, FAQ | Upgrade to Pro (top bar, start page, settings) |
| `/download` | Installers | — |
| `/docs` | How to use Synkro | Settings › Docs ↗ |
| `/account` | Sign in, plan and usage | Settings › Synkro Account › Open ↗ |
| `/account/billing` | Subscription and invoices | Settings › Plan & Usage › Billing |
| `/privacy`, `/terms` | Legal — **drafts**, fill in the `[brackets]` and have them reviewed | — |

In the desktop app, set `VITE_SYNKRO_WEB_URL` (in `apps/desktop/.env`) to this site's URL before building a release.

## How sign-in works

The browser never talks to the Synkro server directly. `src/app/api/*` routes call the server from the site's
server side and keep the session in **httpOnly** cookies (`src/lib/session.ts`), so tokens are not readable by
page scripts and the API needs no CORS.

## Payments

Not connected yet. Until `NEXT_PUBLIC_CHECKOUT_URL` is set, the Pro button reads “Pro opens soon” instead of
linking anywhere. When a provider is chosen (Lemon Squeezy or Stripe):

1. Set `NEXT_PUBLIC_CHECKOUT_URL` (hosted checkout link) and `NEXT_PUBLIC_BILLING_PORTAL_URL` (customer portal).
2. On the Synkro server, add the webhook that sets `users.plan` to `pro` / `free` (Trello card **B5**).

Plan limits shown on `/pricing` mirror `PLAN_POLICIES` in the Synkro repo
(`packages/agent/src/models/usage-limits.ts`) — update both together.

## Deploy

Vercel: import the repo, set the environment variables from `.env.example`, deploy.
