"use client";

export function ThemeToggle({ toDark, toLight }: { toDark: string; toLight: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage may be unavailable (private mode); the switch still applies to this visit.
    }
  }

  // Both labels render; CSS shows the one for the theme this button switches to.
  return (
    <button
      type="button"
      onClick={toggle}
      className="cursor-pointer border-0 bg-transparent p-0 text-[12px] text-(--color-text) opacity-55 hover:text-(--color-accent) hover:opacity-100"
    >
      <span className="theme-label-dark">{toDark}</span>
      <span className="theme-label-light">{toLight}</span>
    </button>
  );
}
