import { dispatch } from "@/scene/events";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Types `text` out one character at a time, ticking the typewriter sound for
 * each one while `audible()` is true. Stops early when `cancelled()` turns true.
 */
export async function typeOut(
  text: string,
  onChange: (typed: string) => void,
  { cancelled, audible = () => true, delay = () => Math.random() * 50 + 50 }: {
    cancelled: () => boolean;
    audible?: () => boolean;
    delay?: () => number;
  },
) {
  let typed = "";
  for (const char of text) {
    await sleep(delay());
    if (cancelled()) return false;
    if (audible()) dispatch("autoType");
    typed += char;
    onChange(typed);
  }
  return true;
}
