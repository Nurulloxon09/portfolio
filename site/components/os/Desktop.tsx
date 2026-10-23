"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon, type IconName } from "./icons";
import { ParentBridge } from "./ParentBridge";
import { ShutdownScreen } from "./ShutdownScreen";
import { Taskbar } from "./Taskbar";
import { Window, type Rect } from "./Window";
import { Showcase, type QrCode } from "./apps/Showcase";
import { Minesweeper } from "./apps/Minesweeper";
import "./os.css";

type AppKey = "showcase" | "minesweeper";

type AppDefinition = {
  key: AppKey;
  icon: IconName;
  resizable: boolean;
  /** Where the window opens, given the desktop size */
  rect: (width: number, height: number) => Rect;
  /** CSS placement for a window that is open from the first render */
  defaultClassName?: string;
};

const TASKBAR_HEIGHT = 32;
// Below this width every window opens maximized
const NARROW = 640;

const APPS: AppDefinition[] = [
  {
    key: "showcase",
    icon: "portfolio",
    resizable: true,
    rect: (w, h) => ({ x: 96, y: 24, w: Math.min(w - 136, 1080), h: h - TASKBAR_HEIGHT - 64 }),
    defaultClassName: "window-showcase-default",
  },
  {
    key: "minesweeper",
    icon: "minesweeper",
    resizable: false,
    rect: (w) => ({ x: Math.max(120, w - 420), y: 80, w: 236, h: 330 }),
  },
];

type OpenWindow = { key: AppKey; zIndex: number; minimized: boolean; rect: Rect | null; maximized: boolean };

// The portfolio window greets every visitor, and is in the server-rendered HTML
const INITIAL_WINDOWS: OpenWindow[] = [{ key: "showcase", zIndex: 1, minimized: false, rect: null, maximized: false }];

export function Desktop({ qr }: { qr: QrCode | null }) {
  const t = useTranslations("apps");
  const showcase = useTranslations("showcase");
  const [windows, setWindows] = useState<OpenWindow[]>(INITIAL_WINDOWS);
  const [focused, setFocused] = useState<AppKey | null>("showcase");
  const [selected, setSelected] = useState<AppKey | null>(null);
  const [poweredOn, setPoweredOn] = useState(true);
  const lastPointer = useRef("mouse");

  const title = (key: AppKey) => (key === "showcase" ? t("showcaseTitle") : t(key));

  const open = useCallback((key: AppKey) => {
    setWindows((prev) => {
      const top = Math.max(0, ...prev.map((w) => w.zIndex)) + 1;
      const existing = prev.find((w) => w.key === key);
      if (existing) return prev.map((w) => (w.key === key ? { ...w, minimized: false, zIndex: top } : w));
      const app = APPS.find((a) => a.key === key)!;
      const width = window.innerWidth;
      const height = window.innerHeight;
      return [...prev, { key, zIndex: top, minimized: false, rect: app.rect(width, height), maximized: width < NARROW }];
    });
    setFocused(key);
  }, []);

  const focus = useCallback((key: AppKey) => {
    setWindows((prev) => {
      const top = Math.max(0, ...prev.map((w) => w.zIndex));
      return prev.map((w) => (w.key === key && w.zIndex !== top ? { ...w, zIndex: top + 1 } : w));
    });
    setFocused(key);
  }, []);

  const minimize = (key: AppKey) => {
    setWindows((prev) => prev.map((w) => (w.key === key ? { ...w, minimized: true } : w)));
    setFocused(null);
  };

  const close = (key: AppKey) => {
    setWindows((prev) => prev.filter((w) => w.key !== key));
    setFocused(null);
  };

  // Taskbar button: restore a minimized window, minimize the focused one, focus the rest
  const toggle = (key: AppKey) => {
    const win = windows.find((w) => w.key === key);
    if (!win) return;
    if (win.minimized) open(key);
    else if (focused === key) minimize(key);
    else focus(key);
  };

  const boot = useCallback(() => {
    setPoweredOn(true);
    setWindows(INITIAL_WINDOWS);
    setFocused("showcase");
  }, []);

  if (!poweredOn) {
    return (
      <>
        <ParentBridge />
        <ShutdownScreen onRestart={boot} />
      </>
    );
  }

  return (
    <div
      className="desktop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          setFocused(null);
          setSelected(null);
        }
      }}
    >
      <ParentBridge />
      <ul className="desktop-shortcuts">
        {APPS.map((app) => (
          <li key={app.key}>
            <button
              type="button"
              className={`desktop-shortcut ${selected === app.key ? "desktop-shortcut-selected" : ""}`}
              onPointerDown={(event) => (lastPointer.current = event.pointerType)}
              onClick={() => {
                setSelected(app.key);
                // Touch screens have no double click
                if (lastPointer.current === "touch") open(app.key);
              }}
              onDoubleClick={() => open(app.key)}
              onKeyDown={(event) => event.key === "Enter" && open(app.key)}
            >
              <Icon name={app.icon} size={32} />
              <span className="desktop-shortcut-label">{app.key === "showcase" ? t("showcase") : t(app.key)}</span>
            </button>
          </li>
        ))}
      </ul>

      {windows.map((win) => {
        const app = APPS.find((a) => a.key === win.key)!;
        return (
          <Window
            key={win.key}
            title={title(win.key)}
            icon={app.icon}
            rect={win.rect}
            defaultClassName={app.defaultClassName}
            startMaximized={win.maximized}
            resizable={app.resizable}
            active={focused === win.key}
            minimized={win.minimized}
            zIndex={win.zIndex}
            statusText={win.key === "showcase" ? showcase("copyright") : undefined}
            onFocus={() => focus(win.key)}
            onMinimize={() => minimize(win.key)}
            onClose={() => close(win.key)}
          >
            {win.key === "showcase" && <Showcase qr={qr} />}
            {win.key === "minesweeper" && <Minesweeper />}
          </Window>
        );
      })}

      <Taskbar
        items={windows.map((w) => ({
          key: w.key,
          title: title(w.key),
          icon: APPS.find((a) => a.key === w.key)!.icon,
          minimized: w.minimized,
        }))}
        activeKey={focused}
        apps={APPS.map((a) => ({ key: a.key, title: a.key === "showcase" ? t("showcase") : t(a.key), icon: a.icon }))}
        onItem={(key) => toggle(key as AppKey)}
        onOpenApp={(key) => open(key as AppKey)}
        onShutDown={() => setTimeout(() => setPoweredOn(false), 300)}
      />
    </div>
  );
}
