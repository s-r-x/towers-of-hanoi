import { DI_TYPES } from "./types";
import { Container } from "inversify";
import { Renderer } from "@/renderer/renderer";
import { Application } from "@/app";
import type { tRenderer } from "@/interfaces/renderer";
import type { tApp } from "@/interfaces/app";
import type { tEventBus } from "@/interfaces/event-bus";
import { EventBus } from "@/event-bus/event-bus";
import type { tEntitiesOrchestrator } from "@/interfaces/entities-orchestrator";
import { EntitiesOrchestrator } from "@/entities/entities-orchestrator";
import type { tRendererViewportState } from "@/interfaces/state";
import { RendererViewportState } from "@/state/renderer-viewport";
import { GameState } from "@/state/game";
import type { tGameState } from "@/interfaces/game-state";
import type { tDiskEntityFactory } from "@/interfaces/disk-entity";
import { DiskEntity } from "@/entities/disk-entity/disk";
import type { tUiEntrypoint } from "@/interfaces/ui";
import { UI } from "@/ui/ui-entrypoint";
import type { tUiState } from "@/interfaces/ui-state";
import { UiState } from "@/state/ui";

const container = new Container();

container.bind<tEventBus>(DI_TYPES.eventBus).to(EventBus).inSingletonScope();
container.bind<tGameState>(DI_TYPES.gameState).to(GameState).inSingletonScope();
container.bind<tUiState>(DI_TYPES.uiState).to(UiState);
container
  .bind<tRendererViewportState>(DI_TYPES.rendererViewportState)
  .to(RendererViewportState)
  .inSingletonScope();
container.bind<tRenderer>(DI_TYPES.renderer).to(Renderer).inSingletonScope();
container.bind<tApp>(DI_TYPES.app).to(Application).inSingletonScope();
container
  .bind<tDiskEntityFactory>(DI_TYPES.diskEntityFactory)
  .toFactory((container) => (weight: number) => {
    const eventBus = container.get<tEventBus>(DI_TYPES.eventBus);
    return new DiskEntity(eventBus, weight);
  });
container
  .bind<tEntitiesOrchestrator>(DI_TYPES.entitiesOrchestrator)
  .to(EntitiesOrchestrator)
  .inSingletonScope();
container.bind<tUiEntrypoint>(DI_TYPES.ui).to(UI).inSingletonScope();

export { container };
