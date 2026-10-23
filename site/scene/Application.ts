import * as THREE from "three";
import Camera from "./Camera";
import Renderer from "./Renderer";
import Resources from "./Resources";
import sources from "./sources";
import { Mouse, Sizes, Time } from "./utils";
import World from "./world/World";

/** DOM layers the scene draws into, bottom to top. Owned by the React component. */
export type SceneLayers = {
  css: HTMLElement;
  webgl: HTMLElement;
  overlay: HTMLElement;
  videos: [HTMLVideoElement, HTMLVideoElement];
};

export type SceneOptions = {
  layers: SceneLayers;
  /** Page shown on the monitor */
  osUrl: string;
  osTitle: string;
};

export default class Application {
  readonly signal: AbortSignal;
  private controller = new AbortController();

  layers: SceneLayers;
  osUrl: string;
  osTitle: string;

  sizes: Sizes;
  time: Time;
  mouse = new Mouse();
  scene = new THREE.Scene();
  cssScene = new THREE.Scene();
  overlayScene = new THREE.Scene();
  resources: Resources;
  camera: Camera;
  renderer: Renderer;
  world: World;

  constructor({ layers, osUrl, osTitle }: SceneOptions) {
    this.signal = this.controller.signal;
    this.layers = layers;
    this.osUrl = osUrl;
    this.osTitle = osTitle;

    this.sizes = new Sizes(this.signal);
    this.time = new Time(this.signal);
    this.resources = new Resources(sources, this.signal);
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);
    this.camera.createControls();
    this.world = new World(this);

    this.sizes.on("resize", () => {
      this.camera.resize();
      this.renderer.resize();
    });
    this.time.on("tick", () => {
      this.camera.update();
      this.world.update();
      this.renderer.update();
    });
  }

  /** Unlocks audio; call from the click that starts the experience. */
  resumeAudio() {
    this.world.audio?.resume();
  }

  destroy() {
    this.controller.abort();
    this.sizes.off("resize");
    this.time.off("tick");
    this.camera.destroy();
    this.world.destroy();

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of materials) {
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) value.dispose();
          }
          material.dispose();
        }
      }
    });
    this.renderer.destroy();
  }
}
