"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { Icon, type IconName } from "./icons";

export type TaskbarItem = { key: string; title: string; icon: IconName; minimized: boolean };

function useClock(locale: string) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" }));
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, [locale]);
  return time;
}

export function Taskbar({
  items,
  activeKey,
  apps,
  onItem,
  onOpenApp,
  onShutDown,
}: {
  items: TaskbarItem[];
  activeKey: string | null;
  apps: { key: string; title: string; icon: IconName }[];
  onItem: (key: string) => void;
  onOpenApp: (key: string) => void;
  onShutDown: () => void;
}) {
  const t = useTranslations("os");
  const languages = useTranslations("languages");
  const locale = useLocale();
  const time = useClock(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);

  // Any press outside the menu and the Start button closes the menu
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || startRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const choose = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <div className="taskbar">
      {menuOpen && (
        <div className="start-menu" ref={menuRef} role="menu">
          <div className="start-menu-banner">
            <span>{t("name")}</span>
          </div>
          <div className="start-menu-items">
            {apps.map((app) => (
              <button key={app.key} type="button" role="menuitem" className="start-menu-item" onClick={choose(() => onOpenApp(app.key))}>
                <Icon name={app.icon} size={24} />
                <span>{app.title}</span>
              </button>
            ))}
            <div className="start-menu-separator" />
            <div className="start-menu-heading">
              <Icon name="globe" size={16} />
              <span>{t("language")}</span>
            </div>
            {routing.locales.map((l) => (
              <a
                key={l}
                role="menuitem"
                href={`/${l}/os`}
                hrefLang={l}
                aria-current={l === locale ? "true" : undefined}
                className="start-menu-item start-menu-item-small"
              >
                <span className="start-menu-check">{l === locale ? "✓" : ""}</span>
                <span>{languages(l)}</span>
              </a>
            ))}
            <div className="start-menu-separator" />
            <button type="button" role="menuitem" className="start-menu-item" onClick={choose(onShutDown)}>
              <Icon name="computer" size={24} />
              <span>{t("shutDown")}</span>
            </button>
          </div>
        </div>
      )}
      <button
        ref={startRef}
        type="button"
        className={`taskbar-button taskbar-start ${menuOpen ? "taskbar-button-pressed" : ""}`}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <Icon name="start" size={16} />
        <span>{t("start")}</span>
      </button>
      <div className="taskbar-items">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`taskbar-button taskbar-item ${activeKey === item.key && !item.minimized ? "taskbar-button-pressed" : ""}`}
            onClick={() => onItem(item.key)}
          >
            <Icon name={item.icon} size={16} />
            <span>{item.title}</span>
          </button>
        ))}
      </div>
      <div className="taskbar-tray">
        <Icon name="speaker" size={16} />
        <span suppressHydrationWarning>{time}</span>
      </div>
    </div>
  );
}
