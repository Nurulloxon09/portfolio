// Events shared between the Three.js scene and the React overlay. They travel
// as CustomEvents on `document`, like the original UIEventBus.

export type SceneEvents = {
  loadedSource: { sourceName: string; progress: number; loaded: number; toLoad: number };
  loadingScreenDone: undefined;
  enterMonitor: undefined;
  leftMonitor: undefined;
  muteToggle: boolean;
  freeCamToggle: boolean;
  // A typewriter tick for text the overlay types out by itself
  autoType: undefined;
};

export type SceneEventName = keyof SceneEvents;

const PREFIX = "desk-scene:";

export function dispatch<K extends SceneEventName>(name: K, detail?: SceneEvents[K]) {
  document.dispatchEvent(new CustomEvent(PREFIX + name, { detail }));
}

/** Subscribes to a scene event. Returns a function that unsubscribes. */
export function on<K extends SceneEventName>(
  name: K,
  callback: (detail: SceneEvents[K]) => void,
  signal?: AbortSignal,
) {
  const listener = (event: Event) => callback((event as CustomEvent<SceneEvents[K]>).detail);
  document.addEventListener(PREFIX + name, listener, { signal });
  return () => document.removeEventListener(PREFIX + name, listener);
}
