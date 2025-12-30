import type p5 from 'p5';
import { _Globals } from '../utils/globals';

export function makeMenu(p: p5) {
  return {
    startScreenImgRef: null as any,
    startTextImgRef: null as any,
    easing: 0.5,
    alpha: 255,
    blinkBack: false,
    load() {
        this.startScreenImgRef = p.loadImage("/assets/Gdynia.jpg");
        //   this.startTextImgRef = p.loadImage("/assets/start.png");
    },
    update() {
        if (this.alpha <= 0) this.blinkBack = true;
        if (this.alpha >= 255) this.blinkBack = false;

        if (this.blinkBack) {
            this.alpha += 0.7 * this.easing * p.deltaTime;
        } else {
            this.alpha -= 0.7 * this.easing * p.deltaTime;
        }
    },
    draw() {
        p.clear(0,0,0,0);
        p.image(this.startScreenImgRef, 0, 0, _Globals.width, _Globals.height);
        this.startScreenImgRef.resize(1024, 1024);
        p.tint(255, this.alpha);
        //   p.image(this.startTextImgRef, 0, 320);
        // p.textAlign(CENTER);
        p.text("Poznaj Merito",_Globals.width/2-60,_Globals.height/2);
        p.noTint();
    },
  };
}