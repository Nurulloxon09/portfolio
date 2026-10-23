import * as THREE from "three";
import type Application from "./Application";

export enum CameraKey {
  IDLE = "idle",
  MONITOR = "monitor",
  LOADING = "loading",
  DESK = "desk",
  ORBIT_CONTROLS_START = "orbitControlsStart",
}

type CameraKeyframe = { position: THREE.Vector3; focalPoint: THREE.Vector3 };

const keys: Record<CameraKey, CameraKeyframe> = {
  idle: {
    position: new THREE.Vector3(-20000, 12000, 20000),
    focalPoint: new THREE.Vector3(0, -1000, 0),
  },
  monitor: {
    position: new THREE.Vector3(0, 950, 2000),
    focalPoint: new THREE.Vector3(0, 950, 0),
  },
  desk: {
    position: new THREE.Vector3(0, 1800, 5500),
    focalPoint: new THREE.Vector3(0, 500, 0),
  },
  loading: {
    position: new THREE.Vector3(-35000, 35000, 35000),
    focalPoint: new THREE.Vector3(0, -5000, 0),
  },
  orbitControlsStart: {
    position: new THREE.Vector3(-15000, 10000, 15000),
    focalPoint: new THREE.Vector3(-100, 350, 0),
  },
};

export class CameraKeyframeInstance {
  position: THREE.Vector3;
  focalPoint: THREE.Vector3;

  constructor(keyframe: CameraKeyframe) {
    this.position = keyframe.position.clone();
    this.focalPoint = keyframe.focalPoint.clone();
  }

  update() {}
}

/** Close-up on the screen; backs off a little on tall windows so the whole screen fits. */
export class MonitorKeyframe extends CameraKeyframeInstance {
  private origin: THREE.Vector3;

  constructor(private app: Application) {
    super(keys.monitor);
    this.origin = keys.monitor.position.clone();
  }

  update() {
    const { width, height } = this.app.sizes;
    const additionalZoom = width < 768 ? 0 : 600;
    this.position.z = this.origin.z + (height / width) * 1200 - additionalZoom;
  }
}

/** In front of the desk; drifts towards the mouse. */
export class DeskKeyframe extends CameraKeyframeInstance {
  private origin: THREE.Vector3;
  private targetFoc: THREE.Vector3;
  private targetPos: THREE.Vector3;

  constructor(private app: Application) {
    super(keys.desk);
    this.origin = keys.desk.position.clone();
    this.targetFoc = keys.desk.focalPoint.clone();
    this.targetPos = keys.desk.position.clone();
  }

  update() {
    const { mouse, sizes } = this.app;
    this.targetFoc.x += (mouse.x - sizes.width / 2 - this.targetFoc.x) * 0.05;
    this.targetFoc.y += (-(mouse.y - sizes.height) - this.targetFoc.y) * 0.05;

    this.targetPos.x += (mouse.x - sizes.width / 2 - this.targetPos.x) * 0.025;
    this.targetPos.y += (-(mouse.y - sizes.height * 2) - this.targetPos.y) * 0.025;
    this.targetPos.z = this.origin.z + (sizes.height / sizes.width) * 3000 - 1800;

    this.focalPoint.copy(this.targetFoc);
    this.position.copy(this.targetPos);
  }
}

/** Slow orbit around the room while nobody is at the desk. */
export class IdleKeyframe extends CameraKeyframeInstance {
  private origin: THREE.Vector3;

  constructor(private app: Application) {
    super(keys.idle);
    this.origin = keys.idle.position.clone();
  }

  update() {
    const elapsed = this.app.time.elapsed;
    this.position.x = Math.sin((elapsed + 19000) * 0.00008) * this.origin.x;
    this.position.y = Math.sin((elapsed + 1000) * 0.000004) * 4000 + this.origin.y - 3000;
  }
}

export function createKeyframes(app: Application): Record<CameraKey, CameraKeyframeInstance> {
  return {
    idle: new IdleKeyframe(app),
    monitor: new MonitorKeyframe(app),
    loading: new CameraKeyframeInstance(keys.loading),
    desk: new DeskKeyframe(app),
    orbitControlsStart: new CameraKeyframeInstance(keys.orbitControlsStart),
  };
}
