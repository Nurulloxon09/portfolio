# Content notes

There are no TODO chips on the site any more. Untranslated facts live in `content/profile.ts` and text in `messages/{uz,en,ru}.json`.

## Facts that appear once you add them

| What | Where it shows | How to add it |
|---|---|---|
| Telegram username | Contact page, with a Copy button | Set `contact.telegram` in `content/profile.ts` |
| Phone number | Contact page, with a Copy button | Set `contact.phone` in `content/profile.ts` |
| Site URL for the QR code | Contact page | Automatic on Vercel (production domain); otherwise set `NEXT_PUBLIC_SITE_URL` |

Until Telegram or the phone number is set, the Contact page only shows the QR code.

## Baked into the 3D textures

The sheet of paper on the desk and the stickers on the back of the computer show the scores (SAT 1440, Math 750, R&W 690, IELTS 7.0), the eight SAT domains, the five teaching steps and "Namangan". They are part of the texture images, in English, so they don't change with `profile.ts` or the language. If any of them changes, edit and run `scripts/retexture.py`.

## Left out until confirmed

- **IELTS module.** Mockup 1a showed "Academic" under IELTS 7.0. PLAN.md doesn't say which module, so it isn't shown.

## Translations to proofread

- `messages/uz.json`: drafted by AI. Check the wording and the ʻ / ʼ characters, including the new `scene`, `os`, `apps`, `showcase` and `minesweeper` sections.
- `messages/en.json`, `messages/ru.json`: machine-translated from Uzbek, plus the same new sections.
- Each file has a `_translation` note at the top that says this.
