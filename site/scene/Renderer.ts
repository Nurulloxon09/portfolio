import * as THREE from "three";
import { CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import type Application from "./Application";
import { screenFragment, screenVertex } from "./shaders";

/**
 * Three stacked layers: the CSS3D layer (the monitor iframe) at the bottom, the
 * WebGL scene with a transparent hole where the screen is, and a full-screen
 * film-grain pass on top.
 */
export default class Renderer {
  instance: THREE.WebGLRenderer;
  cssInstance: CSS3DRenderer;
  overlayInstance: THREE.WebGLRenderer;
  private overlay: THREE.Mesh;
  private uniforms = { u_time: { value: 1 } };

  constructor(private app: Application) {
    const { sizes, layers } = app;

    this.instance = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.instance.setSize(sizes.width, sizes.height);
    this.instance.setPixelRatio(sizes.pixelRatio);
    this.instance.setClearColor(0x000000, 0.0);
    this.instance.domElement.style.position = "absolute";
    this.instance.domElement.style.top = "0px";
    layers.webgl.appendChild(this.instance.domElement);

    this.overlayInstance = new THREE.WebGLRenderer();
    this.overlayInstance.setSize(sizes.width, sizes.height);
    const overlayStyle = this.overlayInstance.domElement.style;
    overlayStyle.position = "absolute";
    overlayStyle.top = "0px";
    overlayStyle.mixBlendMode = "soft-light";
    overlayStyle.opacity = "0.12";
    overlayStyle.pointerEvents = "none";
    layers.overlay.appendChild(this.overlayInstance.domElement);

    this.cssInstance = new CSS3DRenderer();
    this.cssInstance.setSize(sizes.width, sizes.height);
    this.cssInstance.domElement.style.position = "absolute";
    this.cssInstance.domElement.style.top = "0px";
    layers.css.appendChild(this.cssInstance.domElement);

    this.overlay = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.ShaderMaterial({
        vertexShader: screenVertex,
        fragmentShader: screenFragment,
        uniforms: this.uniforms,
        depthTest: false,
        depthWrite: false,
      }),
    );
    app.overlayScene.add(this.overlay);
  }

  resize() {
    const { width, height, pixelRatio } = this.app.sizes;
    this.instance.setSize(width, height);
    this.instance.setPixelRatio(pixelRatio);
    this.cssInstance.setSize(width, height);
    this.overlayInstance.setSize(width, height);
    this.overlayInstance.setPixelRatio(pixelRatio);
  }

  update() {
    const camera = this.app.camera.instance;
    camera.updateProjectionMatrix();
    this.uniforms.u_time.value = Math.sin(this.app.time.current * 0.01);

    this.instance.render(this.app.scene, camera);
    this.cssInstance.render(this.app.cssScene, camera);
    this.overlayInstance.render(this.app.overlayScene, camera);
    this.overlay.position.copy(camera.position);
  }

  destroy() {
    this.instance.dispose();
    this.instance.forceContextLoss();
    this.overlayInstance.dispose();
    this.overlayInstance.forceContextLoss();
    this.instance.domElement.remove();
    this.overlayInstance.domElement.remove();
    this.cssInstance.domElement.remove();
  }
}
