import * as THREE from "three";
import type Application from "../Application";
import { on } from "../events";

const DEFAULT_REF_DISTANCE = 10000;

type PlayOptions = {
  volume?: number;
  randDetuneScale?: number;
  loop?: boolean;
  filter?: { type: BiquadFilterType; frequency: number };
  position?: THREE.Vector3;
  refDistance?: number;
  pitch?: number;
};

export default class AudioManager {
  listener = new THREE.AudioListener();
  computer: ComputerAudio;
  private ambience: AmbienceAudio;
  private pool = new Map<string, THREE.Audio<AudioNode>>();
  private nextKey = 0;

  constructor(private app: Application) {
    app.camera.instance.add(this.listener);
    this.computer = new ComputerAudio(this, app.signal);
    this.ambience = new AmbienceAudio(this, app);

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

    if (options.filter) {
      const filter = audio.context.createBiquadFilter();
      filter.type = options.filter.type;
      filter.frequency.setValueAtTime(options.filter.frequency, audio.context.currentTime);
      audio.setFilter(filter);
    }

    audio.setLoop(Boolean(options.loop));
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

  setFilterFrequency(key: string, frequency: number) {
    const audio = this.pool.get(key);
    if (!audio) return;
    const filter = audio.getFilter() as BiquadFilterNode;
    filter.frequency.setValueAtTime(Math.max(0, Math.min(22050, frequency)), audio.context.currentTime);
  }

  setVolume(key: string, volume: number) {
    this.pool.get(key)?.setVolume(volume);
  }

  update() {
    this.ambience.update();
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

/** Office ambience that gets muffled and quieter as the camera moves in. */
class AmbienceAudio {
  private key = "";

  constructor(
    private manager: AudioManager,
    private app: Application,
  ) {
    on(
      "loadingScreenDone",
      () => {
        this.key = manager.play("office", {
          volume: 1,
          loop: true,
          randDetuneScale: 0,
          filter: { type: "lowpass", frequency: 1000 },
        });
        manager.play("startup", { volume: 0.4, randDetuneScale: 0 });
      },
      app.signal,
    );
  }

  private map(input: number, inStart: number, inEnd: number, outStart: number, outEnd: number) {
    return outStart + ((outEnd - outStart) / (inEnd - inStart)) * (input - inStart);
  }

  update() {
    if (!this.key) return;
    const distance = this.app.camera.instance.position.length();
    const frequency = this.map(distance, 0, 10000, 100, 22000);
    const volume = Math.min(Math.max(this.map(distance, 1200, 10000, 0, 0.2), 0.05), 0.1);
    this.manager.setFilterFrequency(this.key, frequency - 3000);
    this.manager.setVolume(this.key, volume);
  }
}
