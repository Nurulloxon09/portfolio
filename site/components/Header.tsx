import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { LanguageLinks } from "./LanguageLinks";

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations();
  return (
    <header className="border-b border-(--color-divider) bg-(--color-bg)">
      <div className="container-x nav border-b-0 py-3.5 lg:py-4">
        <a href="#hero" className="nav-brand text-[19px] lg:text-[22px]">
          {t("hero.name")}
        </a>
        <nav aria-label={t("nav.label")} className="hidden items-center gap-[18px] lg:flex">
          <a href="#teach">{t("nav.teach")}</a>
          <a href="#method">{t("nav.method")}</a>
          <a href="#tools">{t("nav.tools")}</a>
          <a href="#contact">{t("nav.contact")}</a>
        </nav>
        <LanguageLinks locale={locale} label={t("languages.label")} />
      </div>
    </header>
  );
}
