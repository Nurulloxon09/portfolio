import { useTranslations } from "next-intl";
import { Section } from "./Section";
import { Todo } from "./Todo";

const domains = ["algebra", "advancedMath", "problemSolving", "geometry"] as const;
const numerals = ["I", "II", "III", "IV"];

// Phone: 2×2 grid with hairlines (1a). Desktop: a four-column strip with roman numerals (1c).
const cellClass = [
  "pr-2.5 border-r lg:pr-[18px] lg:pl-0",
  "pl-3 lg:border-r lg:px-[18px]",
  "pr-2.5 border-r lg:px-[18px]",
  "pl-3 lg:pl-[18px] lg:pr-0",
];

export function Teach() {
  const t = useTranslations("teach");
  return (
    <Section id="teach" number="02" title={t("title")}>
      <div className="mb-1.5 text-[12px] opacity-65 lg:mb-3">{t("subtitle")}</div>
      <div className="grid grid-cols-2 border-t border-(--color-divider) lg:grid-cols-4 lg:border-(--color-rule-strong)">
        {domains.map((d, i) => (
          <div
            key={d}
            className={`border-b border-(--color-divider) py-2.5 text-[14px] lg:border-b-0 lg:pt-[18px] lg:pb-[22px] ${cellClass[i]}`}
          >
            <div className="font-heading hidden text-[15px] text-(--color-accent) lg:block">{numerals[i]}</div>
            <div className="lg:font-(family-name:--font-heading) lg:text-[20px] lg:leading-tight lg:font-semibold">{t(d)}</div>
          </div>
        ))}
      </div>
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <span className="tag tag-outline">{t("group")}</span>
        <span className="tag tag-outline">{t("private")}</span>
        <Todo>{t("availabilityTodo")}</Todo>
      </div>
    </Section>
  );
}
