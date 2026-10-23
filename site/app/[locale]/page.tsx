import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { scores } from "@/content/profile";
import { DeskSceneLoader } from "@/components/scene/DeskSceneLoader";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("scene");
  const hero = await getTranslations("hero");
  const osUrl = `/${locale}/os`;

  return (
    <>
      {/* For keyboards, screen readers and search engines: the same portfolio without 3D */}
      <a href={osUrl} className="skip-link">
        {t("skipLink")}
      </a>
      <div className="visually-hidden">
        <h1>
          {hero("name")} — {hero("title")}
        </h1>
        <p>
          SAT Math {scores.satMath} · SAT {scores.satTotal} · IELTS {scores.ielts} · {hero("location")}
        </p>
      </div>
      <DeskSceneLoader osUrl={osUrl} />
      <noscript>
        <p className="noscript">
          <a href={osUrl}>{t("openDesktop")}</a>
        </p>
      </noscript>
    </>
  );
}
