"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/** Shutting down → "safe to turn off" → click → booting → back to the desktop. */
export function ShutdownScreen({ onRestart }: { onRestart: () => void }) {
  const t = useTranslations("os");
  const [phase, setPhase] = useState<"shutting" | "off" | "booting">("shutting");

  useEffect(() => {
    if (phase === "shutting") {
      const id = setTimeout(() => setPhase("off"), 1800);
      return () => clearTimeout(id);
    }
    if (phase === "booting") {
      const id = setTimeout(onRestart, 1600);
      return () => clearTimeout(id);
    }
  }, [phase, onRestart]);

  return (
    <div
      className={`shutdown shutdown-${phase}`}
      onClick={() => phase === "off" && setPhase("booting")}
      role={phase === "off" ? "button" : undefined}
      tabIndex={phase === "off" ? 0 : undefined}
      onKeyDown={(event) => phase === "off" && (event.key === "Enter" || event.key === " ") && setPhase("booting")}
    >
      {phase === "shutting" && <p className="loading">{t("shuttingDown")}</p>}
      {phase === "off" && (
        <>
          <p className="shutdown-safe">{t("safeToTurnOff")}</p>
          <p className="shutdown-hint">{t("restart")}</p>
        </>
      )}
      {phase === "booting" && <p className="loading">{t("starting")}</p>}
    </div>
  );
}
