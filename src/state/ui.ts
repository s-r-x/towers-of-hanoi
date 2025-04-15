import { inject, injectable } from "inversify";
import type { tCanvasViewport, tUiState } from "@/interfaces/ui-state";
import { DI_TYPES } from "@/di/types";
import type { tEventBus } from "@/interfaces/event-bus";
import { action, makeObservable, observable } from "mobx";

@injectable()
export class UiState implements tUiState {
  public showDiskWeight = false;
  public canvasViewport: tCanvasViewport = {
    width: 0,
    height: 0,
  };
  constructor(@inject(DI_TYPES.eventBus) private eventBus: tEventBus) {
    makeObservable(this, {
      showDiskWeight: observable,
      changeShowDiskWeight: action,
    });
  }
  public changeShowDiskWeight(show: boolean) {
    this.showDiskWeight = show;
    this.eventBus.emit("showDiskWeightChanged", { show });
  }
  public updateCanvasViewport(viewport: tCanvasViewport) {
    this.canvasViewport = viewport;
    this.eventBus.emit("rendererViewportUpdated", viewport);
  }
}
