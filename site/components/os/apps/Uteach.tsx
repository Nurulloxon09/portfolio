"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FIRST_LESSON_MARKS, GROUPS, initials, type Group, type Status, type Student } from "./uteach-data";
import "./uteach.css";

// A show-only copy of uteach's teacher screens (the learning-center platform Nurulloxon built), with made-up
// data. Marks and topics live in this window's state; nothing is sent anywhere.

type Tab = "attendance" | "academy";
type Mark = { status: Status; late: number };
type Sheet = { marks: Record<string, Mark>; topic: string };

const STATUSES: Status[] = ["present", "late", "absent", "excused"];
const AVATARS = ["green", "orange", "violet", "sky"] as const;
const INTL_LOCALES: Record<string, string> = { en: "en-US", ru: "ru-RU" };
// Chrome ships no Uzbek date names (it prints "2026 M10 23, Fri"), so Uzbek dates are spelled out here
const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const UZ_WEEKDAYS = ["dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba", "yakshanba"];
const UZ_WEEKDAYS_SHORT = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"];
const CENTER = "Davomat Academy";

function isoWeekday(date: Date) {
  return date.getDay() === 0 ? 7 : date.getDay();
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function todaysLessons(today: Date) {
  return GROUPS.filter((g) => g.days.includes(isoWeekday(today))).sort((a, b) => a.start.localeCompare(b.start));
}

function startedAt(group: Group, now: Date) {
  const [h, m] = group.start.split(":").map(Number);
  return now.getHours() * 60 + now.getMinutes() >= h * 60 + m;
}

export function Uteach() {
  const t = useTranslations("uteach");
  const hero = useTranslations("hero");
  const [today] = useState(() => new Date());
  const [tab, setTab] = useState<Tab>("attendance");
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Record<string, Sheet>>(() => {
    const first = todaysLessons(new Date())[0];
    if (!first) return {};
    const marks = Object.fromEntries(
      first.students.map((s, i) => [s.name, { status: FIRST_LESSON_MARKS[i % FIRST_LESSON_MARKS.length], late: 10 }]),
    );
    return { [first.id]: { marks, topic: first.topic } };
  });
  const [toast, setToast] = useState<string | null>(null);
  const main = useRef<HTMLDivElement>(null);
  const teacher = hero("name");

  useEffect(() => {
    main.current?.scrollTo(0, 0);
  }, [tab, lessonId, groupId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const lessons = todaysLessons(today);
  const lesson = lessons.find((g) => g.id === lessonId);
  const group = GROUPS.find((g) => g.id === groupId);

  const go = (next: Tab) => {
    setTab(next);
    setLessonId(null);
    setGroupId(null);
  };

  return (
    <div className="ut">
      <div className="ut-layout">
        <aside className="ut-side">
          <div className="ut-logo">
            <span className="ut-logo-mark">
              <CapIcon />
            </span>
            <span>
              <b>u</b>teach
            </span>
          </div>
          <nav className="ut-nav">
            <button
              type="button"
              className={`ut-nav-item ${tab === "attendance" ? "ut-nav-current" : ""}`}
              aria-current={tab === "attendance" ? "page" : undefined}
              onClick={() => go("attendance")}
            >
              <CalendarIcon />
              {t("tabAttendance")}
            </button>
            <button
              type="button"
              className={`ut-nav-item ${tab === "academy" ? "ut-nav-current" : ""}`}
              aria-current={tab === "academy" ? "page" : undefined}
              onClick={() => go("academy")}
            >
              <UsersIcon />
              {t("tabAcademy")}
            </button>
          </nav>
        </aside>

        <div className="ut-body">
          <header className="ut-top">
            <div className="ut-center">
              <BuildingIcon />
              <span className="ut-center-name">{CENTER}</span>
              <span className="ut-chip ut-chip-primary" title={t("demoNote")}>
                {t("demo")}
              </span>
            </div>
            <div className="ut-user">
              <span className="ut-avatar ut-avatar-orange">{initials(teacher)}</span>
              <span className="ut-user-text">
                <b>{teacher}</b>
                <small>{t("teacher")}</small>
              </span>
            </div>
          </header>

          <div className="ut-main" ref={main}>
            <div className="ut-page">
              {tab === "attendance" &&
                (lesson ? (
                  <AttendanceSheet
                    key={lesson.id}
                    group={lesson}
                    today={today}
                    teacher={teacher}
                    initial={saved[lesson.id]}
                    onBack={() => setLessonId(null)}
                    onSave={(sheet) => {
                      setSaved((prev) => ({ ...prev, [lesson.id]: sheet }));
                      setToast(t("savedToast"));
                    }}
                  />
                ) : (
                  <TodayList lessons={lessons} today={today} saved={saved} open={setLessonId} />
                ))}
              {tab === "academy" &&
                (group ? (
                  <GroupScores group={group} today={today} teacher={teacher} onBack={() => setGroupId(null)} />
                ) : (
                  <GroupList open={setGroupId} />
                ))}
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className="ut-toast" role="status">
          <CheckIcon />
          {toast}
        </div>
      )}
    </div>
  );
}

function useDates() {
  const current = useLocale();
  if (current === "uz") {
    return {
      long: (d: Date) => {
        const weekday = UZ_WEEKDAYS[isoWeekday(d) - 1]!;
        return `${weekday[0]!.toUpperCase()}${weekday.slice(1)}, ${d.getDate()}-${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
      },
      short: (d: Date) => `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}`,
      weekday: (iso: number) => UZ_WEEKDAYS_SHORT[iso - 1]!,
    };
  }
  const locale = INTL_LOCALES[current] ?? "en-US";
  return {
    long: (d: Date) =>
      new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(d),
    short: (d: Date) => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(d),
    // 1 January 2024 was a Monday
    weekday: (iso: number) =>
      new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, iso)),
  };
}

function TodayList({
  lessons,
  today,
  saved,
  open,
}: {
  lessons: Group[];
  today: Date;
  saved: Record<string, Sheet>;
  open: (id: string) => void;
}) {
  const t = useTranslations("uteach");
  const dates = useDates();
  const now = new Date();

  return (
    <>
      <h1 className="ut-h1">{t("today")}</h1>
      <p className="ut-sub">{dates.long(today)}</p>
      <ul className="ut-lessons">
        {lessons.map((g) => {
          const sheet = saved[g.id];
          const marked = sheet ? g.students.filter((s) => sheet.marks[s.name]).length : 0;
          return (
            <li key={g.id}>
              <button type="button" className="ut-card ut-lesson" onClick={() => open(g.id)}>
                <span className={`ut-time ut-color-${g.color}`}>
                  {g.start}–<br />
                  {g.end}
                </span>
                <span className="ut-lesson-text">
                  <b>{g.name}</b>
                  <span className="ut-muted">{t("room", { number: g.room })}</span>
                  {sheet ? (
                    <span className="ut-chip ut-chip-success">
                      {t("chipMarked", { marked, total: g.students.length })}
                    </span>
                  ) : startedAt(g, now) ? (
                    <span className="ut-chip ut-chip-warning">{t("chipToMark")}</span>
                  ) : (
                    <span className="ut-chip ut-chip-muted">{t("chipNotMarked")}</span>
                  )}
                </span>
                <ChevronIcon />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function AttendanceSheet({
  group,
  today,
  teacher,
  initial,
  onBack,
  onSave,
}: {
  group: Group;
  today: Date;
  teacher: string;
  initial: Sheet | undefined;
  onBack: () => void;
  onSave: (sheet: Sheet) => void;
}) {
  const t = useTranslations("uteach");
  const dates = useDates();
  const [marks, setMarks] = useState<Record<string, Mark>>(initial?.marks ?? {});
  const [topic, setTopic] = useState(initial?.topic ?? group.topic);
  const [dirty, setDirty] = useState(false);
  const marked = group.students.filter((s) => marks[s.name]).length;

  const mark = (name: string, status: Status) => {
    setMarks((prev) => ({ ...prev, [name]: { status, late: prev[name]?.late ?? 10 } }));
    setDirty(true);
  };

  return (
    <>
      <nav className="ut-crumbs">
        <button type="button" onClick={onBack}>
          {t("today")}
        </button>
        <span aria-hidden>/</span>
        <span>{t("attendance")}</span>
      </nav>
      <h1 className="ut-h1">{group.name}</h1>
      <ul className="ut-meta">
        <li>
          <ClockIcon />
          {dates.long(today)} · {group.start}–{group.end}
        </li>
        <li>
          <DoorIcon />
          {t("room", { number: group.room })}
        </li>
        <li>
          <UserIcon />
          {teacher}
        </li>
      </ul>

      <label className="ut-card ut-topic">
        <span>{t("topic")}</span>
        <input
          className="ut-input"
          value={topic}
          placeholder={t("topicPlaceholder")}
          onChange={(event) => {
            setTopic(event.target.value);
            setDirty(true);
          }}
        />
      </label>

      <div className="ut-sheet-tools">
        <button
          type="button"
          className="ut-button ut-button-outline"
          disabled={marked === group.students.length}
          onClick={() => {
            setMarks((prev) => {
              const next = { ...prev };
              for (const s of group.students) next[s.name] ??= { status: "present", late: 10 };
              return next;
            });
            setDirty(true);
          }}
        >
          {t("allPresent")}
        </button>
      </div>

      <ul className="ut-students">
        {group.students.map((s, i) => {
          const current = marks[s.name];
          return (
            <li key={s.name} className="ut-card ut-student">
              <div className="ut-student-head">
                <span className={`ut-avatar ut-avatar-${AVATARS[i % AVATARS.length]}`}>{initials(s.name)}</span>
                <b>{s.name}</b>
              </div>
              <div className="ut-segments" role="radiogroup" aria-label={s.name}>
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    role="radio"
                    aria-checked={current?.status === status}
                    className={`ut-segment ${current?.status === status ? `ut-segment-${status}` : ""}`}
                    onClick={() => mark(s.name, status)}
                  >
                    {t(status)}
                  </button>
                ))}
              </div>
              {current?.status === "late" && (
                <label className="ut-late">
                  {t("lateMinutes")}
                  <input
                    className="ut-input ut-input-small"
                    type="number"
                    min={1}
                    max={240}
                    value={current.late}
                    onChange={(event) => {
                      const late = Number(event.target.value);
                      setMarks((prev) => ({ ...prev, [s.name]: { status: "late", late } }));
                      setDirty(true);
                    }}
                  />
                  <span className="ut-muted">{t("minutesShort")}</span>
                </label>
              )}
            </li>
          );
        })}
      </ul>

      <div className="ut-savebar">
        <span>{t("counter", { marked, total: group.students.length })}</span>
        <button
          type="button"
          className="ut-button ut-button-primary"
          disabled={!dirty || marked === 0}
          onClick={() => {
            onSave({ marks, topic });
            setDirty(false);
          }}
        >
          {!dirty && initial ? t("saved") : t("save")}
        </button>
      </div>
    </>
  );
}

function GroupList({ open }: { open: (id: string) => void }) {
  const t = useTranslations("uteach");
  return (
    <>
      <h1 className="ut-h1">{t("myGroups")}</h1>
      <ul className="ut-groups">
        {GROUPS.map((g) => (
          <li key={g.id}>
            <button type="button" className="ut-card ut-group" onClick={() => open(g.id)}>
              <GroupHeader group={g} />
              <GroupFacts group={g} />
              <span className="ut-rate">
                <span className="ut-meter" aria-hidden>
                  <span style={{ width: `${g.attendance}%` }} />
                </span>
                <span className="ut-muted">{t("attendanceRate", { rate: g.attendance })}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function GroupHeader({ group }: { group: Group }) {
  const t = useTranslations("uteach");
  return (
    <span className="ut-group-head">
      <span className={`ut-avatar ut-avatar-lg ut-color-${group.color}`}>{initials(group.name)}</span>
      <span className="ut-group-name">
        <b>{group.name}</b>
        <span className="ut-muted">{t("prep", { course: group.course })}</span>
      </span>
    </span>
  );
}

function GroupFacts({ group, teacher }: { group: Group; teacher?: string }) {
  const t = useTranslations("uteach");
  const dates = useDates();
  // Spans, not a list: the group cards are buttons
  return (
    <span className="ut-facts">
      {teacher && (
        <span>
          <UserIcon />
          {teacher}
        </span>
      )}
      <span>
        <CalendarIcon />
        {group.days.map(dates.weekday).join(" · ")}, {group.start}–{group.end}
      </span>
      <span>
        <DoorIcon />
        {t("room", { number: group.room })}
      </span>
      <span>
        <UsersIcon />
        {t("students", { count: group.students.length })}
      </span>
    </span>
  );
}

function GroupScores({
  group,
  today,
  teacher,
  onBack,
}: {
  group: Group;
  today: Date;
  teacher: string;
  onBack: () => void;
}) {
  const t = useTranslations("uteach");
  const dates = useDates();
  const ielts = group.course === "IELTS";
  const score = (n: number) => (ielts ? n.toFixed(1) : String(n));
  const sections = (s: Student) =>
    ielts
      ? ["L", "R", "W", "S"].map((k, i) => `${k} ${s.sections[i]!.toFixed(1)}`).join(" · ")
      : `R&W ${s.sections[0]} · Math ${s.sections[1]}`;
  const mockDate = dates.short(addDays(today, -3));
  const examDate = dates.short(addDays(today, ielts ? 30 : 44));

  return (
    <>
      <nav className="ut-crumbs">
        <button type="button" onClick={onBack}>
          {t("myGroups")}
        </button>
        <span aria-hidden>/</span>
        <span>{group.name}</span>
      </nav>
      <h1 className="ut-h1">{group.name}</h1>
      <div className="ut-detail">
        <div className="ut-card ut-detail-info">
          <GroupHeader group={group} />
          <GroupFacts group={group} teacher={teacher} />
        </div>
        <div className="ut-card ut-detail-scores">
          <h2 className="ut-h2">
            {t("scores")} <span className="ut-chip ut-chip-muted">{group.course}</span>
          </h2>
          <div className="ut-table-wrap">
            <table className="ut-table">
              <thead>
                <tr>
                  <th>{t("student")}</th>
                  <th>{t("latest")}</th>
                  <th>{t("before")}</th>
                  <th>{t("target")}</th>
                  <th>{t("gap")}</th>
                  <th>{t("examDate")}</th>
                </tr>
              </thead>
              <tbody>
                {group.students.map((s) => {
                  const gap = Math.round((s.target - s.latest) * 10) / 10;
                  const growth = Math.round((s.latest - s.before) * 10) / 10;
                  return (
                    <tr key={s.name}>
                      <td className="ut-td-name">{s.name}</td>
                      <td>
                        <span className="ut-score">
                          <b>{score(s.latest)}</b>
                          {growth > 0 && <span className="ut-up">▲ {score(growth)}</span>}
                        </span>
                        <small className="ut-muted">{sections(s)}</small>
                        <small className="ut-muted">
                          {mockDate} · {t("mock")}
                        </small>
                      </td>
                      <td>{score(s.before)}</td>
                      <td>{score(s.target)}</td>
                      <td>
                        {gap > 0 ? (
                          <span className="ut-chip ut-chip-warning">+{score(gap)}</span>
                        ) : (
                          <span className="ut-chip ut-chip-success">{t("reached")}</span>
                        )}
                      </td>
                      <td>{examDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

// Line icons in the style uteach uses (24×24, stroked)

function Svg({ children, size = 18 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function CapIcon() {
  return (
    <Svg>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c3 2.5 9 2.5 12 0v-5" />
    </Svg>
  );
}

function CalendarIcon() {
  return (
    <Svg>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18M9 15l2 2 4-4" />
    </Svg>
  );
}

function UsersIcon() {
  return (
    <Svg>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21c0-4 3-6 7-6s7 2 7 6M16 4a4 4 0 010 8M18 15c2.5.7 4 2.8 4 6" />
    </Svg>
  );
}

function BuildingIcon() {
  return (
    <Svg size={16}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h1M14 7h1M9 11h1M14 11h1M10 21v-4h4v4" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg size={15}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}

function DoorIcon() {
  return (
    <Svg size={15}>
      <path d="M5 21V4a1 1 0 011-1h12a1 1 0 011 1v17M3 21h18M15 12h.01" />
    </Svg>
  );
}

function UserIcon() {
  return (
    <Svg size={15}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg size={16}>
      <path d="M5 12l5 5 9-10" />
    </Svg>
  );
}
