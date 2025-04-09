import { inject, injectable } from "inversify";
import { DI_TYPES } from "./di/types";
import type { tRenderer } from "./interfaces/renderer";
import type { tApp } from "./interfaces/app";
import type { tEntitiesOrchestrator } from "./interfaces/entities-orchestrator";
import type { tGameState } from "./interfaces/game-state";
import { DEFAULT_DISKS_COUNT } from "./config/game";
import type { tUiEntrypoint } from "./interfaces/ui";

@injectable()
export class Application implements tApp {
  constructor(
    @inject(DI_TYPES.renderer) private renderer: tRenderer,
    @inject(DI_TYPES.entitiesOrchestrator)
    private entitiesOrchestrator: tEntitiesOrchestrator,
    @inject(DI_TYPES.gameState) private gameState: tGameState,
    @inject(DI_TYPES.ui) private ui: tUiEntrypoint,
  ) {}
  public async bootstrap() {
    this.gameState.changeDisksCount(DEFAULT_DISKS_COUNT);
    this.gameState.changeGameCondition("active");
    await this.renderer.bootstrap();
    this.entitiesOrchestrator.bootstrap(this.renderer.layer);
    this.ui.bootstrap();
  }
}
