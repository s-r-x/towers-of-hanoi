export type tMoveDiskArgs = { peg: number; disk: number };
export type tPegsState = [disks: number[], disks: number[], disks: number[]];
export type tGameState = {
  readonly disksCount: number;
  readonly currentStep: number;
  readonly pegs: tPegsState;
  readonly canUndoDiskMove: boolean;
  readonly canRedoDiskMove: boolean;
  moveDisk: (args: tMoveDiskArgs) => void;
  undoDiskMove: () => void;
  redoDiskMove: () => void;
  changeDisksCount: (count: number) => void;
  changeStepsCount: (count: number) => void;
  generateDisks: () => void;
  reset: () => void;
};
