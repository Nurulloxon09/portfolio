"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon, WindowGlyph, type IconName } from "./icons";

export type Rect = { x: number; y: number; w: number; h: number };

const TASKBAR_HEIGHT = 32;
const MIN_SIZE = { w: 280, h: 180 };

type WindowProps = {
  title: string;
  icon: IconName;
  /** null: placed by the `defaultClassName` CSS until the first drag */
  rect: Rect | null;
  defaultClassName?: string;
  active: boolean;
  minimized: boolean;
  zIndex: number;
  startMaximized?: boolean;
  resizable?: boolean;
  statusText?: string;
  onFocus: () => void;
  onMinimize: () => void;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * A Windows 95 style window. Dragging the title bar or the corner grip shows a
 * dotted outline, and the window jumps there on release, like the real thing.
 */
export function Window({
  title,
  icon,
  rect: initialRect,
  defaultClassName = "",
  active,
  minimized,
  zIndex,
  startMaximized = false,
  resizable = true,
  statusText,
  onFocus,
  onMinimize,
  onClose,
  children,
}: WindowProps) {
  const t = useTranslations("os");
  const [rect, setRect] = useState(initialRect);
  const [maximized, setMaximized] = useState(startMaximized);
  const [outline, setOutline] = useState<Rect | null>(null);
  const section = useRef<HTMLElement>(null);
  const gesture = useRef<{
    mode: "move" | "resize";
    startX: number;
    startY: number;
    from: Rect;
    moved: boolean;
  } | null>(null);

  const begin = (mode: "move" | "resize") => (event: React.PointerEvent) => {
    if (event.button !== 0 || maximized) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const el = section.current!;
    const from = rect ?? { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
    gesture.current = { mode, startX: event.clientX, startY: event.clientY, from, moved: false };
  };

  const nextRect = (event: React.PointerEvent): Rect | null => {
    const g = gesture.current;
    if (!g) return null;
    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;
    if (g.mode === "move") {
      const maxY = window.innerHeight - TASKBAR_HEIGHT - 24;
      return {
        ...g.from,
        x: Math.min(Math.max(g.from.x + dx, 40 - g.from.w), window.innerWidth - 40),
        y: Math.min(Math.max(g.from.y + dy, 0), maxY),
      };
    }
    return { ...g.from, w: Math.max(MIN_SIZE.w, g.from.w + dx), h: Math.max(MIN_SIZE.h, g.from.h + dy) };
  };

  const move = (event: React.PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    // A plain click on the title bar shouldn't flash the outline
    if (!g.moved && Math.hypot(event.clientX - g.startX, event.clientY - g.startY) < 3) return;
    g.moved = true;
    setOutline(nextRect(event));
  };

  const end = (event: React.PointerEvent) => {
    const g = gesture.current;
    const next = g?.moved ? nextRect(event) : null;
    gesture.current = null;
    setOutline(null);
    if (next) setRect(next);
  };

  const box = maximized
    ? { left: 0, top: 0, width: "100%", height: `calc(100% - ${TASKBAR_HEIGHT}px)` }
    : rect
      ? { left: rect.x, top: rect.y, width: rect.w, height: rect.h }
      : {};

  return (
    <>
      <section
        ref={section}
        className={`window ${!rect && !maximized ? defaultClassName : ""} ${minimized ? "window-minimized" : ""}`}
        style={{ ...box, zIndex }}
        onPointerDown={onFocus}
        aria-label={title}
        aria-hidden={minimized || undefined}
      >
        <div
          className={`window-titlebar ${active ? "" : "window-titlebar-inactive"}`}
          onPointerDown={begin("move")}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onDoubleClick={() => resizable && setMaximized((m) => !m)}
        >
          <Icon name={icon} size={16} className="window-title-icon" />
          <span className="window-title">{title}</span>
          <div className="window-buttons" onPointerDown={(event) => event.stopPropagation()}>
            <button type="button" className="window-button" aria-label={t("minimize")} onClick={onMinimize}>
              <WindowGlyph kind="minimize" />
            </button>
            {resizable && (
              <button
                type="button"
                className="window-button"
                aria-label={maximized ? t("restore") : t("maximize")}
                onClick={() => setMaximized((m) => !m)}
              >
                <WindowGlyph kind={maximized ? "restore" : "maximize"} />
              </button>
            )}
            <button type="button" className="window-button window-button-close" aria-label={t("close")} onClick={onClose}>
              <WindowGlyph kind="close" />
            </button>
          </div>
        </div>
        <div className="window-content">{children}</div>
        {statusText !== undefined && (
          <div className="window-statusbar">
            <div className="window-status-field window-status-main">{statusText}</div>
            <div className="window-status-field window-status-spacer" />
            <div className="window-status-field window-status-spacer" />
            <div className="window-status-field window-status-grip">
              {resizable && !maximized && (
                <div
                  className="window-grip"
                  onPointerDown={begin("resize")}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerCancel={end}
                />
              )}
            </div>
          </div>
        )}
      </section>
      {outline && (
        <div
          className="window-outline"
          style={{ left: outline.x, top: outline.y, width: outline.w, height: outline.h, zIndex: zIndex + 1 }}
        />
      )}
    </>
  );
}
