import type { Texture } from 'pixi.js';

export interface ITileColorable {
  tileLeftColor: number;
  tileRightColor: number;
  tileTopColor: number;
  tileTexture: Texture;
}
