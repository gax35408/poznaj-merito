import { getFramesPos, drawTile, maxOneKeyDown } from "../utils/utils";
import { makeCharacter } from "./character"
import { VirtualKeys } from '../utils/keysMobile';
import { debugMode } from "./debugMode";


function isDown(p:any, codeNum:number, codeStr?:string) {
    return p.keyIsDown(codeNum) || (codeStr ? VirtualKeys.has(codeStr) : VirtualKeys.has(codeNum));
}


export const makePlayer = (p:any,x:any,y:any) => {
    return {
        ...makeCharacter(p),
        maxSpeed: 300,
        defaultSpeed: 200,
        speed: 100,
        x,
        y,
        screenX: x,
        screenY: y,
        spriteX: 0,
        spriteY: -15,
        freeze: false,
        _lastMoveWasZero: true,
        load() {
            this.spriteRef = p.loadImage("/assets/boy_run.png");
        },
        prepareAnims() {
            this.frames = getFramesPos(4, 4, this.tileWidth, this.tileHeight);

            this.anims = {
                "idle-down": 0,
                "idle-side": 6,
                "idle-up": 12,
                "run-down": { from: 0, to: 3, loop: true, speed: 8},
                "run-side": { from: 4, to: 7, loop: true, speed: 8},
                "run-up": { from: 12, to: 15, loop: true, speed: 8}
            }
        },
        movePlayer(moveBy:any) {
            // if(!maxOneKeyDown(p) || this.freeze) return;
            if(this.freeze) return;
            this._lastMoveWasZero = true;
            let dx = 0, dy = 0;


            (!maxOneKeyDown(p)) ? this.speed = (this.defaultSpeed-25) : this.speed = this.defaultSpeed;
            
            if(p.keyIsDown(p.SHIFT)){
                (!maxOneKeyDown(p)) ? this.speed = (this.maxSpeed-75) : this.speed = this.maxSpeed;
                // this.speed = 200;
            }

            const up    = isDown(p, p.UP_ARROW,    'ArrowUp')    || isDown(p, 87, 'KeyW');
            const down  = isDown(p, p.DOWN_ARROW,  'ArrowDown')  || isDown(p, 83, 'KeyS');
            const right = isDown(p, p.RIGHT_ARROW, 'ArrowRight') || isDown(p, 68, 'KeyD');
            const left  = isDown(p, p.LEFT_ARROW,  'ArrowLeft')  || isDown(p, 65, 'KeyA');


            if (up)   { this.setDirection("up");   this.setAnim("run-up");   dy -= moveBy; }
            if (down) { this.setDirection("down"); this.setAnim("run-down"); dy += moveBy; }
            if (right){ this.setDirection("right");this.setAnim("run-side"); dx += moveBy; }
            if (left) { this.setDirection("left"); this.setAnim("run-side"); dx -= moveBy; }

            if(dx!==0 || dy!==0){
                this._lastMoveWasZero = false;

                this.x += dx;
                this.y += dy;
            }

        },
        setup() {
            this.prepareAnims();
            this.direction = "down";
            this.setAnim("idle-down");
        },
        update() {
            this.previousTime = this.animationTimer;
            this.animationTimer += p.deltaTime;

            if(this.freeze) {
                switch(this.direction){
                    case "up": this.setAnim("idle-up"); break;
                    case "down": this.setAnim("idle-down"); break;
                    default: this.setAnim("idle-side"); break;
                }
            }

            const moveBy = (this.speed / 1000) * p.deltaTime;
            this.movePlayer(moveBy);

            if(this._lastMoveWasZero){
                switch(this.direction) {
                    case "up": this.setAnim("idle-up"); break;
                    case "down": this.setAnim("idle-down"); break;
                    default: this.setAnim("idle-side"); break;
                }
            }

            const animData = this.anims[this.currentAnim];
            this.currentFrameData = this.setAnimFrame(animData);
        },
        draw(camera:any) {
            this.screenX = this.x + camera.x;
            this.screenY = this.y + camera.y;

            p.push();

            if(this.direction === "right") {
                p.scale(-1, 1);
                p.translate(-2 * this.screenX - this.tileWidth, 0);
            }

            debugMode.drawHitbox(p,this);

            drawTile(
                p,
                this.spriteRef,
                this.screenX + this.spriteX,
                this.screenY + this.spriteY,
                this.currentFrameData.x,
                this.currentFrameData.y,
                this.tileWidth,
                this.tileHeight

            )

            p.pop();
        }
    };
}