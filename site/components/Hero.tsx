import { useTranslations } from "next-intl";
import { scores } from "@/content/profile";

export function Hero() {
  const t = useTranslations("hero");
  const { satMath, satMathMin, satMathMax } = scores;

  // Score axis (1c): 480 units wide, a tick every 100 points.
  const axisWidth = 480;
  const x = ((satMath - satMathMin) / (satMathMax - satMathMin)) * axisWidth;
  const ticks = Array.from({ length: (satMathMax - satMathMin) / 100 + 1 }, (_, i) => (i * axisWidth * 100) / (satMathMax - satMathMin));

  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Plotted curve + coordinate ticks behind the phone hero (1a). */}
      <svg
        width="390"
        height="200"
        viewBox="0 0 390 200"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 lg:hidden"
      >
        <path d="M60 190 Q 230 -110 380 150" stroke="var(--color-accent)" strokeWidth="1.2" opacity=".55" />
        <line x1="0" y1="150" x2="390" y2="150" stroke="var(--color-text)" strokeOpacity=".18" />
        <g stroke="var(--color-text)" strokeOpacity=".3">
          {[110, 176, 242, 308].map((tx) => (
            <line key={tx} x1={tx} y1="146" x2={tx} y2="154" />
          ))}
        </g>
        <circle cx="214" cy="40" r="3" fill="var(--color-accent)" />
      </svg>

      <div className="container-x hero-grid relative pt-7 pb-[30px] lg:pt-16 lg:pb-14">
        <div className="area-id flex items-center gap-4 lg:items-end lg:gap-[22px]">
          <div className="mat grid h-[104px] w-[84px] flex-none place-items-center p-1 text-center text-[10px] lg:h-[172px] lg:w-[140px] lg:text-[11px]">
            {t("photoTodo")}
          </div>
          <div>
            <div className="hidden text-[11px] tracking-[.12em] text-(--color-kicker) uppercase lg:block">{t("location")}</div>
            <h1 className="m-0 text-[40px] leading-none font-normal lg:mt-1 lg:text-[76px] lg:leading-[.95]">{t("name")}</h1>
            <div className="mt-1.5 text-[15px] italic lg:mt-2.5 lg:text-[20px]">{t("title")}</div>
          </div>
        </div>

        <div className="area-scores">
          {/* Phone: score grid (1a) */}
          <div className="mt-[26px] border-t border-b border-t-(--color-rule-strong) border-b-(--color-divider) lg:hidden">
            <div className="grid grid-cols-2 border-b border-(--color-divider)">
              <div className="border-r border-(--color-divider) pt-3.5 pb-3">
                <div className="kicker">{t("satMath")}</div>
                <div className="font-heading tnum text-[68px] leading-[.95]">{satMath}</div>
                <div className="tnum text-[11px] opacity-60">{t("outOf", { max: satMathMax })}</div>
              </div>
              <div className="pt-3.5 pb-3 pl-4">
                <div className="kicker">{t("ielts")}</div>
                <div className="font-heading tnum text-[68px] leading-[.95]">{scores.ielts}</div>
              </div>
            </div>
            <div className="flex items-baseline justify-between py-2.5">
              <div className="flex items-baseline gap-2">
                <span className="kicker">{t("satTotal")}</span>
                <span className="font-heading tnum text-[30px]">{scores.satTotal}</span>
              </div>
              <span className="tnum text-[12px] opacity-65">{t("readingWriting", { score: scores.satReadingWriting })}</span>
            </div>
          </div>

          {/* Desktop: SAT Math as a point on the 200–800 axis (1c) */}
          <div className="hidden border border-(--color-divider) bg-(--color-bg) px-6 py-[22px] lg:block">
            <div className="kicker mb-1.5">{t("scoreScale")}</div>
            <svg
              viewBox={`-6 0 ${axisWidth + 12} 62`}
              className="h-auto w-full"
              fill="none"
              role="img"
              aria-label={t("scoreAxisLabel", { score: satMath })}
            >
              <line x1="0" y1="40" x2={axisWidth} y2="40" stroke="var(--color-text)" strokeOpacity=".35" />
              <g stroke="var(--color-text)" strokeOpacity=".35">
                {ticks.map((tx, i) => {
                  const end = i === 0 || i === ticks.length - 1;
                  return <line key={tx} x1={tx} y1={end ? 35 : 36} x2={tx} y2={end ? 45 : 44} />;
                })}
              </g>
              <line x1="0" y1="40" x2={x} y2="40" stroke="var(--color-accent)" strokeWidth="2" />
              <circle cx={x} cy="40" r="5" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="2" />
            </svg>
            <div className="flex items-baseline justify-between">
              <span className="font-heading tnum text-[96px] leading-[.9]">{satMath}</span>
              <div className="flex flex-col gap-1 text-right">
                <span className="font-heading tnum text-[30px]">
                  {t("ielts")} {scores.ielts}
                </span>
                <span className="font-heading tnum text-[24px]">
                  {t("sat")} {scores.satTotal}
                </span>
                <span className="tnum text-[12px] opacity-60">{t("readingWriting", { score: scores.satReadingWriting })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="area-cta mt-5 grid grid-cols-2 gap-2.5 lg:mt-8 lg:flex lg:gap-3">
          <a href="#contact" className="btn btn-primary on-ground min-h-[46px] text-[15px] lg:px-7 lg:text-[16px]">
            {t("contact")}
          </a>
          <a href="#tools" className="btn btn-secondary on-ground min-h-[46px] text-[15px] lg:px-7 lg:text-[16px]">
            {t("tools")}
          </a>
        </div>
      </div>
    </section>
  );
}
