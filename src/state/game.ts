import { inject, injectable } from "inversify";
import { DI_TYPES } from "@/di/types";
import _ from "lodash";
import type { tEventBus } from "@/interfaces/event-bus";
import type {
  tGameCondition,
  tGameState,
  tMoveDiskArgs,
  tPegsState,
} from "@/interfaces/game-state";
import { MAX_DISKS_COUNT, MIN_DISKS_COUNT } from "@/config/game";
import { observable, action, makeObservable, computed } from "mobx";

type tStepsHistoryEntry = {
  srcPeg: number;
  dstPeg: number;
};
@injectable()
export class GameState implements tGameState {
  public disksCount = 0;
  public pegs: tPegsState = [[], [], []];
  public currentStep = 0;
  public gameCondition: tGameCondition = "idle";
  private stepsHistory: tStepsHistoryEntry[] = [];
  constructor(@inject(DI_TYPES.eventBus) private eventBus: tEventBus) {
    makeObservable(this, {
      disksCount: observable,
      pegs: observable,
      currentStep: observable,
      gameCondition: observable,
      canRedoDiskMove: computed,
      canUndoDiskMove: computed,
      changeDisksCount: action,
      generateDisks: action,
      reset: action,
      changeStepsCount: action,
      undoDiskMove: action,
      redoDiskMove: action,
      changeGameCondition: action,
    });
  }
  public get canRedoDiskMove() {
    return Boolean(this.stepsHistory[this.currentStep]);
  }
  public get canUndoDiskMove() {
    return Boolean(this.stepsHistory[this.currentStep - 1]);
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
      // clearing the the dangling history we are not at the end
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
  }
  public changeGameCondition(condition: tGameCondition) {
    this.gameCondition = condition;
    this.eventBus.emit("gameConditionChanged", { condition });
  }
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
