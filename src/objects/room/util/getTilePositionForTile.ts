import type { Point } from 'pixi.js';

import { getTilePosition } from "./getTilePosition";

export function getTilePositionForTile(roomX: number, roomY: number) {
  return {
    top: getTilePosition(roomX, roomY),
    left: getTilePosition(roomX, roomY + 1),
    right: getTilePosition(roomX + 1, roomY),
  };
}

export interface TilePositionForTile {
  left: Point;
  right: Point;
  top: Point;
}
