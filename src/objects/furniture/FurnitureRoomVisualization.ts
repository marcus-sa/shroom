import { Container } from 'pixi.js';

import { MaskNode } from "../../interfaces/IRoomVisualization";
import { IFurnitureRoomVisualization } from "./BaseFurniture";

export class FurnitureRoomVisualization implements IFurnitureRoomVisualization {
  constructor(private _container: Container) {}

  public get container() {
    return this._container;
  }

  static fromContainer(container: Container) {
    return new FurnitureRoomVisualization(container);
  }

  addMask(): MaskNode {
    return {
      remove: () => {
        // Do nothing
      },
      update: () => {
        // Do nothing
      },
      sprite: null as any,
    };
  }
}
