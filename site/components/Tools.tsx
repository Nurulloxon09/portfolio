import { useTranslations } from "next-intl";
import { tools } from "@/content/profile";
import { Section } from "./Section";
import { Todo } from "./Todo";

export function Tools() {
  const t = useTranslations("tools");
  return (
    <Section id="tools" number="05" title={t("title")}>
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:items-start lg:gap-5">
        <article className="card">
          <div className="mat grid h-[120px] place-items-center text-[11px]">{t("screenshotTodo")}</div>
          <div className="flex items-center justify-between">
            <span className="card-kicker">{t("diagnosticKicker")}</span>
            <span className="tag tag-neutral">{t("inDevelopment")}</span>
          </div>
          <h3 className="card-title m-0">{t("diagnosticTitle")}</h3>
          <p className="card-body">{t("diagnosticDescription")}</p>
        </article>

        <article className="card">
          <div className="flex items-center justify-between">
            <span className="card-kicker">{t("mistakesKicker")}</span>
            <span className="tag tag-neutral">{t("inDevelopment")}</span>
          </div>
          <h3 className="card-title m-0">{t("mistakesTitle")}</h3>
          <p className="card-body">{t("mistakesDescription")}</p>
        </article>

        <article className="card">
          <div className="flex items-center justify-between">
            <span className="card-kicker">{t("ieltsKicker")}</span>
            {!tools.ieltsUrl && <Todo>{t("onlineTodo")}</Todo>}
          </div>
          <h3 className="card-title m-0">{t("ieltsTitle")}</h3>
          <p className="card-body">{t("ieltsDescription")}</p>
          <div className="card-meta">
            {tools.ieltsUrl ? (
              <a className="btn btn-ghost text-[13px]" href={tools.ieltsUrl} target="_blank" rel="noopener">
                {t("open")}
              </a>
            ) : (
              <span className="btn btn-ghost text-[13px]" aria-disabled="true">
                {t("open")}
              </span>
            )}
          </div>
        </article>
      </div>
    </Section>
  );
}
