import { Texture } from 'pixi.js';

export interface IConfiguration {
  placeholder?: Texture;
  tileColor?: { floorColor?: string; leftFade?: number; rightFade?: number };
  avatarMovementDuration?: number;
  furnitureMovementDuration?: number;
}
