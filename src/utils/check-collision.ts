import type { tEntityCollisionRect } from "../interfaces/entity";

export function checkCollision(
  rect1: tEntityCollisionRect,
  rect2: tEntityCollisionRect,
): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}
