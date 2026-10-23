/** A minimal emitter for the scene's internal events (resize, tick, ready). */
export default class EventEmitter {
  private callbacks = new Map<string, (() => void)[]>();

  on(name: string, callback: () => void) {
    const list = this.callbacks.get(name) ?? [];
    list.push(callback);
    this.callbacks.set(name, list);
    return this;
  }

  off(name: string) {
    this.callbacks.delete(name);
    return this;
  }

  trigger(name: string) {
    for (const callback of this.callbacks.get(name) ?? []) callback();
  }
}
