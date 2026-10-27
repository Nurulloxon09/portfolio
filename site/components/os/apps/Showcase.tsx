"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { contact, scores, telegramUrl, tools } from "@/content/profile";
import { CopyButton } from "../CopyButton";

export type QrCode = { url: string; svg: string };

type Page = "home" | "about" | "experience" | "projects" | "contact";
const PAGES: Page[] = ["home", "about", "experience", "projects", "contact"];

type Go = (page: Page) => void;

function PageLink({ page, current, go }: { page: Page; current?: Page; go: Go }) {
  const t = useTranslations("showcase");
  return (
    <button
      type="button"
      className={`showcase-link ${current === page ? "showcase-link-current" : ""}`}
      aria-current={current === page ? "page" : undefined}
      onClick={() => go(page)}
    >
      {t(page)}
    </button>
  );
}

/** The portfolio itself: a little website inside a window. */
export function Showcase({ qr, openUteach }: { qr: QrCode | null; openUteach: () => void }) {
  const [page, setPage] = useState<Page>("home");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo(0, 0);
  }, [page]);

  return (
    // The outer element is the size container; the layout inside switches to a column when narrow
    <div className="showcase">
      <div className="showcase-layout">
        {page !== "home" && <Navbar current={page} go={setPage} />}
        <div className={`showcase-page ${page === "home" ? "showcase-page-home" : ""}`} ref={scroller}>
          {page === "home" && <HomePage go={setPage} />}
          {page === "about" && <AboutPage />}
          {page === "experience" && <ExperiencePage />}
          {page === "projects" && <ProjectsPage openUteach={openUteach} />}
          {page === "contact" && <ContactPage qr={qr} />}
        </div>
      </div>
    </div>
  );
}

function Navbar({ current, go }: { current: Page; go: Go }) {
  const t = useTranslations("showcase");
  const hero = useTranslations("hero");
  return (
    <nav className="showcase-nav">
      <div className="showcase-nav-header">
        <p className="showcase-nav-name">{hero("name")}</p>
        <p className="showcase-nav-edition">{t("edition")}</p>
      </div>
      <div className="showcase-nav-links">
        {PAGES.map((page) => (
          <PageLink key={page} page={page} current={current} go={go} />
        ))}
      </div>
    </nav>
  );
}

function HomePage({ go }: { go: Go }) {
  const hero = useTranslations("hero");
  return (
    <div className="showcase-home">
      <h1 className="showcase-home-name">{hero("name")}</h1>
      <h2 className="showcase-home-title">{hero("title")}</h2>
      <div className="showcase-home-links">
        {PAGES.slice(1).map((page) => (
          <PageLink key={page} page={page} go={go} />
        ))}
      </div>
    </div>
  );
}

/** One SAT section score with a meter on the 200–800 scale (both sections share it). */
function SectionScore({ label, score, axisLabel }: { label: string; score: number; axisLabel: string }) {
  const hero = useTranslations("hero");
  const meter = (score - scores.satMathMin) / (scores.satMathMax - scores.satMathMin);
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>
        <b>{score}</b> {hero("outOf", { max: scores.satMathMax })}
        <div className="score-meter" role="img" aria-label={axisLabel}>
          <div className="score-meter-fill" style={{ width: `${meter * 100}%` }} />
        </div>
        <span className="score-scale">{hero("scoreScale")}</span>
      </td>
    </tr>
  );
}

function AboutPage() {
  const t = useTranslations("showcase");
  const hero = useTranslations("hero");
  const teach = useTranslations("teach");
  const method = useTranslations("method");

  return (
    <article className="showcase-article">
      <h1>{t("welcome")}</h1>
      <h3>{t("intro", { name: hero("name") })}</h3>
      <div className="text-block">
        <p>{t("introText", { location: hero("location") })}</p>
      </div>

      <figure className="captioned-image">
        <img className="photo-frame" src="/photo.jpg" alt={hero("photoAlt")} width={600} height={800} />
        <figcaption>{hero("location")}</figcaption>
      </figure>

      <h3>{t("scoresTitle")}</h3>
      <div className="text-block">
        <table className="score-table">
          <tbody>
            <tr>
              <th scope="row">{hero("satTotal")}</th>
              <td>
                <b>{scores.satTotal}</b>
              </td>
            </tr>
            <SectionScore
              label={hero("satMath")}
              score={scores.satMath}
              axisLabel={hero("scoreAxisLabel", { score: scores.satMath })}
            />
            <SectionScore
              label={hero("satReadingWriting")}
              score={scores.satReadingWriting}
              axisLabel={hero("rwAxisLabel", { score: scores.satReadingWriting })}
            />
            <tr>
              <th scope="row">{hero("ielts")}</th>
              <td>
                <b>{scores.ielts}</b>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>{teach("title")}</h3>
      <div className="text-block">
        <p>{teach("subtitle")}</p>
        <h4>{teach("math")}</h4>
        <ul>
          <li>{teach("algebra")}</li>
          <li>{teach("advancedMath")}</li>
          <li>{teach("problemSolving")}</li>
          <li>{teach("geometry")}</li>
        </ul>
        <h4>{teach("readingWriting")}</h4>
        <ul>
          <li>{teach("informationIdeas")}</li>
          <li>{teach("craftStructure")}</li>
          <li>{teach("expressionIdeas")}</li>
          <li>{teach("conventions")}</li>
        </ul>
        <p>
          <b>{t("formats")}</b> {teach("group")} · {teach("private")}
        </p>
      </div>

      <h3>{method("title")}</h3>
      <div className="text-block">
        <ol>
          <li>{method("step1")}</li>
          <li>{method("step2")}</li>
          <li>{method("step3")}</li>
          <li>{method("step4")}</li>
          <li>{method("step5")}</li>
        </ol>
      </div>
    </article>
  );
}

function Entry({
  name,
  role,
  aside,
  children,
}: {
  name: string;
  role: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="entry">
      <div className="entry-header">
        <h2>{name}</h2>
        {aside && <div className="entry-aside">{aside}</div>}
      </div>
      <h3 className="entry-role">{role}</h3>
      <div className="text-block">{children}</div>
    </section>
  );
}

function ExperiencePage() {
  const t = useTranslations("showcase");
  const xp = useTranslations("experience");
  const lead = useTranslations("leadership");
  return (
    <article className="showcase-article">
      <h1>{t("experienceTitle")}</h1>
      <p className="showcase-kicker">{xp("title")}</p>
      <Entry name={xp("org")} role={xp("role")} aside={xp("dates")}>
        <p>{xp("description")}</p>
        <ul>
          <li>{xp("students")}</li>
        </ul>
      </Entry>

      <p className="showcase-kicker">{lead("title")}</p>
      <Entry name={lead("inquirumName")} role={lead("inquirumRole")}>
        <p>{lead("inquirumDescription")}</p>
        <ul>
          <li>{lead("inquirumReach")}</li>
        </ul>
      </Entry>
      <Entry name={lead("atlonName")} role={lead("atlonRole")}>
        <p>{lead("atlonDescription")}</p>
        <ul>
          <li>{lead("atlonReach")}</li>
        </ul>
      </Entry>
    </article>
  );
}

type ProjectCardProps = {
  kicker: string;
  title: string;
  description: string;
  action: string;
} & ({ url: string; onOpen?: never } | { onOpen: () => void; url?: never });

function ProjectCard({ kicker, title, description, url, onOpen, action }: ProjectCardProps) {
  return (
    <div className="big-button">
      <div className="big-button-screen" aria-hidden>
        <span className="big-button-kicker-art">{kicker}</span>
      </div>
      <div className="big-button-body">
        <p className="big-button-kicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{description}</p>
        <p className="big-button-tags">
          {url ? (
            <a href={url} target="_blank" rel="noreferrer" className="site-button">
              {action}
            </a>
          ) : (
            <button type="button" className="site-button" onClick={onOpen}>
              {action}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

function ProjectsPage({ openUteach }: { openUteach: () => void }) {
  const t = useTranslations("showcase");
  const tt = useTranslations("tools");
  const projects = useTranslations("projects");

  const cards = [
    { id: "math", kicker: tt("mathKicker"), title: tt("mathTitle"), description: tt("mathDescription"), url: tools.satMathUrl },
    { id: "english", kicker: tt("englishKicker"), title: tt("englishTitle"), description: tt("englishDescription"), url: tools.satEnglishUrl },
    { id: "ielts", kicker: tt("ieltsKicker"), title: tt("ieltsTitle"), description: tt("ieltsDescription"), url: tools.ieltsUrl },
  ];

  return (
    <article className="showcase-article">
      <h1>{t("projectsTitle")}</h1>
      <h3>{tt("title")}</h3>
      <div className="project-cards">
        {cards.map(({ id, ...card }) => (
          <ProjectCard key={id} {...card} action={tt("open")} />
        ))}
      </div>

      <h3>{projects("title")}</h3>
      <div className="project-cards">
        <ProjectCard
          kicker={projects("uteachKicker")}
          title={projects("uteachName")}
          description={projects("uteach")}
          onOpen={openUteach}
          action={projects("uteachLink")}
        />
      </div>
      <div className="text-block">
        <p>
          <b>{projects("superName")}</b> — {projects("super")}
        </p>
      </div>
    </article>
  );
}

function ContactPage({ qr }: { qr: QrCode | null }) {
  const t = useTranslations("contact");
  // Each row appears once its value is filled in content/profile.ts
  const rows: { label: string; value: string; href: string }[] = [];
  const telegram = telegramUrl();
  if (contact.telegram && telegram) {
    rows.push({ label: t("telegram"), value: contact.telegram, href: telegram });
  }
  if (contact.phone) {
    rows.push({ label: t("phone"), value: contact.phone, href: `tel:${contact.phone.replace(/[^+\d]/g, "")}` });
  }

  return (
    <article className="showcase-article">
      <h1>{t("title")}</h1>
      {rows.length > 0 && (
        <div className="contact-rows">
          {rows.map((row) => (
            <div key={row.label} className="contact-row">
              <div>
                <p className="contact-label">{row.label}</p>
                <p className="contact-value">
                  <a href={row.href} target={row.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    {row.value}
                  </a>
                </p>
              </div>
              <CopyButton value={row.value} label={t("copy")} copiedLabel={t("copied")} />
            </div>
          ))}
        </div>
      )}
      {qr && (
        <div className="contact-qr">
          <div className="contact-qr-code" role="img" aria-label={t("qrAlt", { url: qr.url })} dangerouslySetInnerHTML={{ __html: qr.svg }} />
          <p>{t("qrNote")}</p>
        </div>
      )}
    </article>
  );
}
