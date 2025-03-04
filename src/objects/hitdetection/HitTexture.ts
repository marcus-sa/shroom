import * as PIXI from "pixi.js";
import { applyTextureProperties } from "../../util/applyTextureProperties";
import { loadImageFromBlob } from "../../util/loadImageFromBlob";
import { Assets } from 'pixi.js';

export class HitTexture {
  private _texture: PIXI.Texture;
  private _cachedHitmap: Uint32Array | undefined;

  public get texture() {
    return this._texture;
  }

  constructor(texture: PIXI.Texture) {
    this._texture = texture;
    applyTextureProperties(this._texture);
  }

  static async fromSpriteSheet(spritesheet: PIXI.Spritesheet, name: string) {
    const texture = spritesheet.textures[name];
    return new HitTexture(texture);
  }

  static async fromBlob(blob: Blob) {
    const url = await loadImageFromBlob(blob);
    return HitTexture.fromUrl(url);
  }

  static async fromUrl(imageUrl: string) {
    const texture = await Assets.load<PIXI.Texture>(imageUrl);
    return new HitTexture(texture);
  }

  public getHitMap() {
    return this._getHitMap();
  }

  hits(
    x: number,
    y: number,
    transform: { x: number; y: number },
    options: { mirrorHorizontally?: boolean } = { mirrorHorizontally: false }
  ) {
    if (options.mirrorHorizontally) {
      x = -(x - transform.x);
    } else {
      x = x - transform.x;
    }
    y = y - transform.y;

    const baseTexture = this._texture.baseTexture;
    const hitmap = this._getHitMap();

    const dx = Math.round(this._texture.frame.x + x * baseTexture.resolution);
    const dy = Math.round(this._texture.frame.y + y * baseTexture.resolution);
    const ind = dx + dy * baseTexture.width;
    const ind1 = ind % 32;
    const ind2 = (ind / 32) | 0;
    return (hitmap[ind2] & (1 << ind1)) !== 0;
  }

  private _getHitMap() {
    if (this._cachedHitmap == null) {
      this._cachedHitmap = generateHitMap(
        (this._texture.baseTexture.resource as any).source
      );
    }

    return this._cachedHitmap ?? new Uint8ClampedArray();
  }
}

function generateHitMap(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");

  if (context == null) throw new Error("Invalid context 2d");

  const threshold = 25;

  const w = canvas.width;
  const h = canvas.height;
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, w, h);

  const hitmap = new Uint32Array(Math.ceil((w * h) / 32));
  for (let i = 0; i < w * h; i++) {
    const ind1 = i % 32;
    const ind2 = (i / 32) | 0;
    if (imageData.data[i * 4 + 3] >= threshold) {
      hitmap[ind2] = hitmap[ind2] | (1 << ind1);
    }
  }

  return hitmap;
}
