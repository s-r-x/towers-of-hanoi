export type tRendererViewportState = {
  readonly width: number;
  readonly height: number;
  updateViewport: (width: number, height: number) => void;
};

