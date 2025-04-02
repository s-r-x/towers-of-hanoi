import EventEmitter from "eventemitter3";
import type { tEventBus, tEventMap } from "@/interfaces/event-bus";
import { injectable } from "inversify";

@injectable()
export class EventBus implements tEventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  emit<K extends keyof tEventMap>(event: K, data: tEventMap[K]): void {
    this.emitter.emit(event, data);
  }

  on<K extends keyof tEventMap>(
    event: K,
    listener: (data: tEventMap[K]) => void,
  ): void {
    this.emitter.on(event, listener);
  }

  off<K extends keyof tEventMap>(
    event: K,
    listener: (data: tEventMap[K]) => void,
  ): void {
    this.emitter.off(event, listener);
  }

  once<K extends keyof tEventMap>(
    event: K,
    listener: (data: tEventMap[K]) => void,
  ): void {
    this.emitter.once(event, listener);
  }

  removeAllListeners<K extends keyof tEventMap>(event?: K): void {
    this.emitter.removeAllListeners(event);
  }
}
