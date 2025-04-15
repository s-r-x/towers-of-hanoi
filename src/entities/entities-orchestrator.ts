import { inject, injectable } from "inversify";
import type { tEntitiesOrchestrator } from "@/interfaces/entities-orchestrator";
import type { tRendererLayer } from "@/interfaces/renderer";
import { PegEntity } from "./peg-entity/peg";
import { DI_TYPES } from "@/di/types";
import _ from "lodash";
import type { tEventBus } from "@/interfaces/event-bus";
import type { tGameState } from "@/interfaces/game-state";
import { DISK_HEIGHT } from "@/config/entities";
import type { tDiskEntity, tDiskEntityFactory } from "@/interfaces/disk-entity";
import type { Maybe } from "@/interfaces/util";
import { checkCollision } from "@/utils/check-collision";
import { animate } from "@/lib/animation";
import type { tUiState } from "@/interfaces/ui-state";
import { MAX_DISKS_COUNT } from "@/config/game";

@injectable()
export class EntitiesOrchestrator implements tEntitiesOrchestrator {
  private isInitialDraw = true;
  private pegEntities: PegEntity[] = [];
  private grabbedDiskEntity: Maybe<tDiskEntity> = null;
  private collidedPegEntity: Maybe<PegEntity> = null;
  private rootLayer: Maybe<tRendererLayer> = null;
  private diskEntitiesPool: tDiskEntity[] = [];
  private diskEntities: tDiskEntity[] = [];
  constructor(
    @inject(DI_TYPES.eventBus) private eventBus: tEventBus,
    @inject(DI_TYPES.gameState) private gameState: tGameState,
    @inject(DI_TYPES.uiState) private uiState: tUiState,
    @inject(DI_TYPES.diskEntityFactory)
    private diskEntityFactory: tDiskEntityFactory,
  ) {}
  public bootstrap(layer: tRendererLayer) {
    this.diskEntitiesPool = _.range(0, MAX_DISKS_COUNT).map((weight) => {
      const entity = this.diskEntityFactory(weight);
      entity.draw({ x: 0, y: 0, layer, weight });
      return entity;
    });
    this.rootLayer = layer;
    this.attachEventBusListeners();
    this.drawEntities();
  }
  private drawEntities() {
    this.drawPegs();
    this.drawDisks();
    this.isInitialDraw = false;
  }
  private drawDisks() {
    const pegs = this.gameState.pegs;
    const oldDiskEntities = this.diskEntities;
    this.diskEntities = [];
    const currentWeights: number[] = [];
    for (let i = 0; i < pegs.length; i++) {
      const pegEntity = this.pegEntities[i];
      const disks = pegs[i];
      let offsetY = 0;
      for (let j = 0; j < disks.length; j++) {
        const weight = disks[j];
        currentWeights.push(weight);
        const diskEntity = this.diskEntitiesPool[weight];
        if (!diskEntity) {
          throw new Error("No disk entity in the disk entities pool");
        }
        this.diskEntities.push(diskEntity);
        diskEntity.weightTextAlphaChannel = this.uiState.showDiskWeight ? 1 : 0;
        diskEntity.move({
          x: pegEntity.centerX,
          y: this.uiState.canvasViewport.height - offsetY * DISK_HEIGHT,
          // animate the move only if this entity is already visible
          animate: diskEntity.alphaChannel !== 0,
        });
        offsetY++;
      }
      animate.to(this.diskEntities, {
        alphaChannel: 1,
        stagger: 0.05,
      });
    }
    const staleDiskEntities = oldDiskEntities.filter(
      (e) => !currentWeights.includes(e.weight),
    );
    if (!_.isEmpty(staleDiskEntities)) {
      animate.to(staleDiskEntities, {
        alphaChannel: 0,
      });
      for (const entity of staleDiskEntities) {
        entity.disableInteraction();
      }
    }

    this.syncEntitiesInteractivityState();
  }
  private drawPegs() {
    const layer = this.rootLayer!;
    const pegs = this.gameState.pegs;
    const pegsXPositions = this.calcPegsXPositions();
    const { disksCount } = this.gameState;
    const offset = (MAX_DISKS_COUNT - disksCount) * DISK_HEIGHT;
    if (this.isInitialDraw) {
      for (let i = 0; i < pegs.length; i++) {
        const pegEntity = new PegEntity(i);
        const pegX = pegsXPositions[i];
        pegEntity.draw({
          layer,
          x: pegX,
          y: this.uiState.canvasViewport.height,
          yOffset: offset,
          height: DISK_HEIGHT * MAX_DISKS_COUNT,
        });
        this.pegEntities.push(pegEntity);
      }
    } else {
      animate.to(this.pegEntities, {
        yOffset: offset,
      });
    }
  }
  private attachEventBusListeners() {
    this.eventBus.on("rendererViewportUpdated", this.onRendererViewportChange);
    this.eventBus.on("diskGrabbed", this.onDiskGrabbed);
    this.eventBus.on("grabbedDiskMoved", this.onGrabbedDiskMove);
    this.eventBus.on("grabbedDiskReleased", this.onGrabbedDiskRelease);
    this.eventBus.on("diskPegChanged", this.onDiskPegChange);
    this.eventBus.on("pegsGenerated", this.onPegsGenerated);
    this.eventBus.on("gameConditionChanged", this.onGameConditionChanged);
    this.eventBus.on("showDiskWeightChanged", this.onShowDiskWeightChanged);
    this.eventBus.on(
      "disksInteractivityChanged",
      this.onDisksInteractivityChanged,
    );
  }
  private onDisksInteractivityChanged = () => {
    this.syncEntitiesInteractivityState();
  };
  private onShowDiskWeightChanged = ({ show }: { show: boolean }) => {
    animate.to(this.diskEntities, {
      weightTextAlphaChannel: show ? 1 : 0,
      stagger: 0.05,
    });
  };
  private onGameConditionChanged = () => {
    if (this.gameState.gameCondition === "finished") {
      animate.to(this.diskEntities, {
        endGameColorAlphaChannel: 1,
        stagger: 0.05,
      });
    } else {
      animate.to(this.diskEntities, {
        endGameColorAlphaChannel: 0,
      });
    }
  };
  private onPegsGenerated = () => {
    this.drawEntities();
  };
  private onDiskPegChange = ({
    dstPeg,
    disk,
  }: {
    dstPeg: number;
    disk: number;
  }) => {
    const pegEntity = this.pegEntities[dstPeg];
    const diskEntity = this.findDiskEntityById(disk);
    if (!pegEntity || !diskEntity) {
      console.warn("Cannot find a peg entity or a disk entity");
      return;
    }
    const disksOnPeg = this.gameState.pegs[dstPeg];
    diskEntity.move({
      x: pegEntity.centerX,
      y:
        this.uiState.canvasViewport.height -
        (disksOnPeg.length - 1) * DISK_HEIGHT,
      animate: true,
    });
    this.syncEntitiesInteractivityState();
  };
  private onDiskGrabbed = ({ weight }: { weight: number }) => {
    this.grabbedDiskEntity = this.findDiskEntityById(weight);
    if (!this.grabbedDiskEntity) return;
  };
  private onGrabbedDiskMove = () => {
    const { grabbedDiskEntity: diskEntity } = this;
    if (!diskEntity) return;
    const diskRect = diskEntity.collisionRect;
    for (const peg of this.pegEntities) {
      const pegRect = peg.collisionRect;
      if (checkCollision(pegRect, diskRect)) {
        this.collidedPegEntity = peg;
      }
    }
  };
  private onGrabbedDiskRelease = () => {
    const { grabbedDiskEntity, collidedPegEntity } = this;
    if (grabbedDiskEntity && collidedPegEntity) {
      this.gameState.moveDisk({
        disk: grabbedDiskEntity.weight,
        peg: collidedPegEntity.id,
      });
    }
    this.grabbedDiskEntity = null;
    this.collidedPegEntity = null;
  };
  private onRendererViewportChange = () => {
    const pegsPositions = this.calcPegsXPositions();
    for (let i = 0; i < pegsPositions.length; i++) {
      const peg = this.pegEntities[i];
      if (!peg) {
        throw new Error(
          `Missing peg at index ${i} while recalculating the positions`,
        );
      }
      peg.move({ x: pegsPositions[i], y: this.uiState.canvasViewport.height });
    }
    this.drawDisks();
  };
  private syncEntitiesInteractivityState() {
    const pegs = this.gameState.pegs;
    const { isDisksInteractive: isInteractive } = this.gameState;
    for (const disks of pegs) {
      for (let i = 0; i < disks.length; i++) {
        const weight = disks[i];
        const diskEntity = this.findDiskEntityById(weight);
        if (!diskEntity) {
          continue;
        }
        if (isInteractive && i === disks.length - 1) {
          diskEntity.enableInteraction();
        } else {
          diskEntity.disableInteraction();
        }
      }
    }
  }
  private findDiskEntityById(id: number) {
    return this.diskEntities.find((d) => d.weight === id) || null;
  }
  private calcPegsXPositions(): [number, number, number] {
    const xStep = this.uiState.canvasViewport.width / 4;
    const acc: number[] = [];
    for (const mul of _.range(1, 4)) {
      acc.push(xStep * mul);
    }
    return acc as [number, number, number];
  }
}
