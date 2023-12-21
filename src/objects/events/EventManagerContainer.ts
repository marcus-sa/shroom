import { FederatedPointerEvent, TilingSprite, Application, Texture } from "pixi.js";
import { EventManager } from "./EventManager";

export class EventManagerContainer {
  private _box: TilingSprite | undefined;

  constructor(
    private _application: Application,
    private _eventManager: EventManager
  ) {
    this._updateRectangle();

    _application.ticker.add(this._updateRectangle);

    const interactionManager: PIXI.InteractionManager = this._application
      .renderer.plugins.interaction;

    interactionManager.addListener(
      "pointermove",
      (event: FederatedPointerEvent) => {
        const position = event.getLocalPosition(this._application.stage);

        this._eventManager.move(event, position.x, position.y);
      },
      true
    );

    interactionManager.addListener(
      "pointerup",
      (event: FederatedPointerEvent) => {
        const position = event.getLocalPosition(this._application.stage);

        this._eventManager.pointerUp(event, position.x, position.y);
      },
      true
    );

    interactionManager.addListener(
      "pointerdown",
      (event: FederatedPointerEvent) => {
        const position = event.getLocalPosition(this._application.stage);

        this._eventManager.pointerDown(event, position.x, position.y);
      },
      true
    );
  }

  destroy() {
    this._application.ticker.remove(this._updateRectangle);
  }

  private _updateRectangle = () => {
    //this._box?.destroy();

    const renderer = this._application.renderer;
    const width = renderer.width / renderer.resolution;
    const height = renderer.height / renderer.resolution;

    this._box = new TilingSprite(Texture.WHITE, width, height);
    this._box.alpha = 0.3;

    //this._application.stage.addChild(this._box);
  };
}
