import { useTranslations } from "next-intl";
import { Section } from "./Section";
import { Todo } from "./Todo";

export function Leadership() {
  const t = useTranslations("leadership");
  return (
    <Section id="leadership" number="07" title={t("title")}>
      <div className="grid lg:grid-cols-2 lg:gap-12">
        <div className="border-b border-(--color-divider) pb-3.5 lg:border-b-0 lg:pb-0">
          <div className="text-[11px] tracking-[.1em] text-(--color-kicker) uppercase">{t("inquirumRole")}</div>
          <h3 className="m-0 text-[21px]">{t("inquirumName")}</h3>
          <p className="mt-0.5 mb-2 text-justify text-[14px]">{t("inquirumDescription")}</p>
          <div className="flex flex-wrap gap-1.5">
            <Todo>{t("yearTodo")}</Todo>
            <Todo>{t("participantsTodo")}</Todo>
          </div>
        </div>
        <div className="pt-3.5 lg:border-l lg:border-(--color-divider) lg:pt-0 lg:pl-12">
          <div className="text-[11px] tracking-[.1em] text-(--color-kicker) uppercase">{t("atlonRole")}</div>
          <h3 className="m-0 text-[21px]">{t("atlonName")}</h3>
          <p className="mt-0.5 mb-2 text-[14px]">{t("atlonDescription")}</p>
          <Todo>{t("sizeTodo")}</Todo>
        </div>
      </div>
    </Section>
  );
}
