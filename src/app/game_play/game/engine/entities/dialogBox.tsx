import { _Globals } from '../utils/globals';

const makeBox = (p:any, x:number, y:number, imageName: string, imageNameMobile?:string) => {
    return {
        x,
        y,
        spriteRef: null,
        spriteRefMobile: null,
        currentTime: 0,
        previousTime: 0,
        line: "",
        lineMobile: "",
        lineChars: [] as string[],
        isVisible: false,
        isComplete: false,
        onCompleteCallback: null as null | (()=> void),
        load(){
            this.spriteRef = p.loadImage(`/assets/${imageName}`);
            if(imageNameMobile) this.spriteRefMobile = p.loadImage(`/assets/${imageNameMobile}`);
        },
        setVisibility(isVisible:boolean){
            this.isVisible = isVisible;
        },
        displayText(content:string, contentMobile?:string){
            this.line = content;
            this.lineMobile = contentMobile ?? "";
            this.isComplete = false;
        },
        clearText(){
            this.line = "",
            this.lineMobile = "",
            this.lineChars = [];
            this.isComplete = false;
        },
        update(){
            if(!this.isVisible) return;
            this.currentTime += p.deltaTime;
            const durationPerFrame = 1000 / 15;
            if(this.currentTime >= durationPerFrame){
                this.currentTime -= durationPerFrame;

                if(this.isComplete) return;

                this.isComplete = true;
                return;
            }
        },
        draw(){
            p.fill("white");
            p.textSize(16);
        },
    }
}

export const makeDialogBox = (p:any, x:any, y:any) => {
    const box = makeBox(p,x,y,"overlay_message.png", "overlay_message_mobile.png");
    return {
        ...box,
        displayTextImmediately(content:string) {
            this.line = content;
            this.lineChars = [];
            this.isComplete = true;
            this.onCompleteCallback = null;
        },

        displayText(content:string, onComplete?: () => void) {
            this.line = "";
            this.lineChars = content.split("");
            this.isComplete = false;
            this.onCompleteCallback = onComplete ?? null;
        },

        update() {
            if (this.isVisible){
                this.currentTime += p.deltaTime;
                const durationPerFrame = 1000 / 15;
                if (this.currentTime >= durationPerFrame) {
                    this.currentTime -= durationPerFrame;
                    if(!this.isComplete){
                        const nextChar = this.lineChars.shift();
                        if (!nextChar) {
                            this.isComplete = true;
                            this.onCompleteCallback?.();
                            return;
                        }
                        this.line += nextChar;
                    }else{ return }
                }
            }else{ return }
        },
        draw() {
            if (!this.isVisible) return;
            box.draw();

            p.fill("black");

            if(_Globals.width < _Globals.mobileWidth){
                p.textSize(10);
                p.image(this.spriteRefMobile, this.x-4, this.y);
                p.text(this.line, this.x + 18, this.y + 36);
            }else{
                p.image(this.spriteRef, this.x, this.y);
                p.text(this.line, this.x + 30, this.y + 42);
            }
        },
    };
}

export const makeRoomBox = (p:any, x:any, y:any) => {
    const box = makeBox(p,x,y,"overlay_room.png", "overlay_room_mobile.png");
    return {
        ...box,
        draw(){
            if(!this.isVisible) return;
            box.draw();
            if(_Globals.width < _Globals.mobileWidth){
                p.textSize(12);
                p.image(this.spriteRefMobile, this.x, this.y);
            }else{
                p.image(this.spriteRef, this.x, this.y);
            }
            p.text(this.line, this.x + 26, this.y + 42);
        }
    }
}

export const makeMonitorBox = (p:any, x:number, y:number) => {
    const box = makeBox(p,x,y,"overlay_monitor.png","overlay_monitor_mobile.png");
    return {
        ...box,
        draw(){
            if(!this.isVisible) return;
            box.draw();
            // p.image(this.spriteRef, this.x, this.y);
            // p.text(this.line, this.x + 26, this.y + 42);
            if(_Globals.width < _Globals.mobileWidth){
                p.textSize(9);
                p.image(this.spriteRefMobile, _Globals.width / 2 -(335/2), this.y+10);
                p.text(this.lineMobile, _Globals.width / 2 -(335/2) + 32, this.y+10 + 42);
            }else{
                p.image(this.spriteRef, _Globals.width / 2 -(764/2), this.y+10);
                p.text(this.line, _Globals.width / 2 -(764/2) + 26, this.y+10 + 42);
            }
        }
    }
}