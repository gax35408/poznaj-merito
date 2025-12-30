export const makeCamera = (p:any, x:any, y:any) => {
    return {
        x,
        y,
        entity: null as any,
        attachTo(entity:any) {
            this.entity = entity;
        },
        update() {
            const nx = -this.entity.x + p.width / 2;
            const ny = -this.entity.y + p.height / 2;
            this.x = (nx + 0.5)|0;
            this.y = (ny + 0.5)|0;
        }
    }
}