"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const SIZE = 9;
const MINES = 10;
const LONG_PRESS_MS = 400;

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; adjacent: number };
type Status = "ready" | "playing" | "won" | "lost";

const emptyBoard = (): Cell[] =>
  Array.from({ length: SIZE * SIZE }, () => ({ mine: false, revealed: false, flagged: false, adjacent: 0 }));

function neighbors(index: number) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr;
      const c = col + dc;
      if ((dr || dc) && r >= 0 && r < SIZE && c >= 0 && c < SIZE) result.push(r * SIZE + c);
    }
  }
  return result;
}

/** Lays mines anywhere except the first clicked cell and its neighbours. */
function layMines(board: Cell[], safe: number) {
  const keepClear = new Set([safe, ...neighbors(safe)]);
  let placed = 0;
  while (placed < MINES) {
    const i = Math.floor(Math.random() * board.length);
    if (board[i].mine || keepClear.has(i)) continue;
    board[i].mine = true;
    placed++;
  }
  board.forEach((cell, i) => (cell.adjacent = neighbors(i).filter((n) => board[n].mine).length));
}

/** Reveals a cell, flooding outwards through cells with no adjacent mines. */
function flood(board: Cell[], start: number) {
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    const cell = board[i];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (!cell.mine && cell.adjacent === 0) stack.push(...neighbors(i));
  }
}

function Face({ status, pressing }: { status: Status; pressing: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" shapeRendering="crispEdges" aria-hidden>
      <circle cx="9" cy="9" r="8" fill="#ffff00" stroke="#000" />
      {status === "won" ? (
        <path d="M3 7h12M4 7h4v2H4zM10 7h4v2h-4z" stroke="#000" fill="#000" />
      ) : status === "lost" ? (
        <path d="M5 5l3 3M8 5l-3 3M10 5l3 3M13 5l-3 3" stroke="#000" />
      ) : (
        <>
          <rect x="6" y="6" width="2" height="2" fill="#000" />
          <rect x="10" y="6" width="2" height="2" fill="#000" />
        </>
      )}
      {status === "lost" ? (
        <path d="M6 13.5q3-3 6 0" stroke="#000" fill="none" />
      ) : pressing ? (
        <circle cx="9" cy="12.5" r="2" fill="none" stroke="#000" />
      ) : (
        <path d="M5.5 11q3.5 3.5 7 0" stroke="#000" fill="none" />
      )}
    </svg>
  );
}

const lcd = (n: number) => String(Math.max(-99, Math.min(999, n))).padStart(3, "0");

export function Minesweeper() {
  const t = useTranslations("minesweeper");
  const [board, setBoard] = useState(emptyBoard);
  const [status, setStatus] = useState<Status>("ready");
  const [seconds, setSeconds] = useState(0);
  const [pressing, setPressing] = useState(false);
  const longPress = useRef<{ timer: number; fired: boolean } | null>(null);

  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => setSeconds((s) => Math.min(999, s + 1)), 1000);
    return () => clearInterval(id);
  }, [status]);

  const reset = () => {
    setBoard(emptyBoard());
    setStatus("ready");
    setSeconds(0);
  };

  const finish = (next: Cell[]) => {
    if (next.some((c) => c.mine && c.revealed)) {
      next.forEach((c) => c.mine && (c.revealed = true));
      setStatus("lost");
    } else if (next.every((c) => c.mine || c.revealed)) {
      next.forEach((c) => c.mine && (c.flagged = true));
      setStatus("won");
    }
    setBoard(next);
  };

  const reveal = (i: number) => {
    if (status === "won" || status === "lost") return;
    const next = board.map((c) => ({ ...c }));
    const cell = next[i];
    if (cell.flagged) return;
    if (status === "ready") {
      layMines(next, i);
      setStatus("playing");
    }
    if (cell.revealed && cell.adjacent > 0) {
      // Chord: a number with all its flags placed opens the rest of its neighbours
      const around = neighbors(i);
      if (around.filter((n) => next[n].flagged).length === cell.adjacent) around.forEach((n) => flood(next, n));
    } else {
      flood(next, i);
    }
    finish(next);
  };

  const toggleFlag = (i: number) => {
    if (status === "won" || status === "lost" || board[i].revealed) return;
    setBoard((prev) => prev.map((c, j) => (j === i ? { ...c, flagged: !c.flagged } : c)));
  };

  const flags = board.filter((c) => c.flagged).length;
  const over = status === "won" || status === "lost";

  return (
    <div className="mines">
      <div className="mines-header">
        <span className="mines-lcd" aria-label={t("minesLeft")}>
          {lcd(MINES - flags)}
        </span>
        <button type="button" className="mines-face" onClick={reset} aria-label={t("newGame")}>
          <Face status={status} pressing={pressing} />
        </button>
        <span className="mines-lcd" aria-label={t("time")}>
          {lcd(seconds)}
        </span>
      </div>
      <div
        className="mines-board"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
        onPointerLeave={() => setPressing(false)}
        role="grid"
      >
        {board.map((cell, i) => (
          <button
            key={i}
            type="button"
            className={`mines-cell ${cell.revealed ? "mines-cell-open" : ""} ${cell.revealed && cell.mine && status === "lost" ? "mines-cell-boom" : ""}`}
            data-n={cell.revealed && !cell.mine ? cell.adjacent : undefined}
            disabled={over && !cell.revealed && !cell.flagged}
            onContextMenu={(event) => {
              event.preventDefault();
              toggleFlag(i);
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              setPressing(true);
              if (event.pointerType !== "mouse") {
                const timer = window.setTimeout(() => {
                  if (longPress.current) longPress.current.fired = true;
                  toggleFlag(i);
                }, LONG_PRESS_MS);
                longPress.current = { timer, fired: false };
              }
            }}
            onPointerUp={() => {
              setPressing(false);
              if (longPress.current) window.clearTimeout(longPress.current.timer);
            }}
            onClick={() => {
              const fired = longPress.current?.fired;
              longPress.current = null;
              if (!fired) reveal(i);
            }}
            aria-label={cell.flagged ? t("flag") : cell.revealed ? (cell.mine ? t("mine") : String(cell.adjacent)) : t("hidden")}
          >
            {cell.flagged && !cell.revealed ? "⚑" : cell.revealed ? (cell.mine ? "✹" : cell.adjacent || "") : ""}
          </button>
        ))}
      </div>
      <p className="mines-status" aria-live="polite">
        {status === "won" ? t("won") : status === "lost" ? t("lost") : t("hint")}
      </p>
    </div>
  );
}
