import { Assets, Texture } from 'pixi.js';
import { applyTextureProperties } from "./applyTextureProperties";

export async function loadRoomTexture(url: string): Promise<Texture> {
  const texture = await Assets.load(url);
  applyTextureProperties(texture);
  return texture;
}
