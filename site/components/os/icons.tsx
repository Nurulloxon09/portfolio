// Pixel-art icons for the desktop, drawn on a 32×32 grid (16×16 for small ones).

export type IconName = "portfolio" | "minesweeper" | "uteach" | "computer" | "start" | "globe" | "speaker";

const OUTLINE = "#000";

function Portfolio() {
  return (
    <>
      {/* Folder back and tab */}
      <path d="M2 7h10l2 3h16v18H2z" fill="#c8a03c" stroke={OUTLINE} strokeWidth="1" />
      {/* Paper sticking out */}
      <path d="M6 9h18v10H6z" fill="#fff" stroke={OUTLINE} strokeWidth="1" />
      <path d="M8 12h12M8 14h14M8 16h10" stroke="#000080" strokeWidth="1" />
      {/* Folder front */}
      <path d="M2 14h28l-2 14H2z" fill="#f6d36b" stroke={OUTLINE} strokeWidth="1" />
      <path d="M3 15h26" stroke="#fff3b8" strokeWidth="1" />
      {/* Pi badge */}
      <rect x="19" y="18" width="9" height="8" fill="#000080" stroke={OUTLINE} strokeWidth="1" />
      <path d="M21 20h6M22 20v5M25 20v5" stroke="#fff" strokeWidth="1" />
    </>
  );
}

function Mine() {
  return (
    <>
      <rect x="1" y="1" width="30" height="30" fill="#c0c0c0" stroke="#808080" strokeWidth="1" />
      <path d="M16 4v24M4 16h24M7 7l18 18M25 7L7 25" stroke="#000" strokeWidth="2" />
      <circle cx="16" cy="16" r="8" fill="#000" />
      <rect x="12" y="12" width="3" height="3" fill="#fff" />
    </>
  );
}

function Uteach() {
  return (
    <>
      {/* uteach's violet badge with a mortarboard */}
      <rect x="2" y="2" width="28" height="28" rx="6" fill="#7a2ee3" stroke={OUTLINE} strokeWidth="1" />
      <path d="M5 13l11-6 11 6-11 6z" fill="#fff" />
      <path d="M10 16v6c3 3 9 3 12 0v-6l-6 3z" fill="#e4d4fb" />
      <path d="M25 13v7" stroke="#fff" strokeWidth="2" />
      <rect x="24" y="20" width="3" height="3" fill="#ffd34e" />
    </>
  );
}

function Computer() {
  return (
    <>
      <rect x="4" y="3" width="24" height="18" fill="#c0c0c0" stroke={OUTLINE} strokeWidth="1" />
      <rect x="7" y="6" width="18" height="12" fill="#008080" stroke="#808080" strokeWidth="1" />
      <path d="M8 7h4" stroke="#7fd4d4" strokeWidth="1" />
      <rect x="10" y="21" width="12" height="3" fill="#c0c0c0" stroke={OUTLINE} strokeWidth="1" />
      <rect x="3" y="24" width="26" height="5" fill="#c0c0c0" stroke={OUTLINE} strokeWidth="1" />
      <path d="M20 26.5h6" stroke="#808080" strokeWidth="1" />
    </>
  );
}

function Start() {
  return (
    <>
      <rect x="1" y="1" width="14" height="14" fill="#000080" />
      <path d="M1 1h14M1 1v14" stroke="#4f6fd0" strokeWidth="1" />
      <path d="M3.5 4.5h9M6 4.5v8M10 4.5v7.5l1.5 0.5" stroke="#fff" strokeWidth="1.6" fill="none" />
    </>
  );
}

function Globe() {
  return (
    <>
      <circle cx="8" cy="8" r="6.5" fill="#3a7bd5" stroke={OUTLINE} strokeWidth="1" />
      <path d="M4 5h3l1 2-2 2-1 3-2-2zM9 3l3 1 1 3-2 1-2-2zM10 10h2l-1 3-2-1z" fill="#2e8b3a" />
    </>
  );
}

function Speaker() {
  return (
    <>
      <path d="M2 6h3l4-3v10l-4-3H2z" fill="#ffd700" stroke={OUTLINE} strokeWidth="1" />
      <path d="M11 5.5q2 2.5 0 5M12.5 4q3.5 4 0 8" stroke={OUTLINE} strokeWidth="1" fill="none" />
    </>
  );
}

const ICONS: Record<IconName, { view: number; draw: () => React.ReactNode }> = {
  portfolio: { view: 32, draw: Portfolio },
  minesweeper: { view: 32, draw: Mine },
  uteach: { view: 32, draw: Uteach },
  computer: { view: 32, draw: Computer },
  start: { view: 16, draw: Start },
  globe: { view: 16, draw: Globe },
  speaker: { view: 16, draw: Speaker },
};

export function Icon({ name, size = 32, className }: { name: IconName; size?: number; className?: string }) {
  const icon = ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${icon.view} ${icon.view}`}
      shapeRendering="crispEdges"
      aria-hidden
      className={className}
    >
      {icon.draw()}
    </svg>
  );
}

/** Glyphs for the minimize / maximize / restore / close title-bar buttons. */
export function WindowGlyph({ kind }: { kind: "minimize" | "maximize" | "restore" | "close" }) {
  return (
    <svg width="8" height="7" viewBox="0 0 8 7" shapeRendering="crispEdges" aria-hidden>
      {kind === "minimize" && <rect x="1" y="5" width="6" height="2" fill="#000" />}
      {kind === "maximize" && <path d="M0.5 0.5h7v6h-7zM0.5 1.5h7" stroke="#000" fill="none" strokeWidth="1" />}
      {kind === "restore" && (
        <path d="M2.5 0.5h5v4h-1M2.5 1.5h5M0.5 2.5h5v4h-5zM0.5 3.5h5" stroke="#000" fill="none" strokeWidth="1" />
      )}
      {kind === "close" && <path d="M0 0l1 0 3 3 3-3 1 0-3.5 3.5 3.5 3.5-1 0-3-3-3 3-1 0 3.5-3.5z" fill="#000" />}
    </svg>
  );
}
