# Content TODO

Every fact below is missing on purpose. The site shows a dashed `TODO:` chip where each one goes. Text lives in `messages/{uz,en,ru}.json`; untranslated facts live in `content/profile.ts`.

## Facts to fill in

| Where | What's missing | How to fill it |
|---|---|---|
| Hero | Photo | Add an optimized image to `public/` and replace the placeholder in `components/Hero.tsx` (wrap it in the `.mat` frame) |
| 02 What I teach | Days and hours available | Replace `teach.availabilityTodo` in all three message files |
| 03 Teaching experience | Learning Skills Lab: start date, number of students, results | Replace the `experience.*Todo` keys |
| 04 How I teach | Confirm or edit the five steps (step 3 was edited in the mockup and may need rewording) | Edit `method.step1`–`step5`, then remove `method.confirmTodo` |
| 05 Tools | Screenshots (only the diagnostic card has a slot right now) | Add images and replace the `tools.screenshotTodo` placeholder |
| 05 Tools | Is the IELTS Reading analyzer online? If so, its URL | Set `tools.ieltsUrl` in `content/profile.ts`; the TODO chip disappears and "Open" becomes a link |
| 07 Leadership | Inquirum: year, number of participants | Replace the `leadership.*Todo` keys |
| 07 Leadership | Atlon Group: number of regions or members | Replace `leadership.sizeTodo` |
| 08 Contact | Telegram username | Set `contact.telegram` in `content/profile.ts` |
| 08 Contact | Phone number | Set `contact.phone` in `content/profile.ts` |
| 08 Contact | Site URL for the QR code | Automatic on Vercel (production domain); otherwise set `NEXT_PUBLIC_SITE_URL` |

## Left out until confirmed

- **IELTS module.** Mockup 1a showed "Academic" under IELTS 7.0. PLAN.md doesn't say which module, so it isn't shown.

## Translations to proofread

- `messages/uz.json`: drafted by AI from the mockup. Check the wording and the ʻ / ʼ characters.
- `messages/en.json`, `messages/ru.json`: machine-translated from Uzbek.
- Each file has a `_translation` note at the top that says this.
