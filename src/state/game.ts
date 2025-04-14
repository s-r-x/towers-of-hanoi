import { inject, injectable } from "inversify";
import { DI_TYPES } from "@/di/types";
import _ from "lodash";
import type { tEventBus } from "@/interfaces/event-bus";
import type {
  tGameCondition,
  tGameState,
  tMoveDiskArgs,
  tPegsState,
  tSolverCondition,
  tStepsHistoryEntry,
} from "@/interfaces/game-state";
import { MAX_DISKS_COUNT, MIN_DISKS_COUNT } from "@/config/game";
import {
  observable,
  action,
  makeObservable,
  computed,
  reaction,
  flow,
} from "mobx";
import { wait } from "@/utils/wait";
import { DISK_MOVE_ANIM_DUR_MS } from "@/config/animation";
import { CancellablePromise } from "mobx/dist/internal";
import { Maybe } from "@/interfaces/util";

@injectable()
export class GameState implements tGameState {
  public disksCount = 0;
  public pegs: tPegsState = [[], [], []];
  public currentStep = 0;
  public gameCondition: tGameCondition = "idle";
  public solverCondition: tSolverCondition = "inactive";
  public stepsHistory: tStepsHistoryEntry[] = [];
  private solverPromise: Maybe<CancellablePromise<void>> = null;
  constructor(@inject(DI_TYPES.eventBus) private eventBus: tEventBus) {
    makeObservable(this, {
      disksCount: observable,
      pegs: observable,
      currentStep: observable,
      gameCondition: observable,
      solverCondition: observable,
      stepsHistory: observable,
      canRedoDiskMove: computed,
      canUndoDiskMove: computed,
      isDisksInteractive: computed,
      canStartSolver: computed,
      changeDisksCount: action,
      generateDisks: action,
      reset: action,
      changeStepsCount: action,
      moveDisk: action,
      undoDiskMove: action,
      redoDiskMove: action,
      changeGameCondition: action,
      //startSolver: flow,
      stopSolver: action,
    });
    reaction(
      () => this.isDisksInteractive,
      (isInteractive) => {
        this.eventBus.emit("disksInteractivityChanged", { isInteractive });
      },
    );
  }
  public get canStartSolver() {
    return (
      this.gameCondition !== "finished" && this.solverCondition === "inactive"
    );
  }
  public get isDisksInteractive() {
    return (
      this.gameCondition === "active" && this.solverCondition === "inactive"
    );
  }
  public get canRedoDiskMove() {
    return (
      Boolean(this.stepsHistory[this.currentStep]) &&
      this.gameCondition !== "finished" &&
      this.solverCondition !== "active"
    );
  }
  public get canUndoDiskMove() {
    return (
      Boolean(this.stepsHistory[this.currentStep - 1]) &&
      this.gameCondition !== "finished" &&
      this.solverCondition !== "active"
    );
  }
  public changeDisksCount(count: number) {
    if (count <= MAX_DISKS_COUNT && count >= MIN_DISKS_COUNT) {
      this.disksCount = count;
      this.reset();
    }
  }
  public generateDisks() {
    const { disksCount } = this;
    if (!disksCount) {
      console.error(`Disks count is ${disksCount}. Cannot generate pegs.`);
      return;
    }
    const srcPeg: number[] = [];
    for (const i of _.range(disksCount - 1, -1)) {
      srcPeg.push(i);
    }
    this.pegs = [srcPeg, [], []];
    this.eventBus.emit("pegsGenerated", undefined);
  }
  public moveDisk(args: tMoveDiskArgs) {
    const emitNoopMoveEvent = () => {
      this.eventBus.emit("diskPegChanged", {
        srcPeg: srcPegIdx,
        dstPeg: srcPegIdx,
        disk: args.disk,
      });
    };
    // TODO:: optimize me
    const srcPegIdx = this.pegs.findIndex(
      (p) => p.findIndex((d) => d === args.disk) !== -1,
    );
    if (srcPegIdx === -1) {
      console.warn("Cannot move disk. Disk not found");
      return emitNoopMoveEvent();
    }
    if (srcPegIdx === args.peg) {
      console.warn("Cannot move disk. Pegs are the same");
      return emitNoopMoveEvent();
    }
    const srcDisks = this.pegs[srcPegIdx];
    const diskIdx = srcDisks.findIndex((d) => d === args.disk);
    if (diskIdx !== srcDisks.length - 1) {
      console.error(
        "The disk that was moved is not the last one on the stack. Shouldn't be here",
      );
      return emitNoopMoveEvent();
    }
    const disk = srcDisks[diskIdx];
    const dstDisks = this.pegs[args.peg];
    // bad move
    if (dstDisks.some((d) => d < disk)) {
      // just to animate the disk to the initial state
      // TODO:: create a separate event
      return emitNoopMoveEvent();
    } else {
      // clearing the dangling history if we are not at the end
      if (this.stepsHistory[this.currentStep]) {
        this.stepsHistory.splice(this.currentStep);
      }
      this.stepsHistory.push({
        srcPeg: srcPegIdx,
        dstPeg: args.peg,
      });
      this._moveDisk({
        srcPeg: srcPegIdx,
        dstPeg: args.peg,
      });
      this.changeStepsCount(this.currentStep + 1);
    }
  }
  public undoDiskMove() {
    if (!this.canUndoDiskMove) return;
    const newCurrentStep = this.currentStep - 1;
    const stepEntry = this.stepsHistory[newCurrentStep]!;
    this._moveDisk({
      srcPeg: stepEntry.dstPeg,
      dstPeg: stepEntry.srcPeg,
    });
    this.changeStepsCount(newCurrentStep);
  }
  public redoDiskMove() {
    if (!this.canRedoDiskMove) return;
    const stepEntry = this.stepsHistory[this.currentStep]!;
    this._moveDisk({
      srcPeg: stepEntry.srcPeg,
      dstPeg: stepEntry.dstPeg,
    });
    this.changeStepsCount(this.currentStep + 1);
  }
  public changeStepsCount(count: number) {
    this.currentStep = count;
  }
  public reset() {
    this.generateDisks();
    this.changeStepsCount(0);
    this.stepsHistory = [];
    this.changeGameCondition("active");
    this.stopSolver();
  }
  public changeGameCondition(condition: tGameCondition) {
    this.gameCondition = condition;
    this.eventBus.emit("gameConditionChanged", { condition });
  }
  public stopSolver() {
    if (this.solverCondition === "active") {
      this.solverCondition = "inactive";
    }
    this.solverPromise?.cancel();
    this.solverPromise = null;
  }
  public async startSolver() {
    this.solverPromise = this._startSolver();
    this.solverPromise.catch((e) => {
      if (e?.message === "FLOW_CANCELLED") {
        console.log("solver has been cancelled");
      } else {
        console.error(e);
      }
    });
  }
  private _startSolver = flow(function* (this: GameState) {
    if (this.solverCondition === "active") return;
    this.solverCondition = "active";
    if (!_.isEmpty(this.stepsHistory)) {
      this.stepsHistory = [];
      this.changeStepsCount(0);
      this.generateDisks();
      // animation to default state
      yield wait(DISK_MOVE_ANIM_DUR_MS);
    }
    const moves: tStepsHistoryEntry[] = [];
    const algorithm = (
      n: number,
      srcPeg: number,
      tmpPeg: number,
      dstPeg: number,
    ) => {
      if (n === 1) {
        moves.push({ srcPeg, dstPeg });
        return;
      }

      algorithm(n - 1, srcPeg, dstPeg, tmpPeg);

      if (this.solverCondition === "active") {
        moves.push({ srcPeg, dstPeg });
      }

      algorithm(n - 1, tmpPeg, srcPeg, dstPeg);
    };
    algorithm(this.disksCount, 0, 1, 2);
    for (const move of moves) {
      if (this.solverCondition !== "active") {
        return;
      }
      this._moveDisk(move);
      yield wait(DISK_MOVE_ANIM_DUR_MS);
      this.stepsHistory.push({
        srcPeg: move.srcPeg,
        dstPeg: move.dstPeg,
      });
      this.changeStepsCount(this.currentStep + 1);
    }
    this.stopSolver();
  });
  private _moveDisk(step: tStepsHistoryEntry) {
    const srcDisks = this.pegs[step.srcPeg];
    const dstDisks = this.pegs[step.dstPeg];
    const disk = srcDisks.pop();
    if (_.isNil(disk)) {
      throw new Error(`disk is nil: ${disk}`);
    }
    dstDisks.push(disk);
    this.eventBus.emit("diskPegChanged", {
      srcPeg: step.srcPeg,
      dstPeg: step.dstPeg,
      disk,
    });
    if (this.pegs[2].length === this.disksCount) {
      this.changeGameCondition("finished");
    }
  }
}
