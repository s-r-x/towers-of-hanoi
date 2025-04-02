import { gsap } from "gsap";
import * as PIXI from "pixi.js";

import { PixiPlugin } from "gsap/PixiPlugin";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

export { gsap as animate };
