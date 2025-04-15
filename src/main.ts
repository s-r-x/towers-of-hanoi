import "reflect-metadata";
import "./style.css";
import { container } from "./di/container";
import type { tApp } from "./interfaces/app";
import { DI_TYPES } from "./di/types";

(async () => {
  const app = container.get<tApp>(DI_TYPES.app);
  await app.bootstrap();
})();
