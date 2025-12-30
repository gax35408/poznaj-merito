import { makeCharacter } from "./character";
import { debugMode } from "./debugMode";
import {
  drawTile,
  getFramesPos,
  checkCollision,
  preventOverlap,
} from "../utils/utils";

export type animDirectionType = "up"|"down"|"left"|"right";

export function makeNPC(
  p:any, x:any, y:any,
  assetName:string,
  collisionSize:{x:number,y:number},
  spriteMove:{x:number,y:number},
  animDirection?: animDirectionType
) {

  return {
    ...makeCharacter(p, collisionSize?.x, collisionSize?.y),
    x, y,
    screenX: x, screenY: y,
    spriteX: 0,
    spriteY: -15,
    wasColliding: false,
    animDirection: (animDirection ?? "down") as animDirectionType,
    load() {
      this.spriteRef = p.loadImage(`/assets/${assetName}`);
    },

    prepareAnims() {
      this.frames = getFramesPos(4, 4, this.tileWidth, this.tileHeight);

      this.anims = {
        "idle-down": 0,
        "idle-side": 6,
        "idle-up": 12,
      };
    },

    setup() {
      this.prepareAnims();
      this.setDirection(this.animDirection);

      switch(this.animDirection){
        case "up":
          this.setAnim("idle-up");
          break;
        case "left":
        case "right":
          this.setAnim("idle-side");
          break;
        case "down":
        default:
          this.setAnim("idle-down");
          break;
      }

      this.spriteX = spriteMove.x&&spriteMove.x!==0 ? spriteMove.x : ((this.width - this.tileWidth)/2);
      this.spriteY = spriteMove.y&&spriteMove.y!==0 ? spriteMove.y : ((this.height - this.tileHeight)/2);
    },

    update() {
      this.previousTime = this.animationTimer;
      this.animationTimer += p.deltaTime;
      const animData = this.anims[this.currentAnim];
      this.currentFrameData = this.setAnimFrame(animData);
    },

    draw(camera:any) {
      this.screenX = this.x + camera.x;
      this.screenY = this.y + camera.y;
      
      debugMode.drawHitbox(p, this);
      p.push();
      
      if(this.direction === "right") {
        p.scale(-1, 1);
        p.translate(-2 * this.screenX - this.tileWidth, 0);
      }
      
      drawTile(
        p,
        this.spriteRef,
        this.screenX + this.spriteX,
        this.screenY + this.spriteY,
        this.currentFrameData.x,
        this.currentFrameData.y,
        this.tileWidth,
        this.tileHeight
      );

      p.pop();
    },

    handleCollisionsWith(entity:any, collisionEvent: () => void) {
    //   if (entity.freeze) return;

      const collision = checkCollision(this, entity);

      if (collision && !this.wasColliding && !entity.freeze) {
        preventOverlap(this, entity);
        entity.freeze = true;
        collisionEvent();
      }

      this.wasColliding = collision;
    },
  };
}