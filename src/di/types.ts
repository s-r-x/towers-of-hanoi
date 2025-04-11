export const DI_TYPES = {
  app: Symbol.for("app"),
  renderer: Symbol.for("renderer"),
  eventBus: Symbol.for("eventBus"),
  entitiesOrchestrator: Symbol.for("entitiesManager"),
  rendererViewportState: Symbol.for("rendererViewportState"),
  gameState: Symbol.for("gameState"),
  diskEntityFactory: Symbol.for("diskEntityFactory"),
  ui: Symbol.for("ui"),
  uiState: Symbol.for("uiState"),
};
