# Nurulloxon — Personal Site + Student Platform

Build plan for Claude Code. Read the whole file before writing code. Build one phase at a time and stop at the end of each phase so I can check it.

---

## 1. What this is

One website with two jobs:

1. **Public portfolio** for learning-center managers in Namangan. I am applying to teach SAT Math. When a manager opens the site on my phone, they should understand in 10 seconds: strong scores, real teaching experience, a clear teaching system, and that I build my own tools for students.
2. **Student platform** behind a login. My students use tools I built (SAT Math diagnostic, SAT mistake analyzer, IELTS Reading analyzer). I see every student's progress in a teacher dashboard.

The two parts support each other. The portfolio says "I track every student's mistakes." The platform proves it.

## 2. Hard rules

- **Never invent facts.** No made-up numbers, student results, testimonials, dates, or quotes. Anywhere a fact is missing, leave a visible `TODO:` placeholder and list it in `CONTENT_TODO.md`.
- **Mobile first.** The main way people see this site is on a phone held across a desk. Test every page at 390px width.
- **Three languages:** Uzbek (Latin script, default), English, Russian. Every user-facing string comes from translation files. No hard-coded text in components.
- **Free tier only.** No paid services.
- **Secrets stay on the server.** The Gemini key and Supabase service key never reach the browser.

## 3. Stack

| Part | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Runs on Vercel, server routes hide API keys |
| Styling | Tailwind CSS | Fast to build, easy to keep consistent |
| i18n | `next-intl`, routes `/uz`, `/en`, `/ru` | Locale in the URL, JSON message files |
| Auth + database + file storage | Supabase (free plan) | Login, Postgres, row-level security, screenshot storage |
| AI | Gemini API via Google AI Studio (free key), a Flash model | Already used for the IELTS tool |
| Math rendering | KaTeX | SAT questions need formulas |
| Hosting | Vercel, free `*.vercel.app` subdomain | Free, deploys from GitHub |

Use current stable versions of everything.

### Environment variables

```
GEMINI_API_KEY=                     # server only
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server only
AI_DAILY_LIMIT_PER_STUDENT=20
```

Create `.env.example` with these names and empty values. Never commit `.env.local`.

---

## 4. Phases

| Phase | What | When |
|---|---|---|
| 1 | Portfolio site, 3 languages, deployed | **Today. Must be live before tomorrow's meetings.** |
| 2 | Login, classes, teacher dashboard shell | After Phase 1 |
| 3 | SAT Math diagnostic | After Phase 2 |
| 4 | SAT mistake analyzer (AI) | After Phase 3 |
| 5 | IELTS Reading analyzer moved into the platform | After Phase 4 |

---

## Phase 1 — Portfolio (today)

Static pages only. No login, no database. Must deploy to Vercel today.

### Sections, in this order

**1. Hero (first screen on a phone)**
- Photo (`TODO: photo`), name, title: "SAT Math teacher" (translated).
- Scores as the main visual: **SAT Math 750**, **SAT 1440** (Reading & Writing 690 shown smaller), **IELTS 7.0**.
- Two buttons: "Contact" (scrolls to contact) and "Student tools" (scrolls to tools section).

**2. What I teach**
- SAT Math, all four official domains: Algebra; Advanced Math; Problem-Solving & Data Analysis; Geometry & Trigonometry.
- Formats: group and private.
- Availability: `TODO: days and hours`.

**3. Teaching experience**
- Founder, Sobitxonovs' Academy: a village-based English teaching initiative. `TODO: start date, number of students, results`.

**4. How I teach** (`TODO: confirm or edit these steps`)
A real sequence, so numbered steps are correct here:
1. Diagnostic test on day one, so every student starts with a map of weak topics.
2. Lessons built around those weak topics.
3. Every wrong answer goes into a personal mistake log with an explanation.
4. Regular timed mocks.
5. I track each student's progress and share it with the center.

**5. Tools I built for my students**
Cards for: SAT Math diagnostic, SAT mistake analyzer, IELTS Reading analyzer. One line each on what it does. Screenshots where they exist (`TODO: screenshots`). Label tools that are not live yet as "In development". If the IELTS tool is already online, link to it.

**6. Other things I've built**
- **uteach**: a platform for running learning centers. (Managers will notice this one. Keep it to one line, not a sales pitch.)
- **SUper**: a gamified college-prep social platform for Uzbek high schoolers.

**7. Leadership**
- Co-founder, Inquirum: Uzbekistan's first nationwide high school Economics and ML research competition. `TODO: year, number of participants`
- Head of Coordinators, Atlon Group: a multi-region youth organization. `TODO: number of regions or members`

**8. Contact**
- Telegram username and phone as plain, selectable text, plus copy buttons. `TODO: Telegram, phone`
- A QR code that points to the site's own URL (for printing on a card).

**Footer:** language switcher (O'zbek / English / Русский), "Student login" link (inactive until Phase 2).

### Design direction

The subject is a math teacher who builds software. Draw from that world:
- Faint graph-paper grid in the background, plotted curves or coordinate ticks as accents. Keep it subtle.
- Scores and numbers in a monospaced face, like values on a calculator screen.
- One accent color, used sparingly. Avoid purple-blue gradients, cream-and-terracotta, and centered-everything layouts.
- **Fonts must support Latin, Cyrillic, and the Uzbek ʻ character (U+02BB in oʻ, gʻ).** Good candidates: Unbounded (display), Golos Text or Manrope (body), JetBrains Mono (numbers). Test all three languages for missing glyphs.
- Light and dark themes.
- Fast on slow mobile internet: optimized images, no heavy animation.

### Translation

- Write Uzbek first, then English and Russian.
- Use Uzbek Latin with the correct ʻ character, not a plain apostrophe.
- Mark machine-translated strings in a comment so I can proofread the Russian and Uzbek.

### Done when

- [ ] All 8 sections render in all 3 languages at 390px and on desktop
- [ ] No hard-coded user-facing text
- [ ] Every missing fact shows a `TODO:` and is listed in `CONTENT_TODO.md`
- [ ] Deployed on Vercel with a working public link
- [ ] Lighthouse mobile performance ≥ 90

---

## Phase 2 — Accounts, classes, teacher dashboard

### Sign-in
- Google sign-in, plus email + password as a fallback. (No SMS, since it costs money.)
- **Signup needs a class code.** Only students I give a code to can join, so strangers can't use up the AI quota.
- My account is the only `teacher` account. Set it by email in a seed script.

### Database (Supabase)

```
profiles      id (= auth user id), full_name, role ('student'|'teacher'),
              class_id, preferred_lang ('uz'|'en'|'ru'), created_at
classes       id, name, code (unique, short), teacher_id, created_at
ai_usage      student_id, day (date), count          -- for the daily limit
```

Phases 3–5 add their own tables (below).

### Row-level security (required)
- Students read and write only their own rows.
- The teacher reads all rows belonging to students in classes they own.
- No table is readable without login.

### Pages
```
/[locale]/login
/[locale]/app            student home: list of tools
/[locale]/teacher        teacher dashboard
```

### Teacher dashboard (shell for now)
- Create a class, show its join code.
- List students per class with last-active date.
- Empty panels for diagnostic results and mistakes, filled in later phases.

### Done when
- [ ] A student can join with a class code and only sees their own data
- [ ] A user without a code cannot create an account
- [ ] Teacher sees the student list
- [ ] RLS policies tested with two student accounts

---

## Phase 3 — SAT Math diagnostic

### Question bank
- Stored in the repo as JSON: `content/diagnostic/questions.json`.
- **Use original questions only.** Do not copy College Board or other published questions. Draft questions in the SAT style, and mark each one `"verified": false` until I check it.
- Each question:
  ```json
  {
    "id": "alg-001",
    "domain": "algebra",
    "skill": "linear-equations-one-variable",
    "difficulty": "easy|medium|hard",
    "type": "mcq|grid-in",
    "question": "KaTeX-ready text",
    "choices": ["...", "...", "...", "..."],
    "answer": "B",
    "explanation": { "uz": "...", "en": "...", "ru": "..." },
    "verified": false
  }
  ```
- Start with 20 questions: 5 per domain, mixed difficulty.

### Test flow
- One question per screen, progress bar, no going back.
- Timer shown but not enforced.
- Results screen:
  - Correct answers per domain, as a simple bar chart.
  - A rough estimated SAT Math range, clearly labeled "estimate, not an official score."
  - List of weak skills, with explanations for every wrong answer.

### Database
```
diagnostic_attempts  id, student_id, answers (jsonb), score_by_domain (jsonb),
                     estimated_range, created_at
```

### Teacher dashboard
- Each student's latest result and weak skills.
- Class view: which skills most students got wrong.

### Done when
- [ ] Student can take the test on a phone and see results in their language
- [ ] Results saved and visible to the teacher
- [ ] All formulas render correctly

---

## Phase 4 — SAT mistake analyzer

Same idea as the IELTS tool I built for my sister, adapted to SAT.

### Student flow
1. Student adds a question they got wrong: types or pastes it, **or uploads a screenshot/photo** (Gemini reads images).
2. Enters their answer, the correct answer, and optionally how they thought about it.
3. Picks explanation language: Uzbek, English, or Russian.
4. AI returns:
   - why the correct answer is correct, step by step, in simple words
   - where the student's thinking went wrong
   - the key concept
   - domain and skill tags
   - one similar practice question with answer
5. The mistake is saved to their **mistake log**.
6. **Review mode:** the student retries saved mistakes later and marks them "still wrong" or "got it."

### AI details
- Call Gemini only from a server route (`/api/analyze`).
- Ask for **JSON output** in a fixed schema and validate it before saving.
- If the AI's own answer disagrees with the correct answer the student entered, show a warning: "The explanation may be wrong. Ask your teacher."
- Show a small note under every explanation: "AI can make mistakes."
- Enforce `AI_DAILY_LIMIT_PER_STUDENT` using the `ai_usage` table. Show a friendly message when the limit is reached.
- Don't send student names or emails to Gemini. Free-tier prompts may be used by Google.
- Store screenshots in a private Supabase storage bucket that only the owner and teacher can read.
- Students can tap "This explanation was unclear." Flagged items show up for the teacher.

### Database
```
mistakes   id, student_id, tool ('sat'|'ielts'), question_text, image_path,
           student_answer, correct_answer, student_reasoning,
           ai_explanation (jsonb), domain, skill,
           status ('new'|'reviewing'|'mastered'), flagged (bool), created_at
```

### Teacher dashboard
- Each student's mistake log, filterable by skill.
- Class-wide top 10 weak skills.
- Flagged explanations to check.

### Done when
- [ ] Text and photo input both work on a phone
- [ ] Explanations come back in the selected language and save correctly
- [ ] Daily limit works
- [ ] Teacher sees mistakes and flags

---

## Phase 5 — IELTS Reading analyzer

- Bring my existing IELTS Reading tool (built for my sister) into this platform at `/[locale]/app/ielts`. `TODO: path to the existing code`.
- Reuse its logic and prompts. Switch it to the shared login, the `mistakes` table (`tool = 'ielts'`), the shared daily AI limit, and the 3-language setup.
- Explanations stay in simple English plus the student's chosen language, and every mistake is saved.
- If my sister's existing saved mistakes live in her browser or a separate store, write a one-time import so she doesn't lose them. She becomes a normal student account.

### Done when
- [ ] IELTS tool works inside the platform for any student
- [ ] My sister's old data is imported
- [ ] Teacher dashboard can filter mistakes by SAT or IELTS

---

## 5. Folder structure (suggested)

```
app/[locale]/page.tsx            portfolio
app/[locale]/login/
app/[locale]/app/                student area
app/[locale]/app/diagnostic/
app/[locale]/app/mistakes/
app/[locale]/app/ielts/
app/[locale]/teacher/
app/api/analyze/route.ts         Gemini calls
components/
content/diagnostic/questions.json
messages/uz.json  en.json  ru.json
lib/supabase/  lib/gemini/
supabase/migrations/             SQL incl. RLS policies
CONTENT_TODO.md
```

## 6. Known limits

- **Gemini free tier** has request limits. The class code and daily cap protect it. With many students, the limit may still be reached on busy days.
- **Supabase free projects pause** after about a week with no activity. A paused project has to be resumed from the Supabase dashboard.
- **The diagnostic score is a rough estimate.** Label it that way everywhere.
- **AI explanations can be wrong.** That's why there are warnings, flags, and teacher review.

## 7. How to run this with Claude Code

Start with:

> Read PLAN.md. Build Phase 1 only. Put every missing fact in CONTENT_TODO.md instead of making it up. Stop when Phase 1 is deployed.

Then one phase per session:

> Read PLAN.md. Phase N is next. Build it, run the "Done when" checks, and stop.
