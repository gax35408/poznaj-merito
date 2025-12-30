import { makeCollidable } from "./collisions";


export namespace Types {

    export type Boundaries = ReturnType<typeof makeCollidable>;
    
    export type TileSetEntry = {
      firstgid: number;
      image: any;
      tilePos: { x: number; y: number }[];
    };
    
    export type Portals = ReturnType<typeof makeCollidable> & {
        name: string;
        targetMap: string;
        targetSpawn?: string;
        once?: boolean;
        active: boolean;
        questPortalId?: string;
    }
    
    export type Rooms = ReturnType<typeof makeCollidable> & {
        roomName: string;
    }
    
    export type Monitors = ReturnType<typeof makeCollidable> & {
        monitorPlan: string;
        monitorPlanMobile: string;
    }
    
    export type Doors = {
        x: number; y: number; w: number; h: number;
        layerName: string;
        frames: number[];                 // GIDs kolejnych klatek
        blocking: boolean;
        autoCloseMs?: number;
        state: 'closed'|'opening'|'open'|'closing';
        frameIndex: number;
        timer: number;                    // ms akumulator
        collidable: ReturnType<typeof makeCollidable>; // hitbox gdy zamknięte
    }
    
    export type Texts = {
        x: number; y: number;
        width: number; height: number;
        text: string;
        color?: string;
        fontSize?: number;
        above?: boolean;
    }

}