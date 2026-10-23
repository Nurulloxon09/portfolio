"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Application from "@/scene/Application";
import { dispatch } from "@/scene/events";
import { HelpPrompt } from "./HelpPrompt";
import { InfoOverlay } from "./InfoOverlay";
import { LoadingScreen } from "./LoadingScreen";

function hasWebGL() {
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
}

/** The 3D desk. Client-only: it needs WebGL and the window size. */
export default function DeskScene({ osUrl }: { osUrl: string }) {
  const t = useTranslations("scene");
  const css = useRef<HTMLDivElement>(null);
  const webgl = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const video1 = useRef<HTMLVideoElement>(null);
  const video2 = useRef<HTMLVideoElement>(null);
  const app = useRef<Application | null>(null);
  const [webGLError, setWebGLError] = useState(false);
  const [started, setStarted] = useState(false);
  const osTitle = t("osTitle");

  useEffect(() => {
    if (!hasWebGL()) {
      setWebGLError(true);
      return;
    }
    const instance = new Application({
      layers: {
        css: css.current!,
        webgl: webgl.current!,
        overlay: overlay.current!,
        videos: [video1.current!, video2.current!],
      },
      osUrl,
      osTitle,
    });
    app.current = instance;
    return () => {
      instance.destroy();
      app.current = null;
    };
  }, [osUrl, osTitle]);

  const start = () => {
    app.current?.resumeAudio();
    dispatch("loadingScreenDone");
    setStarted(true);
  };

  return (
    <div className="desk-scene">
      <div className="desk-css" ref={css} />
      <div className="desk-webgl" ref={webgl} />
      <div className="desk-overlay" ref={overlay} />
      <div className="desk-ui-interactive">{started && <InfoOverlay />}</div>
      <div className="desk-ui" style={{ pointerEvents: started ? "none" : "auto" }}>
        {started && <HelpPrompt />}
        <LoadingScreen webGLError={webGLError} osUrl={osUrl} onStart={start} />
      </div>
      <div className="desk-videos" aria-hidden>
        <video ref={video1} muted loop autoPlay playsInline src="/scene/textures/static-base.mp4" />
        <video ref={video2} muted loop autoPlay playsInline src="/scene/textures/static-layer.mp4" />
      </div>
    </div>
  );
}
