import * as THREE from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

/** A glTF model whose lighting is baked into one texture, so it needs no lights. */
export default function bakedModel(model: GLTF, texture: THREE.Texture, scale: number): THREE.Group {
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshBasicMaterial({ map: texture });

  model.scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.scale.set(scale, scale, scale);
      child.material = material;
    }
  });

  return model.scene;
}
