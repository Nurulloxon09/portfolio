"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { on } from "@/scene/events";
import { sleep, typeOut } from "./typing";

/** "Click anywhere to begin", typed out at the bottom until the first click. */
export function HelpPrompt() {
  const t = useTranslations("scene");
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(true);
  const visibleRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled || !visibleRef.current;
    void sleep(500).then(() =>
      typeOut(t("help"), setText, { cancelled: isCancelled, delay: () => Math.random() * 120 + 50 }),
    );

    const hide = () => {
      visibleRef.current = false;
      setVisible(false);
    };
    document.addEventListener("mousedown", hide);
    const off = on("enterMonitor", hide);
    return () => {
      cancelled = true;
      document.removeEventListener("mousedown", hide);
      off();
    };
  }, [t]);

  if (!text) return null;
  return (
    <div className={`help-prompt ${visible ? "" : "help-prompt-hidden"}`}>
      <p>{text}</p>
      <div className="help-prompt-cursor">
        <div className="blinking-cursor" />
      </div>
    </div>
  );
}
