import type p5Types from 'p5';

function makeDebugMode() {
  return {
    enabled: false,
    lastFpsUpdate: 0,
    fpsLabel: '0' as string | number,
    drawFpsCounter(p:p5Types) {
      if (!this.enabled) return;
      const now = p.millis();
      if(now - this.lastFpsUpdate >= 100){
        this.fpsLabel = Math.round(p.frameRate());
        this.lastFpsUpdate = now;
      }
      p.push();
      p.fill("yellow");
      p.textSize(16);
      // p.text(Math.trunc(p.frameRate()), 10, 30);
      p.text(this.fpsLabel, 10, 30);
      p.pop();
    },

    toggle() {
      this.enabled = !this.enabled;
    },

    drawHitbox(p:any, hitbox:any, type?:string) {
      if (!this.enabled) return;
      switch(type){
        case("portal"):
          p.fill(255, 255, 0, 63);
          break;
        case("monitor"):
          p.fill(0, 128, 255, 63);
          break;
        case("room"):
          p.fill(255, 0, 128, 63);
          break;
        default:
          p.fill(255, 0, 0, 63);
          break;
      }
      const angle = (hitbox.rotationDeg ?? 0) * Math.PI / 180;
      if(!angle){
        p.rect(hitbox.screenX, hitbox.screenY, hitbox.width, hitbox.height);
        return;
      }
      p.push();
      p.translate(hitbox.screenX, hitbox.screenY);
      p.rotate(angle);
      p.rect(0,0, hitbox.width, hitbox.height);
      p.pop();
    },
  };
}

const _global = typeof window !== 'undefined' ? (window as any) : {};
export const debugMode = _global.__debugMode ?? (_global.__debugMode = makeDebugMode());
