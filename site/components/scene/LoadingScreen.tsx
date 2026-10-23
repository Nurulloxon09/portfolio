"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { on } from "@/scene/events";

/** Name, title and a progress bar while the files load; fades into the scene by itself when done. */
export function LoadingScreen({
  webGLError,
  osUrl,
  onDone,
}: {
  webGLError: boolean;
  osUrl: string;
  onDone: () => void;
}) {
  const t = useTranslations("scene");
  const hero = useTranslations("hero");
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => on("loadedSource", ({ progress }) => setProgress(progress)), []);

  useEffect(() => {
    if (progress < 1 || webGLError) return;
    // A short pause so the full bar is seen before the fade
    const timer = setTimeout(() => {
      setHidden(true);
      onDone();
    }, 400);
    return () => clearTimeout(timer);
  }, [progress, webGLError, onDone]);

  return (
    <div className={`loader ${hidden ? "loader-hidden" : ""}`}>
      {webGLError ? (
        <div className="loader-card">
          <p className="loader-error">{t("webglError")}</p>
          <a href={osUrl} className="loader-link">
            {t("openDesktop")}
          </a>
        </div>
      ) : (
        <div className="loader-card">
          <h1 className="loader-name">{hero("name")}</h1>
          <p className="loader-title">{hero("title")}</p>
          <div
            className="loader-bar"
            role="progressbar"
            aria-label={t("loading")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div className="loader-bar-fill" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      )}
    </div>
  );
}
