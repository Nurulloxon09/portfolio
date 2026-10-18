import { useTranslations } from "next-intl";
import { Section } from "./Section";
import { Todo } from "./Todo";

const steps = ["step1", "step2", "step3", "step4", "step5"] as const;

export function Method() {
  const t = useTranslations("method");
  return (
    <Section id="method" number="04" title={t("title")}>
      <ol className="relative m-0 max-w-[720px] list-none pl-[34px]">
        <span aria-hidden="true" className="absolute top-1.5 bottom-1.5 left-[11px] border-l border-(--color-accent)" />
        {steps.map((s, i) => (
          <li key={s} className={`relative ${i < steps.length - 1 ? "pb-3.5" : ""}`}>
            <span
              aria-hidden="true"
              className="font-heading absolute top-0 -left-[34px] grid h-[23px] w-[23px] place-items-center rounded-full border border-(--color-accent) bg-(--color-bg) text-[14px] text-(--color-kicker)"
            >
              {i + 1}
            </span>
            <p className="m-0 text-[14px]">{t(s)}</p>
          </li>
        ))}
      </ol>
      <Todo className="mt-3.5">{t("confirmTodo")}</Todo>
    </Section>
  );
}
