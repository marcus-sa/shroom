import { Texture } from "pixi.js";

export function applyTextureProperties(texture: Texture) {
  texture.baseTexture.scaleMode = 'nearest';
}
