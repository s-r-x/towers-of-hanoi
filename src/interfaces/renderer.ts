import type { Container } from "pixi.js";
export type tRenderer = {
  bootstrap: () => Promise<void>;
  layer: tRendererLayer;
};
export type tRendererLayer = Container;
