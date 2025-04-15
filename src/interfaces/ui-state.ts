export type tCanvasViewport = {
  width: number;
  height: number;
};
export type tUiState = {
  canvasViewport: tCanvasViewport;
  showDiskWeight: boolean;
  changeShowDiskWeight: (show: boolean) => void;
  updateCanvasViewport: (viewport: tCanvasViewport) => void;
};
