import { checkCollision, preventOverlap, resolveOverlapSAT } from "../utils/utils";
import { debugMode } from "./debugMode";

export const makeCollidable = (p:any, x:number, y:number, width:number, height:number, rotationDeg:number = 0) => {
  return {
    x,
    y,
    screenX: x,
    screenY: y,
    width,
    height,
    rotationDeg,
    preventPassthroughFrom(entity:any) {
      const collision = checkCollision(this, entity);
      if (collision) resolveOverlapSAT(this, entity);
      // if (collision) preventOverlap(this, entity);
    },

    update(camera:any) {
      this.screenX = this.x + camera.x;
      this.screenY = this.y + camera.y;
    },

    draw(type?:string) {
      debugMode.drawHitbox(p, this, type);
    },
  };
}