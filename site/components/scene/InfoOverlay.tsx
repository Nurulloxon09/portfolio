"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { dispatch, on } from "@/scene/events";
import { sleep, typeOut } from "./typing";

function useClock(locale: string) {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString(locale));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString(locale)), 1000);
    return () => clearInterval(id);
  }, [locale]);
  return time;
}

function IconButton({ icon, size, onPress, label }: { icon: string; size: number; onPress: () => void; label: string }) {
  return (
    <button
      type="button"
      className="icon-control"
      aria-label={label}
      data-prevent-click
      onMouseDown={(event) => {
        event.preventDefault();
        onPress();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onPress();
        }
      }}
    >
      <img src={icon} alt="" height={size} data-prevent-click />
    </button>
  );
}

/**
 * Name, title and a clock in the top-left corner, typed out after the first
 * click, with sound and free-camera toggles. Hidden while at the monitor.
 */
export function InfoOverlay() {
  const t = useTranslations("scene");
  const hero = useTranslations("hero");
  const locale = useLocale();
  const time = useClock(locale);

  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [clock, setClock] = useState("");
  const [typed, setTyped] = useState(false);
  const [muted, setMuted] = useState(false);
  const [freeCam, setFreeCam] = useState(false);
  const visibleRef = useRef(visible);
  const timeRef = useRef(time);

  useEffect(() => {
    visibleRef.current = visible;
    if (visible) setShown(true);
  }, [visible]);

  useEffect(() => {
    timeRef.current = time;
    if (typed) setClock(time);
  }, [time, typed]);

  // The first click after START reveals the overlay; the monitor hides it again
  useEffect(() => {
    let firstClick = true;
    const onFirstClick = () => {
      if (!firstClick) return;
      firstClick = false;
      setVisible(true);
    };
    document.addEventListener("mousedown", onFirstClick);
    const offEnter = on("enterMonitor", () => {
      firstClick = false;
      setVisible(false);
    });
    const offLeave = on("leftMonitor", () => setVisible(true));
    return () => {
      document.removeEventListener("mousedown", onFirstClick);
      offEnter();
      offLeave();
    };
  }, []);

  useEffect(() => {
    if (!shown) return;
    let cancelled = false;
    const options = { cancelled: () => cancelled, audible: () => visibleRef.current };
    setName("");
    setTitle("");
    setClock("");
    void (async () => {
      await sleep(400);
      if (!(await typeOut(hero("name"), setName, options))) return;
      if (!(await typeOut(hero("title"), setTitle, options))) return;
      if (!(await typeOut(timeRef.current, setClock, options))) return;
      setTyped(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [shown, hero]);

  useEffect(() => dispatch("muteToggle", muted), [muted]);

  const toggleFreeCam = () => {
    const next = !freeCam;
    setFreeCam(next);
    dispatch("autoType");
    dispatch("freeCamToggle", next);
  };

  return (
    <div className={`info-overlay ${visible ? "" : "info-overlay-hidden"}`} data-prevent-click>
      {name && (
        <div className="info-box">
          <p>{name}</p>
        </div>
      )}
      {title && (
        <div className="info-box">
          <p>{title}</p>
        </div>
      )}
      {clock && (
        <div className="info-row">
          <div className="info-box">
            <p suppressHydrationWarning>{clock}</p>
          </div>
          {typed && (
            <>
              <IconButton
                icon={muted ? "/scene/ui/volume_off.svg" : "/scene/ui/volume_on.svg"}
                size={10}
                label={muted ? t("unmute") : t("mute")}
                onPress={() => setMuted((m) => !m)}
              />
              <IconButton
                icon={freeCam ? "/scene/ui/mouse.svg" : "/scene/ui/camera.svg"}
                size={freeCam ? 10 : 6}
                label={freeCam ? t("freeCamOff") : t("freeCamOn")}
                onPress={toggleFreeCam}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
