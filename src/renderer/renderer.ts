import { Application } from "pixi.js";
import { inject, injectable } from "inversify";
import type { tRenderer } from "@/interfaces/renderer";
import { DI_TYPES } from "@/di/types";
import { CANVAS_BG_COLOR } from "@/config/styling";
import { RENDERER_RESOLUTION } from "@/constants";
import _ from "lodash";
import type { tUiState } from "@/interfaces/ui-state";

@injectable()
export class Renderer implements tRenderer {
  private app: Application;
  constructor(
    @inject(DI_TYPES.uiState)
    private uiState: tUiState,
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
      resolution: RENDERER_RESOLUTION,
      autoDensity: true,
    });
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;
    this.uiState.updateCanvasViewport({
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    $root.appendChild(this.app.canvas);
    this.watchCanvasViewportChange($root);
  }
  private watchCanvasViewportChange($el: HTMLElement) {
    let isFirstResizeCall = true;
    const onResize = _.throttle(() => {
      if (isFirstResizeCall) {
        isFirstResizeCall = false;
        return;
      }
      this.uiState.updateCanvasViewport({
        width: this.app.screen.width,
        height: this.app.screen.height,
      });
    }, 250);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe($el);
  }
}
