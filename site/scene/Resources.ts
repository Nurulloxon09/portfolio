import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import EventEmitter from "./EventEmitter";
import { dispatch } from "./events";
import type { Source } from "./sources";

export default class Resources extends EventEmitter {
  items: {
    texture: Record<string, THREE.Texture>;
    gltfModel: Record<string, GLTF>;
    audio: Record<string, AudioBuffer>;
  } = { texture: {}, gltfModel: {}, audio: {} };

  private toLoad: number;
  private loaded = 0;

  constructor(
    private sources: Source[],
    private signal: AbortSignal,
  ) {
    super();
    this.toLoad = sources.length;
    this.startLoading();
  }

  private startLoading() {
    const gltfLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    const audioLoader = new THREE.AudioLoader();

    for (const source of this.sources) {
      if (source.type === "gltfModel") {
        gltfLoader.load(source.path, (file) => {
          this.items.gltfModel[source.name] = file;
          this.sourceLoaded(source);
        });
      } else if (source.type === "texture") {
        textureLoader.load(source.path, (file) => {
          file.colorSpace = THREE.SRGBColorSpace;
          this.items.texture[source.name] = file;
          this.sourceLoaded(source);
        });
      } else {
        audioLoader.load(source.path, (buffer) => {
          this.items.audio[source.name] = buffer;
          this.sourceLoaded(source);
        });
      }
    }
  }

  private sourceLoaded(source: Source) {
    // The scene may have been torn down while files were still downloading
    if (this.signal.aborted) return;
    this.loaded++;
    dispatch("loadedSource", {
      sourceName: source.name,
      progress: this.loaded / this.toLoad,
      loaded: this.loaded,
      toLoad: this.toLoad,
    });
    if (this.loaded === this.toLoad) this.trigger("ready");
  }
}
