type FramePos = { x: number; y: number };

export const makeCharacter = (p:any,collisionSizeX?:any, collisionSizeY?:any) => {
    return {
        spriteRef: null,
        anims: {} as any,
        currentAnim: null as any,
        currentFrame: 0,
        currentFrameData: null as any,
        animationTimer: 0,
        previousTime: 0,
        tileWidth: 32,
        tileHeight: 48,
        width: collisionSizeX | 32,
        height: collisionSizeY | 32,
        direction: null as any,
        frames: [] as FramePos[],
        setAnim(name:any) {
            if(this.currentAnim !== name) {
                this.currentAnim = name;
                this.currentFrame = 0;
                this.animationTimer = 0;
                this.previousTime = 0;
            }
        },
        setDirection(direction:any) {
            if(this.direction !== direction) this.direction = direction;
        },
        setAnimFrame(animData:any) {
            if(typeof animData === "number") {
                this.currentFrame = animData;
                return this.frames[this.currentFrame];
            }

            if(this.currentFrame === 0) {
                this.currentFrame = animData.from;
            }

            if(this.currentFrame > animData.to && animData.loop) {
                this.currentFrame = animData.from;
            }

            const currentFrame:any = this.frames[this.currentFrame];

            const durationPerFrame = 1000 / animData.speed;
            if(this.animationTimer >= durationPerFrame) {
                this.currentFrame++;
                this.animationTimer -= durationPerFrame;
            }

            return currentFrame;
        }
    }
}