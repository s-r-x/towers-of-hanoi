import { Application } from "pixi.js";
import { inject, injectable } from "inversify";
import type { tRenderer } from "@/interfaces/renderer";
import { DI_TYPES } from "@/di/types";
import type { tRendererViewportState } from "@/interfaces/state";
import { CANVAS_BG_COLOR } from "@/config/styling";

@injectable()
export class Renderer implements tRenderer {
  private app: Application;
  constructor(
    @inject(DI_TYPES.rendererViewportState)
    private viewportState: tRendererViewportState,
  ) {
    this.app = new Application();
  }
  public get layer() {
    return this.app.stage;
  }
  public async bootstrap() {
    const $root = document.getElementById("canvas-root");
    if (!$root) {
      throw new Error("Cannot find the canvas root element");
    }
    await this.app.init({
      resizeTo: $root,
      antialias: true,
      backgroundColor: CANVAS_BG_COLOR,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;
    this.viewportState.updateViewport(
      this.app.screen.width,
      this.app.screen.height,
    );
    $root.appendChild(this.app.canvas);
  }
}
