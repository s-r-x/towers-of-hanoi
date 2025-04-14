export type tMoveDiskArgs = { peg: number; disk: number };
export type tPegsState = [disks: number[], disks: number[], disks: number[]];

export type tGameCondition = "idle" | "active" | "finished";
export type tSolverCondition = "active" | "inactive";
export type tStepsHistoryEntry = {
  srcPeg: number;
  dstPeg: number;
};
export type tGameState = {
  readonly disksCount: number;
  readonly currentStep: number;
  readonly pegs: tPegsState;
  readonly canUndoDiskMove: boolean;
  readonly canRedoDiskMove: boolean;
	readonly canStartSolver: boolean;
  readonly gameCondition: tGameCondition;
  readonly solverCondition: tSolverCondition;
  readonly isDisksInteractive: boolean;
  readonly stepsHistory: tStepsHistoryEntry[];
  moveDisk: (args: tMoveDiskArgs) => void;
  undoDiskMove: () => void;
  redoDiskMove: () => void;
  changeDisksCount: (count: number) => void;
  changeStepsCount: (count: number) => void;
  generateDisks: () => void;
  changeGameCondition: (condition: tGameCondition) => void;
  startSolver: () => void;
  stopSolver: () => void;
  reset: () => void;
};
