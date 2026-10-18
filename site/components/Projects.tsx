import { useTranslations } from "next-intl";
import { Section } from "./Section";

const projects = [
  ["uteachName", "uteach"],
  ["superName", "super"],
] as const;

export function Projects() {
  const t = useTranslations("projects");
  return (
    <Section id="projects" number="06" title={t("title")}>
      <dl className="m-0 grid max-w-[720px] grid-cols-[76px_1fr] gap-x-3 gap-y-1 border-t border-(--color-divider) lg:grid-cols-[120px_1fr]">
        {projects.map(([name, desc]) => (
          <div key={name} className="contents">
            <dt className="font-heading border-b border-(--color-divider) py-2.5 text-[19px] font-semibold">{t(name)}</dt>
            <dd className="m-0 border-b border-(--color-divider) py-3 text-[14px]">{t(desc)}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
