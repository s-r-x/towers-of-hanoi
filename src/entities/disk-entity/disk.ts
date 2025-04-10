import { Graphics, Container, Point, FederatedPointerEvent } from "pixi.js";
import type { tRendererLayer } from "@/interfaces/renderer";
import { DISK_HEIGHT, DISK_SCALE_STEP, DISK_WIDTH } from "@/config/entities";
import { inject, injectable } from "inversify";
import type {
  tDiskEntity,
  tDiskEntityDrawArgs,
  tMoveDiskEntityArgs,
} from "@/interfaces/disk-entity";
import { DI_TYPES } from "@/di/types";
import { animate } from "@/lib/animation";
import type { tEventBus } from "@/interfaces/event-bus";
import { DISKS_PALETTE, END_GAME_COLOR } from "@/config/styling";
import { ColorOverlayFilter } from "pixi-filters/color-overlay";
import { RENDERER_RESOLUTION } from "@/constants";

const RADIUS = 25;
@injectable()
export class DiskEntity implements tDiskEntity {
  private pixiDisk = new Graphics();
  private pixiContainer = new Container();
  private colorOverlayFilter = new ColorOverlayFilter({
    color: END_GAME_COLOR,
  });
  constructor(
    @inject(DI_TYPES.eventBus) private eventBus: tEventBus,
    public weight: number,
  ) {}
  public get alphaChannel() {
    return this.pixiContainer.alpha;
  }
  public set alphaChannel(value: number) {
    this.pixiContainer.alpha = value;
  }
  public get collisionRect() {
    return this.pixiContainer.getBounds();
  }
  public get endGameColorAlphaChannel() {
    return this.colorOverlayFilter.alpha;
  }
  public set endGameColorAlphaChannel(value: number) {
    this.colorOverlayFilter.alpha = value;
  }
  public move({ x, y, animate: shouldAnimate }: tMoveDiskEntityArgs) {
    y = this.normalizeY(y);
    if (shouldAnimate) {
      animate.to(this.pixiContainer, {
        pixi: {
          x,
          y,
        },
      });
    } else {
      this.pixiContainer.x = x;
      this.pixiContainer.y = y;
    }
  }
  public enableInteraction() {
    this.pixiContainer.eventMode = "static";
    this.pixiContainer.cursor = "pointer";
    this.pixiContainer.off("pointerdown", this.onPointerDown);
    this.pixiContainer.on("pointerdown", this.onPointerDown);
  }
  public disableInteraction() {
    this.pixiContainer.eventMode = "none";
    this.pixiContainer.cursor = undefined;
    this.pixiContainer.off("pointerdown", this.onPointerDown);
  }
  public draw({ x, weight, y, layer }: tDiskEntityDrawArgs) {
    const width = DISK_WIDTH + DISK_SCALE_STEP * weight;
    const colorOverlay = this.colorOverlayFilter;
    colorOverlay.resolution = RENDERER_RESOLUTION;
    colorOverlay.antialias = "inherit";
    colorOverlay.alpha = 0;
    const { pixiDisk, pixiContainer } = this;
    pixiContainer.x = x;
    pixiContainer.zIndex = 2;
    pixiContainer.y = this.normalizeY(y);
    pixiDisk
      .roundRect(Math.round(-(width / 2)), 0, width, DISK_HEIGHT, RADIUS)
      .fill(this.getColor(weight));
    pixiDisk.filters = [colorOverlay];
    pixiContainer.addChild(pixiDisk);
    layer.addChild(pixiContainer);
  }
  public destroy() {
    // this.pixiContainer.parent.removeChild(this.pixiContainer);
    this.pixiContainer.destroy({ children: true });
    this.pixiDisk = new Graphics();
    this.pixiContainer = new Container();
    this.colorOverlayFilter = new ColorOverlayFilter({ color: END_GAME_COLOR });
  }
  onPointerDown = (event: FederatedPointerEvent) => {
    this.eventBus.emit("diskGrabbed", { weight: this.weight });
    const dragTarget = this.pixiContainer;
    const localPos = event.getLocalPosition(dragTarget.parent);
    let dragOffset = new Point();
    dragOffset.set(localPos.x - dragTarget.x, localPos.y - dragTarget.y);
    dragTarget.alpha = 0.8;
    const initialZIndex = dragTarget.zIndex;
    dragTarget.zIndex = 100;
    let rootLayer: tRendererLayer = dragTarget.parent;
    while (rootLayer.parent) {
      rootLayer = rootLayer.parent;
    }
    const onPointerMove = (event: FederatedPointerEvent) => {
      const newPosition = event.getLocalPosition(dragTarget.parent);
      dragTarget.position.set(
        newPosition.x - dragOffset.x,
        newPosition.y - dragOffset.y,
      );
      this.eventBus.emit("grabbedDiskMoved", undefined);
    };
    rootLayer.on("pointermove", onPointerMove);

    const onDragEnd = () => {
      dragTarget.alpha = 1;
      dragTarget.zIndex = initialZIndex;
      rootLayer.off("pointermove", onPointerMove);
      rootLayer.off("pointerup", onDragEnd);
      this.eventBus.emit("grabbedDiskReleased", undefined);
    };
    rootLayer.on("pointerupoutside", onDragEnd);
    rootLayer.on("pointerup", onDragEnd);
  };
  private getColor(weight: number) {
    return DISKS_PALETTE[weight] || "#ffffff";
  }
  private normalizeY(y: number) {
    return y - DISK_HEIGHT;
  }
}
