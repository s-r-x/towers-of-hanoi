import { inject, injectable } from "inversify";
import { DI_TYPES } from "@/di/types";
import type { tRendererViewportState } from "@/interfaces/state";
import type { tEventBus } from "@/interfaces/event-bus";

@injectable()
export class RendererViewportState implements tRendererViewportState {
  constructor(@inject(DI_TYPES.eventBus) private eventBus: tEventBus) {}
  public width = 0;
  public height = 0;
  public updateViewport(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.eventBus.emit("rendererViewportUpdated", { width, height });
  }
}
