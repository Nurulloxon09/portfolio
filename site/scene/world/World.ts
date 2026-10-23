import type Application from "../Application";
import AudioManager from "../audio/AudioManager";
import bakedModel from "./BakedModel";
import CoffeeSteam from "./CoffeeSteam";
import MonitorScreen from "./MonitorScreen";

export default class World {
  monitorScreen?: MonitorScreen;
  coffeeSteam?: CoffeeSteam;
  audio?: AudioManager;

  constructor(private app: Application) {
    app.resources.on("ready", () => {
      if (app.signal.aborted) return;
      const { gltfModel, texture } = app.resources.items;
      app.scene.add(bakedModel(gltfModel.environmentModel, texture.environmentTexture, 900));
      app.scene.add(bakedModel(gltfModel.decorModel, texture.decorTexture, 900));
      app.scene.add(bakedModel(gltfModel.computerSetupModel, texture.computerSetupTexture, 900));
      this.audio = new AudioManager(app);
      this.monitorScreen = new MonitorScreen(app);
      this.coffeeSteam = new CoffeeSteam(app);
    });
  }

  update() {
    this.monitorScreen?.update();
    this.coffeeSteam?.update();
    this.audio?.update();
  }

  destroy() {
    this.audio?.destroy();
  }
}
