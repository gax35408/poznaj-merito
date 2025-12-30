import { NpcConfig } from "../utils/utils";

export const npcsByMap: Record<string, NpcConfig[]> = {
    "/maps/map_1_inside_p0b.json": [
        { 
            spawn: "npc_p0b_1",
            id: "sprzataczka1",
            name:"Sprzątaczka",
            collisionSize: { x: 32.0, y: 48*2 },
        },
        { 
            asset:"npc_wozny.png",
            spawn: "npc_p0_1",
            id: "wozny1",
        },
        {
            asset: "trainer_GENTLEMAN.png",
            spawn: "npc_p0_1b",
            id: "oddzwierny1",
            name:"Uczeń",
            dialog: ["Witaj w WSB Merito!","Musisz koniecznie udać się\ndo Biura Obsługi Studenta!\n\nTam dowiesz się więcej"]},
        ],
    "/maps/map_1_inside_p0a.json": [
        {
            asset: "npc_wozny.png",
            spawn: "npc_p0_1",
            id: "wozny1",
        },
        {
            spawn: "npc_p0_1a",
            id: "bos1",
        },
        {
            asset: "trainer_GENTLEMAN.png",
            spawn: "npc_p0_2a",
            id: "legit1",
            collisionSize: { x:(32*2), y:(32*1.5)},
            spriteMove: {x:1, y:1},
            dialog: ["...","...","..."]
        },
    ],
    "/maps/map2.json": [
        {
            id: "toilet_guy",
            spawn: "npc_map2_1",
            questId: "quest1"
        }
    ]
}