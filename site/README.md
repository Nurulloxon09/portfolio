# Nurulloxon: portfolio

A Next.js (App Router) + next-intl site in the style of [henryheffernan.com](https://henryheffernan.com):
a 3D computer on a desk whose monitor runs a Windows 95 style desktop, NurulloxonOS, with the portfolio inside.

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /uz
npm run build
npm run lint     # typecheck
```

## Routes

- `/uz`, `/en`, `/ru`: the 3D desk. A plain loading screen (name, title, progress bar) fades into the
  scene once the models are in. Click to walk up to the desk; move the pointer over the screen to zoom in and use the desktop.
- `/uz/os`, `/en/os`, `/ru/os`: the desktop on its own. The monitor shows this page in an iframe, and it is
  also where phones, keyboards, screen readers and search engines get the content (the 3D page links to it).

All six pages are prerendered as static pages.

## Where things are

- Text: `messages/*.json`. Untranslated facts (scores, contacts, links): `content/profile.ts`.
- `scene/`: the Three.js scene (camera, renderer, monitor, audio). See `scene/README.md`.
- `components/scene/`: the React overlay on the 3D page (loading screen, prompt, name and clock).
- `components/os/`: the desktop: windows, taskbar and Start menu, and the apps in `apps/`
  (My Portfolio, the uteach teacher demo and Minesweeper). The uteach demo is show-only: made-up
  students in `apps/uteach-data.ts`, and marks stay in the window.
- `public/scene/`: models, baked textures, sounds and the monitor's static-noise videos.
- `scripts/retexture.py`: redraws the names and scores baked into the 3D textures.
- Facts that can still be added, and translation notes: `CONTENT_TODO.md`.

## Credits and license

The 3D scene is adapted from Henry Heffernan's [portfolio-website](https://github.com/henryjeff/portfolio-website),
under the MIT license (`scene/LICENSE.md`). The computer model is by Mickael Boitte and the room models by
Sean Nicolas, as credited in the original. The desktop (`components/os/`) is written from scratch for this
site; the original's desktop repository has no license, so none of its code or assets are used.

## Deploy on Vercel

Import the repo and set **Root Directory** to `site`. No environment variables are needed. The contact QR
code points to the production `*.vercel.app` domain unless `NEXT_PUBLIC_SITE_URL` is set.
