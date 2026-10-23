export type Source =
  | { name: string; type: "texture"; path: string }
  | { name: string; type: "gltfModel"; path: string }
  | { name: string; type: "audio"; path: string };

const base = "/scene";

const sources: Source[] = [
  { name: "computerSetupModel", type: "gltfModel", path: `${base}/models/computer_setup.glb` },
  { name: "computerSetupTexture", type: "texture", path: `${base}/models/baked_computer.jpg` },
  { name: "environmentModel", type: "gltfModel", path: `${base}/models/environment.glb` },
  { name: "environmentTexture", type: "texture", path: `${base}/models/baked_environment.jpg` },
  { name: "decorModel", type: "gltfModel", path: `${base}/models/decor.glb` },
  { name: "decorTexture", type: "texture", path: `${base}/models/baked_decor.jpg` },
  { name: "monitorSmudgeTexture", type: "texture", path: `${base}/textures/smudges.jpg` },
  { name: "monitorShadowTexture", type: "texture", path: `${base}/textures/shadow-compressed.png` },
  { name: "mouseDown", type: "audio", path: `${base}/audio/mouse_down.mp3` },
  { name: "mouseUp", type: "audio", path: `${base}/audio/mouse_up.mp3` },
  { name: "keyboardKeydown1", type: "audio", path: `${base}/audio/key_1.mp3` },
  { name: "keyboardKeydown2", type: "audio", path: `${base}/audio/key_2.mp3` },
  { name: "keyboardKeydown3", type: "audio", path: `${base}/audio/key_3.mp3` },
  { name: "keyboardKeydown4", type: "audio", path: `${base}/audio/key_4.mp3` },
  { name: "keyboardKeydown5", type: "audio", path: `${base}/audio/key_5.mp3` },
  { name: "keyboardKeydown6", type: "audio", path: `${base}/audio/key_6.mp3` },
  { name: "ccType", type: "audio", path: `${base}/audio/type.mp3` },
];

export default sources;
