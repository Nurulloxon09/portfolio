import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Easing, Group, Tween } from "@tweenjs/tween.js";
import BezierEasing from "bezier-easing";
import type Application from "./Application";
import { CameraKey, createKeyframes, type CameraKeyframeInstance } from "./CameraKeyframes";
import { dispatch, on } from "./events";

export default class Camera {
  instance: THREE.PerspectiveCamera;
  position = new THREE.Vector3(0, 0, 0);
  focalPoint = new THREE.Vector3(0, 0, 0);

  freeCam = false;
  orbitControls?: OrbitControls;

  currentKeyframe: CameraKey | undefined;
  targetKeyframe: CameraKey | undefined;
  keyframes: Record<CameraKey, CameraKeyframeInstance>;

  private tweens = new Group();

  constructor(private app: Application) {
    const { signal } = app;
    this.keyframes = createKeyframes(app);

    // A click outside the monitor toggles between the idle orbit and the desk
    document.addEventListener(
      "mousedown",
      (event) => {
        event.preventDefault();
        if ((event.target as Element | null)?.closest?.("[data-prevent-click]")) return;
        if (this.currentKeyframe === CameraKey.IDLE || this.targetKeyframe === CameraKey.IDLE) {
          this.transition(CameraKey.DESK);
        } else if (this.currentKeyframe === CameraKey.DESK || this.targetKeyframe === CameraKey.DESK) {
          this.transition(CameraKey.IDLE);
        }
      },
      { signal },
    );

    on("loadingScreenDone", () => this.transition(CameraKey.IDLE, 2500, Easing.Exponential.Out), signal);

    on(
      "freeCamToggle",
      (toggle) => {
        if (toggle) {
          this.transition(CameraKey.ORBIT_CONTROLS_START, 750, BezierEasing(0.13, 0.99, 0, 1), () => {
            this.instance.position.copy(this.keyframes.orbitControlsStart.position);
            this.orbitControls?.update();
            this.freeCam = true;
          });
          app.layers.webgl.style.pointerEvents = "auto";
        } else {
          this.freeCam = false;
          this.transition(CameraKey.IDLE, 4000, Easing.Exponential.Out);
          app.layers.webgl.style.pointerEvents = "none";
        }
      },
      signal,
    );

    this.instance = new THREE.PerspectiveCamera(35, app.sizes.width / app.sizes.height, 10, 900000);
    this.currentKeyframe = CameraKey.LOADING;
    app.scene.add(this.instance);
  }

  enterMonitor() {
    this.transition(CameraKey.MONITOR, 2000, BezierEasing(0.13, 0.99, 0, 1));
    dispatch("enterMonitor");
  }

  leaveMonitor() {
    this.transition(CameraKey.DESK);
    dispatch("leftMonitor");
  }

  transition(key: CameraKey, duration = 1000, easing?: (amount: number) => number, callback?: () => void) {
    if (this.currentKeyframe === key) return;
    if (this.targetKeyframe) this.tweens.removeAll();

    this.currentKeyframe = undefined;
    this.targetKeyframe = key;

    const keyframe = this.keyframes[key];
    const ease = easing ?? Easing.Quintic.InOut;

    const posTween = new Tween(this.position)
      .to(keyframe.position, duration)
      .easing(ease)
      .onComplete(() => {
        this.currentKeyframe = key;
        this.targetKeyframe = undefined;
        callback?.();
      });
    const focTween = new Tween(this.focalPoint).to(keyframe.focalPoint, duration).easing(ease);

    this.tweens.add(posTween, focTween);
    posTween.start();
    focTween.start();
  }

  createControls() {
    const controls = new OrbitControls(this.instance, this.app.renderer.instance.domElement);
    controls.target.copy(this.keyframes.orbitControlsStart.focalPoint);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.object.position.copy(this.keyframes.orbitControlsStart.position);
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 4000;
    controls.maxDistance = 29000;
    controls.update();
    this.orbitControls = controls;
  }

  resize() {
    this.instance.aspect = this.app.sizes.width / this.app.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.tweens.update();

    if (this.freeCam && this.orbitControls) {
      this.position.copy(this.orbitControls.object.position);
      this.focalPoint.copy(this.orbitControls.target);
      this.orbitControls.update();
      return;
    }

    for (const keyframe of Object.values(this.keyframes)) keyframe.update();

    if (this.currentKeyframe) {
      const keyframe = this.keyframes[this.currentKeyframe];
      this.position.copy(keyframe.position);
      this.focalPoint.copy(keyframe.focalPoint);
    }

    this.instance.position.copy(this.position);
    this.instance.lookAt(this.focalPoint);
  }

  destroy() {
    this.tweens.removeAll();
    this.orbitControls?.dispose();
  }
}
