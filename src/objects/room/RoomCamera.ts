import { Container, Rectangle, Point, FederatedPointerEvent } from "pixi.js";
import { Easing, Tween, update } from '@tweenjs/tween.js';

import { Room } from "./Room";
import { getParentGlobalPosition } from '../../util/getParentGlobalPosition';

export class RoomCamera extends Container {
  private _state: RoomCameraState = { type: "WAITING" };

  private _offsets: { x: number; y: number } = { x: 0, y: 0 };
  private _animatedOffsets: { x: number; y: number } = { x: 0, y: 0 };

  private _container: Container;
  private _parentContainer: Container;

  private _tween: any;
  private _target: EventTarget;

  constructor(
    private readonly _room: Room,
    private readonly _parentBounds: () => Rectangle,
    private readonly _options?: RoomCameraOptions
  ) {
    super();

    const target = this._options?.target ?? window;
    this._target = target;

    this._parentContainer = new Container();
    this._parentContainer.hitArea = this._parentBounds();
    this._parentContainer.interactive = true;

    this._container = new Container();
    this._container.addChild(this._room);
    this._parentContainer.addChild(this._container);

    this.addChild(this._parentContainer);

    // Activation of the camera is only triggered by a down event on the parent container.
    this._parentContainer.addListener("pointerdown", this._handlePointerDown);
    this._target.addEventListener(
      "pointermove",
      this._handlePointerMove as any
    );
    this._target.addEventListener("pointerup", this._handlePointerUp as any);

    let last: number | undefined;
    this._room.application.ticker.add(() => {
      if (last == null) last = performance.now();
      const value = performance.now() - last;

      update(value);
    });
  }

  static forScreen(room: Room, options?: RoomCameraOptions) {
    return new RoomCamera(room, () => room.application.screen, options);
  }

  destroy() {
    this._parentContainer.removeListener(
      "pointerdown",
      this._handlePointerDown
    );
    this._target.removeEventListener(
      "pointermove",
      this._handlePointerMove as any
    );
    this._target.removeEventListener("pointerup", this._handlePointerUp as any);
  }

  private _handlePointerUp = (event: FederatedPointerEvent) => {
    if (this._state.type === "WAITING" || this._state.type === "ANIMATE_ZERO")
      return;

    if (this._state.pointerId !== event.pointerId) return;

    let animatingBack = false;

    if (this._state.type === "DRAGGING") {
      animatingBack = this._stopDragging(this._state);
    }

    if (!animatingBack) {
      this._resetDrag();
    }
  };

  private _handlePointerDown = (event: FederatedPointerEvent) => {
    const position = event.getLocalPosition(this.parent);
    if (this._state.type === "WAITING") {
      this._enterWaitingForDistance(position, event.pointerId);
    } else if (this._state.type === "ANIMATE_ZERO") {
      this._changingDragWhileAnimating(position, event.pointerId);
    }
  };

  private _handlePointerMove = (event: FederatedPointerEvent) => {
    const box = this._room.application.canvas.getBoundingClientRect!();
    const position = new Point(
      event.clientX - box.x - this.parent.worldTransform.tx,
      event.clientY - box.y - this.parent.worldTransform.tx
    );

    switch (this._state.type) {
      case "WAIT_FOR_DISTANCE": {
        this._tryUpgradeWaitForDistance(this._state, position, event.pointerId);
        break;
      }

      case "DRAGGING": {
        this._updateDragging(this._state, position, event.pointerId);
        break;
      }
    }
  };

  private _updatePosition() {
    switch (this._state.type) {
      case "DRAGGING": {
        // When dragging, the current position consists of the current offset of the camera
        // and the drag difference.

        const diffX = this._state.currentX - this._state.startX;
        const diffY = this._state.currentY - this._state.startY;

        this._container.x = this._offsets.x + diffX;
        this._container.y = this._offsets.y + diffY;
        break;
      }

      case "ANIMATE_ZERO": {
        // When animating back to the zero point, we use the animatedOffsets of the camera.

        this._container.x = this._animatedOffsets.x;
        this._container.y = this._animatedOffsets.y;
        break;
      }

      default: {
        // Default behavior: Use the set offsets of the camera.

        this._container.x = this._offsets.x;
        this._container.y = this._offsets.y;
      }
    }
  }

  private _isOutOfBounds(offsets: { x: number; y: number }) {
    const roomX = this.parent.position.x + this._room.x;
    const roomY = this.parent.position.y + this._room.y;

    // const parentPosition = getParentGlobalPosition(this);
    // const roomX = parentPosition.x + this._room.x;
    // const roomY = parentPosition.y + this._room.y;

    if (roomX + this._room.roomWidth + offsets.x <= 0) {
      // The room is out of bounds to the left side.
      return true;
    }

    if (roomX + offsets.x >= this._parentBounds().width) {
      // The room is out of bounds to the right side.
      return true;
    }

    if (roomY + this._room.roomHeight + offsets.y <= 0) {
      // The room is out of bounds to the top side.
      return true;
    }

    if (roomY + offsets.y >= this._parentBounds().height) {
      // The room is out of bounds to the botoom side.
      return true;
    }

    return false;
  }

  private _returnToZero(
    state: CameraDraggingState,
    current: { x: number; y: number }
  ) {
    this._state = {
      ...state,
      type: "ANIMATE_ZERO",
    };
    const duration = this._options?.duration ?? 500;

    this._animatedOffsets = current;
    this._offsets = { x: 0, y: 0 };

    const newPos = { ...this._animatedOffsets };

    const tween = new Tween(newPos)
      .to({ x: 0, y: 0 }, duration)
      .easing(Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      // @ts-expect-error types mismatch
      .onUpdate((value: number) => {
        this._animatedOffsets = newPos;

        if (value >= 1) {
          this._state = { type: "WAITING" };
        }

        this._updatePosition();
      })
      .start();

    this._tween = tween;

    this._updatePosition();
  }

  private _stopDragging(state: CameraDraggingState) {
    const diffX = state.currentX - state.startX;
    const diffY = state.currentY - state.startY;

    const currentOffsets = {
      x: this._offsets.x + diffX,
      y: this._offsets.y + diffY,
    };

    if (
      this._isOutOfBounds(currentOffsets) ||
      (state.skipBoundsCheck != null && state.skipBoundsCheck)
    ) {
      this._returnToZero(state, currentOffsets);
      return true;
    } else {
      this._offsets = currentOffsets;
    }

    return false;
  }

  private _resetDrag() {
    this._state = { type: "WAITING" };
    this._updatePosition();
  }

  private _changingDragWhileAnimating(position: Point, pointerId: number) {
    this._offsets = this._animatedOffsets;
    this._animatedOffsets = { x: 0, y: 0 };
    this._tween.stop();

    this._state = {
      currentX: position.x,
      currentY: position.y,
      startX: position.x,
      startY: position.y,
      pointerId: pointerId,
      type: "DRAGGING",
      skipBoundsCheck: true,
    };

    this._updatePosition();
  }

  private _enterWaitingForDistance(position: Point, pointerId: number) {
    this._state = {
      type: "WAIT_FOR_DISTANCE",
      pointerId: pointerId,
      startX: position.x,
      startY: position.y,
    };
  }

  private _tryUpgradeWaitForDistance(
    state: CameraWaitForDistanceState,
    position: Point,
    pointerId: number
  ) {
    if (state.pointerId !== pointerId) return;

    const distance = Math.sqrt(
      (position.x - state.startX) ** 2 + (position.y - state.startY) ** 2
    );

    // When the distance of the pointer travelled more than 10px, start dragging.
    if (distance >= 10) {
      this._state = {
        currentX: position.x,
        currentY: position.y,
        startX: position.x,
        startY: position.y,
        pointerId: pointerId,
        type: "DRAGGING",
      };
      this._updatePosition();
    }
  }

  private _updateDragging(
    state: CameraDraggingState,
    position: Point,
    pointerId: number
  ) {
    if (state.pointerId !== pointerId) return;

    this._state = {
      ...state,
      currentX: position.x,
      currentY: position.y,
    };

    this._updatePosition();
  }
}

type CameraDraggingState = {
  type: "DRAGGING";
  currentX: number;
  currentY: number;
  pointerId: number;
  startX: number;
  startY: number;
  skipBoundsCheck?: boolean;
};

type CameraAnimateZeroState = {
  type: "ANIMATE_ZERO";
  currentX: number;
  currentY: number;
  startX: number;
  startY: number;
};

type CameraWaitForDistanceState = {
  type: "WAIT_FOR_DISTANCE";
  startX: number;
  startY: number;
  pointerId: number;
};

type RoomCameraState =
  | { type: "WAITING" }
  | CameraWaitForDistanceState
  | CameraDraggingState
  | CameraAnimateZeroState;

type RoomCameraOptions = { duration?: number; target?: EventTarget };
