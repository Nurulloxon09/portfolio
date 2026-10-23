import * as THREE from "three";
import type Application from "../Application";
import { coffeeFragment, coffeeVertex } from "../shaders";

export default class CoffeeSteam {
  private material: THREE.ShaderMaterial;

  constructor(private app: Application) {
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: coffeeVertex,
      fragmentShader: coffeeFragment,
      uniforms: {
        uTime: { value: 0 },
        uTimeFrequency: { value: 0.001 },
        uUvFrequency: { value: new THREE.Vector2(3, 5) },
        uColor: { value: new THREE.Color("#c9c9c9") },
      },
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(280, 700), this.material);
    mesh.position.set(1670, 200, 900);
    app.scene.add(mesh);
  }

  update() {
    this.material.uniforms.uTime.value = this.app.time.elapsed;
  }
}
