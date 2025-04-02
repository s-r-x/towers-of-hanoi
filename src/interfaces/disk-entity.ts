import type { tEntityCollisionRect } from "./entity";
import type { tRendererLayer } from "./renderer";

export type tDiskEntityDrawArgs = {
  x: number;
  y: number;
  weight: number;
  layer: tRendererLayer;
};
export type tMoveDiskEntityArgs = {
  x: number;
  y: number;
  animate?: boolean;
};

export type tDiskEntity = {
  weight: number;
  alphaChannel: number;
  collisionRect: tEntityCollisionRect;
  draw: (args: tDiskEntityDrawArgs) => void;
  move: (args: tMoveDiskEntityArgs) => void;
  enableInteraction: () => void;
  disableInteraction: () => void;
  destroy: () => void;
};
export type tDiskEntityFactory = (weight: number) => tDiskEntity;
