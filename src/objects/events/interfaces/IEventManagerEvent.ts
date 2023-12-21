import { FederatedEvent, PixiTouch } from "pixi.js";
import { EventGroupIdentifier } from "./IEventGroup";

export interface IEventManagerEvent<N extends UIEvent | PixiTouch= any> {
  tag?: string;
  mouseEvent: FederatedEvent<MouseEvent | TouchEvent | PointerEvent>;
  interactionEvent: FederatedEvent<N>;
  stopPropagation(): void;
  skip(...identifiers: EventGroupIdentifierParam[]): void;
  skipExcept(...identifiers: EventGroupIdentifierParam[]): void;
}

export type EventGroupIdentifierParam =
  | EventGroupIdentifierParam[]
  | EventGroupIdentifier;
