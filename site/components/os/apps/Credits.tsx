"use client";

import { useTranslations } from "next-intl";

function Row({ name, what, href }: { name: string; what: string; href?: string }) {
  return (
    <p className="credits-row">
      <span>{href ? <a href={href} target="_blank" rel="noreferrer">{name}</a> : name}</span>
      <span>{what}</span>
    </p>
  );
}

/** Who made what. The 3D scene and models come from other people's work. */
export function Credits() {
  const t = useTranslations("credits");
  const hero = useTranslations("hero");
  return (
    <div className="credits">
      <p className="credits-title">&quot;Nurulloxon Showcase 2026&quot;</p>
      <p className="credits-title">{t("title")}</p>

      <section>
        <h2>{t("portfolio")}</h2>
        <Row name={hero("name")} what={t("contentAndTeaching")} />
      </section>

      <section>
        <h2>{t("scene")}</h2>
        <Row name="Henry Heffernan" what={t("sceneCode")} href="https://github.com/henryjeff/portfolio-website" />
        <Row name="Mickael Boitte" what={t("computerModel")} />
        <Row name="Sean Nicolas" what={t("roomModels")} />
        <Row name="Henry Heffernan" what={t("sounds")} />
      </section>

      <section>
        <h2>{t("inspiration")}</h2>
        <Row name="henryheffernan.com" what={t("inspirationWhat")} href="https://henryheffernan.com" />
      </section>

      <p className="credits-license">{t("license")}</p>
      <p className="credits-thanks">{t("thanks")}</p>
    </div>
  );
}
