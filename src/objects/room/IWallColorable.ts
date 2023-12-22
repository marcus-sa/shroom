import type { Texture } from 'pixi.js';

export interface IWallColorable {
  wallLeftColor: number;
  wallRightColor: number;
  wallTopColor: number;
  wallTexture: Texture;
}
