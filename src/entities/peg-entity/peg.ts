import type { tRendererLayer } from "@/interfaces/renderer";
import { PEG_WIDTH } from "@/config/entities";
import { Graphics, Container } from "pixi.js";
import { animate } from "@/lib/animation";
import { PEG_COLOR } from "@/config/styling";

const RADIUS = 25;
export class PegEntity {
  private pixiPeg = new Graphics();
  private pixiContainer = new Container();
  private pixiMask = new Graphics();
  constructor(public id: number) {}
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
    this.pixiContainer.y = this.normalizeY(y, this.height);
    // TODO
    // this.pixiPeg.x = this.normalizeX(x - this.x);
    // this.pixiPeg.y = this.normalizeY(y - this.y, this.height);
  }
  public draw({
    layer,
    x,
    y,
    height,
    animate: shouldAnimate,
  }: {
    layer: tRendererLayer;
    x: number;
    y: number;
    height: number;
    animate?: boolean;
  }) {
    const { pixiContainer, pixiMask } = this;
    if (shouldAnimate) {
      pixiMask.rect(-PEG_WIDTH, 0, PEG_WIDTH, height).fill(0xffffff);
    }
    this.pixiPeg.roundRect(0, 0, PEG_WIDTH, height, RADIUS).fill(PEG_COLOR);
    pixiContainer.x = this.normalizeX(x);
    pixiContainer.y = this.normalizeY(y, height);
    pixiContainer.addChild(this.pixiPeg);
    if (shouldAnimate) {
      pixiContainer.mask = pixiMask;
      pixiContainer.addChild(pixiMask);
    }
    layer.addChild(pixiContainer);
    if (shouldAnimate) {
      animate.to(this.pixiMask, {
        pixi: {
          x: PEG_WIDTH,
        },
      });
    }
  }
  public destroy() {
    this.pixiContainer.destroy({ children: true });
    this.pixiContainer = new Container();
    this.pixiMask = new Graphics();
    this.pixiPeg = new Graphics();
    // this.pixiContainer.parent.removeChild(this.pixiContainer);
  }
  private get height() {
    return this.pixiContainer.height;
  }
  private normalizeX(x: number) {
    return x - PEG_WIDTH / 2;
  }
  private normalizeY(y: number, height: number) {
    return y - height;
  }
}
