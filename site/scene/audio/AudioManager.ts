import * as THREE from "three";
import type Application from "../Application";
import { on } from "../events";

const DEFAULT_REF_DISTANCE = 10000;

type PlayOptions = {
  volume?: number;
  randDetuneScale?: number;
  position?: THREE.Vector3;
  refDistance?: number;
  pitch?: number;
};

export default class AudioManager {
  listener = new THREE.AudioListener();
  computer: ComputerAudio;
  private pool = new Map<string, THREE.Audio<AudioNode>>();
  private nextKey = 0;

  constructor(private app: Application) {
    app.camera.instance.add(this.listener);
    this.computer = new ComputerAudio(this, app.signal);

    on("muteToggle", (mute) => this.listener.setMasterVolume(mute ? 0 : 1), app.signal);
  }

  /** Browsers start audio suspended until a user gesture; call this from one. */
  resume() {
    void this.listener.context.resume();
  }

  /** Plays a sound; `name` may be a prefix, and a random variant is picked. */
  play(name: string, options: PlayOptions = {}) {
    if (this.listener.context.state === "suspended") this.resume();

    const variants = Object.keys(this.app.resources.items.audio).filter((key) => key.includes(name));
    const sourceName = variants[Math.floor(Math.random() * variants.length)];
    const buffer = this.app.resources.items.audio[sourceName];
    if (!buffer) return "";
    const key = `${sourceName}_${this.nextKey++}`;

    let audio: THREE.Audio<AudioNode>;
    if (options.position) {
      const positional = new THREE.PositionalAudio(this.listener);
      positional.setRefDistance(options.refDistance ?? DEFAULT_REF_DISTANCE);
      positional.position.copy(options.position);
      this.app.scene.add(positional);
      audio = positional;
    } else {
      audio = new THREE.Audio(this.listener);
    }
    audio.setBuffer(buffer);

    audio.setVolume(options.volume ?? 1);
    audio.play();

    // Detune only takes effect once the source exists, i.e. after play()
    audio.setDetune((Math.random() * 200 - 100) * (options.randDetuneScale ?? 0));
    if (options.pitch) audio.setDetune(options.pitch * 100);

    const source = audio.source as AudioBufferSourceNode | null;
    if (source) {
      const ended = source.onended; // three's own handler, which resets isPlaying
      source.onended = (event) => {
        ended?.call(source, event);
        this.pool.delete(key);
        if (options.position) this.app.scene.remove(audio);
      };
      this.pool.set(key, audio);
    }
    return key;
  }

  destroy() {
    for (const audio of this.pool.values()) if (audio.isPlaying) audio.stop();
    this.pool.clear();
  }
}

/** Mouse clicks and key presses on the desk, plus the overlay's typewriter ticks. */
export class ComputerAudio {
  private lastKey = "";

  constructor(
    private manager: AudioManager,
    signal: AbortSignal,
  ) {
    on("autoType", () => manager.play("ccType", { volume: 0.1, randDetuneScale: 0, pitch: 20 }), signal);
  }

  mouseDown() {
    this.manager.play("mouseDown", { volume: 0.8, position: new THREE.Vector3(800, -300, 1200) });
  }

  mouseUp() {
    this.manager.play("mouseUp", { volume: 0.8, position: new THREE.Vector3(800, -300, 1200) });
  }

  keyDown(key: string) {
    // Held keys repeat; only the first press clacks
    if (this.lastKey === key) return;
    this.lastKey = key;
    this.manager.play("keyboardKeydown", { volume: 0.8, position: new THREE.Vector3(-300, -400, 1200) });
  }

  keyUp() {
    this.lastKey = "";
  }
}
