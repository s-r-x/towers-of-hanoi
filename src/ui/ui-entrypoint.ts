import { injectable, inject } from "inversify";
import { tUiEntrypoint } from "@/interfaces/ui";
import { DI_TYPES } from "@/di/types";
import { createRoot } from "react-dom/client";
import type { tGameState } from "@/interfaces/game-state";
import { renderApp } from "./render-app";

@injectable()
export class UI implements tUiEntrypoint {
  constructor(@inject(DI_TYPES.gameState) private gameState: tGameState) {}
  public bootstrap() {
    console.log("bootstrapped");
    const $root = document.getElementById("ui-root");
    if (!$root) {
      throw new Error("ui root not found");
    }
    createRoot($root).render(renderApp({ gameState: this.gameState }));
  }
}
