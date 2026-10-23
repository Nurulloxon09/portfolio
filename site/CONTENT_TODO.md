# Content TODO

Every fact below is missing on purpose. The site shows a red dashed `TODO:` chip where each one goes. Text lives in `messages/{uz,en,ru}.json`; untranslated facts live in `content/profile.ts`.

## Facts to fill in

| Where (My Portfolio window) | What's missing | How to fill it |
|---|---|---|
| Experience | Learning Skills Lab: results | Replace `experience.resultsTodo` |
| Experience | Inquirum: year | Replace `leadership.yearTodo` |
| Projects | Screenshots (only the diagnostic card has a slot right now) | Add images and replace the `tools.screenshotTodo` placeholder |
| Projects | Is the IELTS Reading analyzer online? If so, its URL | Set `tools.ieltsUrl` in `content/profile.ts`; the TODO chip disappears and an "Open" button appears |
| Contact | Telegram username | Set `contact.telegram` in `content/profile.ts` |
| Contact | Phone number | Set `contact.phone` in `content/profile.ts` |
| Contact | Site URL for the QR code | Automatic on Vercel (production domain); otherwise set `NEXT_PUBLIC_SITE_URL` |

## Baked into the 3D textures

The sheet of paper on the desk and the stickers on the back of the computer show the scores (SAT 1440, Math 750, R&W 690, IELTS 7.0), the eight SAT domains, the five teaching steps and "Namangan". They are part of the texture images, in English, so they don't change with `profile.ts` or the language. If any of them changes, edit and run `scripts/retexture.py`.

## Left out until confirmed

- **IELTS module.** Mockup 1a showed "Academic" under IELTS 7.0. PLAN.md doesn't say which module, so it isn't shown.

## Translations to proofread

- `messages/uz.json`: drafted by AI. Check the wording and the ʻ / ʼ characters, including the new `scene`, `os`, `apps`, `showcase` and `minesweeper` sections.
- `messages/en.json`, `messages/ru.json`: machine-translated from Uzbek, plus the same new sections.
- Each file has a `_translation` note at the top that says this.
