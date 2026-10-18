# Nurulloxon: portfolio (Phase 1)

A Next.js (App Router) + next-intl + Tailwind site, built from the Claude Design mockups in `../project/Nurulloxon Mockups.dc.html` (1a–1c) and `../project/uploads/PLAN.md`.

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /uz
npm run build
```

- Routes: `/uz` (default), `/en`, `/ru`, all prerendered as static pages.
- Text: `messages/*.json`. Untranslated facts (scores, contacts, links): `content/profile.ts`.
- Styling: tokens and components from the Classical design system, in `app/globals.css`. Light/dark themes follow the system setting; the footer toggle overrides it and remembers the choice.
- Missing facts: `CONTENT_TODO.md`.

## Deploy on Vercel

Import the repo and set **Root Directory** to `site`. No environment variables are needed for Phase 1. The contact QR code points to the production `*.vercel.app` domain unless `NEXT_PUBLIC_SITE_URL` is set.
