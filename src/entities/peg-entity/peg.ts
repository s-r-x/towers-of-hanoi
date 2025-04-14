import type { tRendererLayer } from "@/interfaces/renderer";
import { PEG_WIDTH } from "@/config/entities";
import { Graphics, Container } from "pixi.js";
import { PEG_COLOR } from "@/config/styling";

const CORNER_RADIUS = 25;
const PEG_TIP_HEIGHT = 10;
const PEG_FREE_SPACE = 20;

export class PegEntity {
  private _yOffset = 0;
  private yStart = 0;
  private pixiPeg = new Graphics();
  private pixiContainer = new Container();
  constructor(public id: number) {}
  public get yOffset() {
    return this._yOffset;
  }
  public set yOffset(value: number) {
    this._yOffset = value;
    this.pixiContainer.y = this.normalizeY(value);
  }
  public get collisionRect() {
    return this.pixiContainer.getBounds();
  }
  public get x() {
    return this.pixiContainer.x;
  }
  public get y() {
    return this.pixiContainer.y;
  }
  public get centerX() {
    return this.x + PEG_WIDTH / 2;
  }
  public move({ x, y }: { x: number; y: number }) {
    this.pixiContainer.x = this.normalizeX(x);
    this.pixiContainer.y = this.normalizeY(y);
  }
  public draw({
    layer,
    x,
    y,
    yOffset,
    height,
  }: {
    layer: tRendererLayer;
    x: number;
    y: number;
    yOffset: number;
    height: number;
  }) {
    this.yStart = y;
    const { pixiContainer } = this;
    height += PEG_FREE_SPACE + PEG_TIP_HEIGHT;
    this.pixiPeg
      .roundRect(0, 0, PEG_WIDTH, height, CORNER_RADIUS)
      .fill(PEG_COLOR);
    pixiContainer.addChild(this.pixiPeg);
    pixiContainer.x = this.normalizeX(x);
    pixiContainer.y = this.normalizeY(yOffset);
    layer.addChild(pixiContainer);
  }
  public destroy() {
    this.pixiContainer.destroy({ children: true });
  }
  private get height() {
    return this.pixiContainer.height;
  }
  private normalizeX(x: number) {
    return x - PEG_WIDTH / 2;
  }
  private normalizeY(offset: number) {
    return this.yStart - this.height + PEG_TIP_HEIGHT + offset;
  }
}
