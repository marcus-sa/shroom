import type { Container, Sprite } from 'pixi.js';

import type { IRoomPart } from "../objects/room/parts/IRoomPart";
import type { RoomLandscapeMaskSprite } from "../objects/room/RoomLandscapeMaskSprite";

export interface IRoomVisualization {
  container: Container;
  behindWallContainer: Container;
  landscapeContainer: Container;
  floorContainer: Container;
  wallContainer: Container;

  addPart(part: IRoomPart): PartNode;
  addMask(id: string, element: Sprite): MaskNode;
}

export type MaskNode = {
  sprite: Sprite;
  update: () => void;
  remove: () => void;
};

export type PartNode = {
  remove: () => void;
};

export type RoomVisualizationMeta = {
  masks: Map<string, RoomLandscapeMaskSprite>;
  wallHeight: number;
  wallHeightWithZ: number;
};
