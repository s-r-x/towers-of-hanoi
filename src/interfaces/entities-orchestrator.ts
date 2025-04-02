import { tRendererLayer } from "./renderer";

export type tEntitiesOrchestrator = {
  bootstrap: (layer: tRendererLayer) => void;
};
