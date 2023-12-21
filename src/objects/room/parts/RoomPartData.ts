import type { Texture, Sprite } from 'pixi.js';

export interface RoomPartData {
  wallHeight: number;
  borderWidth: number;
  tileHeight: number;
  wallLeftColor: number;
  wallRightColor: number;
  wallTopColor: number;
  wallTexture: Texture;
  tileLeftColor: number;
  tileRightColor: number;
  tileTopColor: number;
  tileTexture: Texture;
  masks: Map<string, Sprite>;
}
