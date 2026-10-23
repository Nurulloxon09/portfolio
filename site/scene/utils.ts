import EventEmitter from "./EventEmitter";
import { on } from "./events";

export class Sizes extends EventEmitter {
  width = window.innerWidth;
  height = window.innerHeight;
  pixelRatio = Math.min(window.devicePixelRatio, 2);

  constructor(signal: AbortSignal) {
    super();
    window.addEventListener(
      "resize",
      () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.trigger("resize");
      },
      { signal },
    );
  }
}

export class Time extends EventEmitter {
  start = Date.now();
  current = this.start;
  elapsed = 0;
  delta = 16;
  private frame = 0;

  constructor(signal: AbortSignal) {
    super();
    this.frame = window.requestAnimationFrame(() => this.tick());
    // The idle camera orbit starts from the same spot every time the scene starts
    on("loadingScreenDone", () => (this.start = Date.now()), signal);
    signal.addEventListener("abort", () => window.cancelAnimationFrame(this.frame));
  }

  private tick() {
    const now = Date.now();
    this.delta = now - this.current;
    this.current = now;
    this.elapsed = this.current - this.start;
    this.trigger("tick");
    this.frame = window.requestAnimationFrame(() => this.tick());
  }
}

/** Last known pointer position, in page pixels. Fed by MonitorScreen. */
export class Mouse {
  x = 0;
  y = 0;
  inComputer = false;

  move(event: MouseEvent, inComputer: boolean) {
    if (event.clientX && event.clientY) {
      this.x = event.clientX;
      this.y = event.clientY;
    }
    this.inComputer = inComputer;
  }
}
