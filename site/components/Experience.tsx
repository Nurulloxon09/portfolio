import { useTranslations } from "next-intl";
import { Section } from "./Section";
import { Todo } from "./Todo";

export function Experience() {
  const t = useTranslations("experience");
  return (
    <Section id="experience" number="03" title={t("title")}>
      <div className="max-w-[640px]">
        <div className="text-[11px] tracking-[.1em] text-(--color-kicker) uppercase">{t("role")}</div>
        <h3 className="mt-0.5 mb-1 text-[21px]">{t("org")}</h3>
        <p className="mb-2.5 text-justify text-[14px]">{t("description")}</p>
        <div className="flex flex-wrap gap-1.5">
          <Todo>{t("startDateTodo")}</Todo>
          <Todo>{t("studentsTodo")}</Todo>
          <Todo>{t("resultsTodo")}</Todo>
        </div>
      </div>
    </Section>
  );
}
