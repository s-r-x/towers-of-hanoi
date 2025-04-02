export type tEventMap = {
  rendererViewportUpdated: { width: number; height: number };
  diskGrabbed: { weight: number };
  grabbedDiskMoved: void;
  grabbedDiskReleased: void;
  disksCountChanged: number;
  diskPegChanged: { srcPeg: number; dstPeg: number; disk: number };
  pegsGenerated: void;
};

export type tEventBus = {
  emit<K extends keyof tEventMap>(event: K, data: tEventMap[K]): void;

  on<K extends keyof tEventMap>(
    event: K,
    listener: (data: tEventMap[K]) => void,
  ): void;

  off<K extends keyof tEventMap>(
    event: K,
    listener: (data: tEventMap[K]) => void,
  ): void;

  once<K extends keyof tEventMap>(
    event: K,
    listener: (data: tEventMap[K]) => void,
  ): void;

  removeAllListeners<K extends keyof tEventMap>(event?: K): void;
};
