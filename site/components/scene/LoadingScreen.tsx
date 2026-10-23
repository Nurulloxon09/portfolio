"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { on } from "@/scene/events";
import { scores } from "@/content/profile";

const RESOURCE_LINES = 8;

function today() {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;
}

/** A BIOS-style boot screen that lists files as they load, then a START button. */
export function LoadingScreen({
  webGLError,
  osUrl,
  onStart,
}: {
  webGLError: boolean;
  osUrl: string;
  onStart: () => void;
}) {
  const t = useTranslations("scene");
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [toLoad, setToLoad] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [textVisible, setTextVisible] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(
    () =>
      on("loadedSource", ({ sourceName, progress, loaded, toLoad }) => {
        setProgress(progress);
        setLoaded(loaded);
        setToLoad(toLoad);
        const line = `Loaded ${sourceName.padEnd(24, " ")} ... ${Math.round(progress * 100)}%`;
        setLines((prev) => [...prev, line].slice(-RESOURCE_LINES));
      }),
    [],
  );

  useEffect(() => {
    if (progress < 1 || webGLError) return;
    const timers = [
      setTimeout(() => setTextVisible(false), 1000),
      setTimeout(() => setPopupVisible(true), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [progress, webGLError]);

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);
    onStart();
  };

  const done = progress >= 1;

  return (
    <div className={`boot ${started ? "boot-hidden" : ""}`}>
      {!popupVisible && !textVisible && (
        <div className="boot-cursor-only">
          <span className="blinking-cursor" />
        </div>
      )}
      {!webGLError && (
        <div className="boot-text" style={{ opacity: textVisible ? 1 : 0 }}>
          <div className="boot-header">
            <div>
              <p className="boot-green">
                <b>Nurulloxon,</b>
              </p>
              <p className="boot-green">
                <b>Portfolio BIOS</b>
              </p>
            </div>
            <div className="boot-header-info">
              <p>Released: 10/23/2026</p>
              <p>NXBIOS (C)2026 Nurulloxon, Namangan</p>
            </div>
          </div>
          <div className="boot-body">
            <p>SAT-{scores.satMath} Math Coprocessor ............ OK</p>
            <div className="boot-spacer" />
            <p>IELTS {scores.ielts} Language Module ......... DETECTED</p>
            <p>Checking RAM : {scores.satTotal} KB OK</p>
            <div className="boot-spacer" />
            <div className="boot-spacer" />
            {done ? (
              <p>FINISHED LOADING RESOURCES</p>
            ) : (
              <p className="loading">
                LOADING RESOURCES ({loaded}/{toLoad === 0 ? "-" : toLoad})
              </p>
            )}
            <div className="boot-spacer" />
            <div className="boot-resources">
              {lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="boot-spacer" />
            {done && <p>{t.rich("allLoaded", { b: (chunks) => <b className="boot-green">{chunks}</b> })}</p>}
            <div className="boot-spacer" />
            <span className="blinking-cursor" />
          </div>
          <div className="boot-footer">
            <p>
              Press <b>DEL</b> to enter SETUP, <b>ESC</b> to skip memory test
            </p>
            <p suppressHydrationWarning>{today()}</p>
          </div>
        </div>
      )}
      <div className="boot-popup-container" style={{ opacity: popupVisible ? 1 : 0, pointerEvents: popupVisible && !started ? "auto" : "none" }}>
        <div className="boot-popup">
          <p>{t("startTitle")}</p>
          {mobile && (
            <>
              <br />
              <p className="boot-warning">
                <b>{t("mobileWarning")}</b>
              </p>
              <br />
            </>
          )}
          <div className="boot-prompt">
            <p>{t("clickStart")}&nbsp;</p>
            <span className="blinking-cursor" />
          </div>
          <div className="boot-start-row">
            <button type="button" className="bios-start-button" onClick={start} data-prevent-click>
              {t("start")}
            </button>
          </div>
        </div>
      </div>
      {webGLError && (
        <div className="boot-popup-container">
          <div className="boot-popup">
            <p>
              <b className="boot-red">{t("webglErrorTitle")}</b> {t("webglErrorBody")}
            </p>
            <div className="boot-spacer" />
            <p>{t("webglRequired")}</p>
            <div className="boot-spacer" />
            <p>
              <a href={osUrl} className="boot-link">
                {t("openDesktop")}
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
