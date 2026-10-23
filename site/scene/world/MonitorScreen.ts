import * as THREE from "three";
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import type Application from "../Application";

const SCREEN_SIZE = { w: 1280, h: 1024 };
const IFRAME_PADDING = 32;

// Messages the desktop inside the iframe sends up (see components/os/ParentBridge.tsx)
export type BridgeMessage =
  | { type: "mousemove"; clientX: number; clientY: number }
  | { type: "mousedown" | "mouseup" }
  | { type: "keydown" | "keyup"; key: string };

const BRIDGED_TYPES = new Set(["mousemove", "mousedown", "mouseup", "keydown", "keyup"]);

/**
 * The computer screen: the desktop page in an iframe, placed in 3D with the
 * CSS3D renderer, plus glass layers (smudges, inner shadow, static) in WebGL.
 */
export default class MonitorScreen {
  private position = new THREE.Vector3(0, 950, 255);
  private rotation = new THREE.Euler(-3 * THREE.MathUtils.DEG2RAD, 0, 0);
  private dimmingPlane?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

  private inComputer = false;
  private prevInComputer = false;
  private mouseClickInProgress = false;
  private shouldLeaveMonitor = false;

  constructor(private app: Application) {
    this.listenToPointer();
    const iframe = this.createIframe();
    this.listenToIframe(iframe);
    const maxOffset = this.createTextureLayers();
    this.createEnclosingPlanes(maxOffset);
    this.createPerspectiveDimmer(maxOffset);
  }

  /** Zooms in when the pointer is over the screen and back out when it leaves. */
  private onPointerMove(event: { clientX: number; clientY: number }, inComputer: boolean) {
    this.inComputer = inComputer;

    if (this.inComputer && !this.prevInComputer) this.app.camera.enterMonitor();
    if (!this.inComputer && this.prevInComputer && !this.mouseClickInProgress) this.app.camera.leaveMonitor();

    // A drag that started on the screen only leaves once the button is released
    this.shouldLeaveMonitor = !this.inComputer && this.mouseClickInProgress && this.prevInComputer;

    this.app.mouse.move(event as MouseEvent, inComputer);
    this.prevInComputer = this.inComputer;
  }

  private onPointerDown(inComputer: boolean) {
    this.inComputer = inComputer;
    this.mouseClickInProgress = true;
    this.prevInComputer = this.inComputer;
    if (inComputer) this.app.world.audio?.computer.mouseDown();
  }

  private onPointerUp(inComputer: boolean) {
    this.inComputer = inComputer;
    if (this.shouldLeaveMonitor) {
      this.app.camera.leaveMonitor();
      this.shouldLeaveMonitor = false;
    }
    this.mouseClickInProgress = false;
    this.prevInComputer = this.inComputer;
    if (inComputer) this.app.world.audio?.computer.mouseUp();
  }

  private listenToPointer() {
    const { signal } = this.app;
    // The iframe's own padding belongs to this document, so the pointer can be "in
    // the computer" without the iframe reporting it.
    const overScreen = (event: Event) => (event.target as Element | null)?.id === "computer-screen";
    document.addEventListener("mousemove", (event) => this.onPointerMove(event, overScreen(event)), { signal });
    document.addEventListener("mousedown", (event) => this.onPointerDown(overScreen(event)), { signal });
    document.addEventListener("mouseup", (event) => this.onPointerUp(overScreen(event)), { signal });
  }

  /** Pointer and key events from inside the desktop, relayed by postMessage. */
  private listenToIframe(iframe: HTMLIFrameElement) {
    window.addEventListener(
      "message",
      (event: MessageEvent<BridgeMessage>) => {
        if (event.source !== iframe.contentWindow || event.origin !== window.location.origin) return;
        const data = event.data;
        if (!data || typeof data !== "object" || !BRIDGED_TYPES.has(data.type)) return;

        if (data.type === "mousemove") {
          // Map from the iframe's own coordinates to this page's
          const rect = iframe.getBoundingClientRect();
          const scaleX = rect.width / SCREEN_SIZE.w;
          const scaleY = rect.height / SCREEN_SIZE.h;
          this.onPointerMove(
            {
              clientX: Math.round(rect.left + (IFRAME_PADDING + Number(data.clientX)) * scaleX),
              clientY: Math.round(rect.top + (IFRAME_PADDING + Number(data.clientY)) * scaleY),
            },
            true,
          );
        } else if (data.type === "mousedown") {
          this.onPointerDown(true);
        } else if (data.type === "mouseup") {
          this.onPointerUp(true);
        } else if (data.type === "keydown") {
          this.app.world.audio?.computer.keyDown(String(data.key));
        } else {
          this.app.world.audio?.computer.keyUp();
        }
      },
      { signal: this.app.signal },
    );
  }

  private createIframe() {
    const container = document.createElement("div");
    container.style.width = `${SCREEN_SIZE.w}px`;
    container.style.height = `${SCREEN_SIZE.h}px`;
    container.style.background = "#1d2e2f";

    const iframe = document.createElement("iframe");
    iframe.src = this.app.osUrl;
    iframe.style.width = `${SCREEN_SIZE.w}px`;
    iframe.style.height = `${SCREEN_SIZE.h}px`;
    iframe.style.padding = `${IFRAME_PADDING}px`;
    iframe.style.boxSizing = "border-box";
    iframe.style.border = "0";
    iframe.className = "jitter";
    iframe.id = "computer-screen";
    iframe.title = this.app.osTitle;
    container.appendChild(iframe);

    this.createCssPlane(container);
    return iframe;
  }

  /** The iframe in the CSS3D scene, and an invisible GL plane that cuts a hole for it. */
  private createCssPlane(element: HTMLElement) {
    const object = new CSS3DObject(element);
    object.position.copy(this.position);
    object.rotation.copy(this.rotation);
    this.app.cssScene.add(object);

    // NoBlending writes alpha 0 into the canvas, so the CSS layer below shows through
    // wherever this plane isn't hidden behind other geometry.
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
      opacity: 0,
      transparent: true,
      blending: THREE.NoBlending,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_SIZE.w, SCREEN_SIZE.h), material);
    mesh.position.copy(object.position);
    mesh.rotation.copy(object.rotation);
    mesh.scale.copy(object.scale);
    this.app.scene.add(mesh);
  }

  /** Glass layers in front of the screen. Returns how far the furthest one sits. */
  private createTextureLayers() {
    const textures = this.app.resources.items.texture;
    const video = (element: HTMLVideoElement) => {
      const texture = new THREE.VideoTexture(element);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const scaleFactor = 4;
    const layers = [
      { texture: textures.monitorSmudgeTexture, blending: THREE.AdditiveBlending, opacity: 0.12, offset: 24 },
      { texture: textures.monitorShadowTexture, blending: THREE.NormalBlending, opacity: 1, offset: 5 },
      { texture: video(this.app.layers.videos[0]), blending: THREE.AdditiveBlending, opacity: 0.5, offset: 10 },
      { texture: video(this.app.layers.videos[1]), blending: THREE.AdditiveBlending, opacity: 0.1, offset: 15 },
    ];

    let maxOffset = -1;
    for (const layer of layers) {
      const offset = layer.offset * scaleFactor;
      this.addTextureLayer(layer.texture, layer.blending, layer.opacity, offset);
      maxOffset = Math.max(maxOffset, offset);
    }
    return maxOffset;
  }

  private addTextureLayer(texture: THREE.Texture, blending: THREE.Blending, opacity: number, offset: number) {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      blending,
      side: THREE.DoubleSide,
      opacity,
      transparent: true,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_SIZE.w, SCREEN_SIZE.h), material);
    mesh.position.copy(this.position).add(new THREE.Vector3(0, 0, offset));
    mesh.rotation.copy(this.rotation);
    this.app.scene.add(mesh);
  }

  /** Walls around the glass layers so they read as the depth of the tube. */
  private createEnclosingPlanes(maxOffset: number) {
    const { w, h } = SCREEN_SIZE;
    const rotY = new THREE.Euler(0, 90 * THREE.MathUtils.DEG2RAD, 0);
    const rotX = new THREE.Euler(90 * THREE.MathUtils.DEG2RAD, 0, 0);
    const planes = [
      { size: [maxOffset, h], offset: [-w / 2, 0, maxOffset / 2], rotation: rotY },
      { size: [maxOffset, h], offset: [w / 2, 0, maxOffset / 2], rotation: rotY },
      { size: [w, maxOffset], offset: [0, h / 2, maxOffset / 2], rotation: rotX },
      { size: [w, maxOffset], offset: [0, -h / 2, maxOffset / 2], rotation: rotX },
    ] as const;

    for (const plane of planes) {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(plane.size[0], plane.size[1]),
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 0x48493f }),
      );
      mesh.position.copy(this.position).add(new THREE.Vector3(...plane.offset));
      mesh.rotation.copy(plane.rotation);
      this.app.scene.add(mesh);
    }
  }

  /** Darkens the screen when it's seen from far away or at an angle. */
  private createPerspectiveDimmer(maxOffset: number) {
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: 0x000000,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_SIZE.w, SCREEN_SIZE.h), material);
    mesh.position.copy(this.position).add(new THREE.Vector3(0, 0, maxOffset - 5));
    mesh.rotation.copy(this.rotation);
    this.dimmingPlane = mesh;
    this.app.scene.add(mesh);
  }

  update() {
    if (!this.dimmingPlane) return;
    const camPos = this.app.camera.instance.position;
    const viewVector = camPos.clone().sub(this.position).normalize();
    const dot = viewVector.dot(new THREE.Vector3(0, 0, 1));
    const distance = camPos.distanceTo(this.dimmingPlane.position);
    const opacity = 1 / (distance / 10000);
    const DIM_FACTOR = 0.7;
    this.dimmingPlane.material.opacity = (1 - opacity) * DIM_FACTOR + (1 - dot) * DIM_FACTOR;
  }
}
