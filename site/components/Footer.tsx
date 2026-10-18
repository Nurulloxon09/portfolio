import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { ThemeToggle } from "./ThemeToggle";

export function Footer({ locale }: { locale: Locale }) {
  const t = useTranslations();
  return (
    <footer className="border-t border-(--color-divider) bg-(--color-bg)">
      <div className="container-x flex flex-col gap-3 pt-[18px] pb-[22px] lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label={t("languages.label")} className="seg self-start lg:self-auto">
          {routing.locales.map((l) => (
            <Link key={l} href="/" locale={l} hrefLang={l} className="seg-opt" aria-current={l === locale ? "true" : undefined}>
              {t(`languages.${l}`)}
            </Link>
          ))}
        </nav>
        <div className="flex justify-between text-[12px] lg:gap-8">
          {/* Student login is inactive until Phase 2. */}
          <span className="opacity-45">{t("footer.studentLogin")}</span>
          <ThemeToggle toDark={t("footer.toDark")} toLight={t("footer.toLight")} />
        </div>
      </div>
    </footer>
  );
}
