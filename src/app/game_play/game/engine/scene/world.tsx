import { makeNPC, animDirectionType } from "../entities/npc";
import { makeCamera } from "../entities/camera";
import { makePlayer } from "../entities/player";
import { makeTiledMap } from "../entities/map";
import { makeDialogBox, makeMonitorBox, makeRoomBox } from "../entities/dialogBox";
import { tilesetsPaths, defaultMap } from "../properties/mapsPaths";
import { npcsByMap } from "../properties/npcsByMap";

import { QuestManager } from "../entities/quests";
import { PortalRegistry } from "../utils/portalRegistry";

import { VirtualKeys } from "../utils/keysMobile";

import { _Globals } from "../utils/globals";

export const makeWorld = (p:any, setScene:any) => {
    return{
        camera: makeCamera(p, 100, 0),
        player: makePlayer(p, 0, 0),
        npcs: [] as ReturnType<typeof makeNPC>[],
        map: makeTiledMap(p, 0, 0),
        currentMapUrl: `/maps/${defaultMap}`,
        dialogBox: makeDialogBox(p, 10, 0),
        roomBox: makeRoomBox(p, 10, 10),
        monitorBox: makeMonitorBox(p, 100, 10),
        awaitNextOnE: undefined as undefined | (() => void),
        currentLineText: "" as string,
        interact: undefined as undefined | (() => void),
        isTransitioning: false,
        transitionPhase: 'idle' as 'idle' | 'fadeIn' | 'loading' | 'fadeOut',
        alpha: 0,
        easing: 2,
        blinkBlack: false,        
        endPhase: 'none' as 'none'|'ending'|'ended',
        endText: '' as string,
        endResult: '' as string,

        _getObjName(o: any) {
            const n1 = (o?.name ?? "").trim();
            if(n1) return n1;
            const props = Array.isArray(o?.properties) ? o.properties : [];
            const byProp = 
                props.find((p:any) => p.name === "name")?.value ??
                props.find((p:any) => p.name === "id")?.value ??
                "";
            return String(byProp).trim();
        },
        _findSpawn(name?: string, fallback = "player") {
            const spawns: any[] = this.map.getSpawnPoints() ?? [];
            const target = String(name ?? "").trim().toLowerCase();
            const match = (wanted: string) =>
                spawns.find((s) => this._getObjName(s).toLowerCase() === wanted);
            return (target && match(target)) ?? match(fallback) ?? null;
        },
        _getObjProps(objName: string){
            const layers = this.map.tiledData?.layers ?? [];
            for (const l of layers) {
                if(l.type !== 'objectgroup' || !Array.isArray(l.objects)) continue;
                for (const obj of l.objects){
                    const name = this._getObjName(obj);
                    if(name&&name.toLowerCase() === objName.toLowerCase()){
                        const propsArr = Array.isArray(obj.properties) ? obj.properties : [];
                        return Object.fromEntries(propsArr.map((p:any) => [p.name, p.value]));
                    }
                }
            }
            return {};
        },
        _performPendingMapSwap: undefined as undefined | (() => void),
        _rebuildNpcsForMap(mapUrl: string) {
            const cfgs = npcsByMap[mapUrl] ?? [];
            this.npcs = cfgs.map(cfg => {
                const npcProps = this._getObjProps(cfg.spawn ?? "npc");
                const npc = makeNPC(
                    p,
                    0, 0,
                    String(npcProps.asset ?? cfg.asset),
                    {
                        x: cfg.collisionSize?.x || Number(npcProps.collisionSizeX) || 0,
                        y: cfg.collisionSize?.y || npcProps.collisionSizeY || 0
                    },
                    {
                        x: cfg.spriteMove?.x || Number(npcProps.spriteMoveX) || 0,
                        y: cfg.spriteMove?.y || npcProps.spriteMoveY || 0
                    },
                    npcProps.animDirection as animDirectionType
                );
                
                (npc as any).id = cfg.id;
                (npc as any).name = cfg.name;

                const rawDialog = npcProps.dialog;
                let dialogLines: string[] | undefined;

                if(Array.isArray(rawDialog)){
                    dialogLines = rawDialog.map(String);
                }else if(typeof rawDialog === 'string'){
                    try{
                        const parsed = JSON.parse(rawDialog);
                        if(Array.isArray(parsed)){
                            dialogLines = parsed.map(String);
                        }else{
                            // dialogLines = rawDialog.split('\n');
                            dialogLines = [String(rawDialog)];
                            // throw () => {};
                        }
                    }catch(e){
                        
                        if (rawDialog.trim().startsWith('[') &&
                            rawDialog.trim().endsWith(']') ) {
                                const inner = rawDialog.trim().slice(1, -1);
                                dialogLines = inner
                                    .split(/"\s*,\s*"/)
                                    .map(s => s.replace(/^"+|"+$/g, ''));
                        } else {
                            dialogLines = [String(rawDialog)];
                        }

                    }
                }
                (npc as any).dialog = dialogLines ?? (cfg.dialog ?? ["..."]);
                // (npc as any).dialog = cfg.dialog;
                npc.load();
                npc.setup();
                this._placeNpcAtSpawn(npc, cfg.spawn ?? "npc");
                (npc as any).spawnName = cfg.spawn ?? "npc";
                (npc as any).questId = npcProps.questId ? String(npcProps.questId) : (cfg as any).questId;
                
                return npc;
            });
        },
        load(initialMapUrl?: string) {
            this.currentMapUrl = initialMapUrl ?? this.currentMapUrl;
            this.map.load(tilesetsPaths, this.currentMapUrl, () => {
                this.dialogBox.load();
                this.roomBox.load();
                this.monitorBox.load();
                this.map.prepareTiles();
                PortalRegistry.register(this.currentMapUrl, this.map.portals);
                this.player.load();
                this._placePlayerAtSpawn("player");
                this._rebuildNpcsForMap(this.currentMapUrl);
            });
        },
        _placeEntityAtSpawn(entity: {x:number, y:number}, name?: string, fallback="player"){
            const spawn = this._findSpawn(name, fallback);
            if(!spawn) {
                console.warn("[WORLD] Spawn not found:", name ?? `(fallback: ${fallback})`);
                return;
            }
            entity.x = this.map.x + spawn.x;
            entity.y = this.map.y + spawn.y;
        },
        _placePlayerAtSpawn(name?: string){
            this._placeEntityAtSpawn(this.player, name, "player");
        },
        _placeNpcAtSpawn(npc: ReturnType<typeof makeNPC>, name?: string){
            this._placeEntityAtSpawn(npc, name, "npc");
        },
        startNpcDialog(npc: ReturnType<typeof makeNPC>){
            if(this.dialogBox.isVisible) return;
            const lines: string[] = (npc as any).dialog ?? ["..."];
            let i = 0;

            const finish = () => {
                this.dialogBox.setVisibility(false);
                this.player.freeze = false;
                this.awaitNextOnE = undefined;

                
                const current = QuestManager.getCurrent();
                const qid: string | undefined = (npc as any).questId;
                const spawnName: string | undefined = (npc as any).spawnName;

                const shouldComplete =
                    (!!current && qid === current.id) ||
                    (!!current && current.id === 'quest1' && spawnName === 'npc_map2_1');

                if(shouldComplete){
                    QuestManager.completeCurrent();
                    QuestManager.getCurrent()?.onStart?.();
                }

                // const qid: string | undefined = (npc as any).questId;
                // if(qid) {
                //     if(QuestManager.getCurrent()?.id === qid){
                //         QuestManager.completeCurrent();
                //         QuestManager.getCurrent()?.onStart?.();
                //     }
                // }
            }
            const showLine = (text: string) => {
                this.currentLineText = text;
                this.dialogBox.clearText();
                this.dialogBox.setVisibility(true);
                this.dialogBox.displayText(text, ()=>{});
            }
            const showNext = () => {
                if(i>=lines.length){
                    finish();
                    return;
                }
                showLine(lines[i++]);
            };
            const start = () => {
                i=0;
                showNext();
                
                this.awaitNextOnE = () => {
                    if(!this.dialogBox.isComplete){
                        this.dialogBox.displayTextImmediately(this.currentLineText);
                        return;
                    }

                    showNext();
                };
            }

            this.player.freeze = true;
            start();

        },
        transitionTo(targetMap: string, targetSpawn?: string) {
            if(this.isTransitioning || !targetMap) return;

            this.isTransitioning = true;
            this.player.freeze = true;

            this.transitionPhase = 'fadeIn';
            this._performPendingMapSwap = () => {
                const once = this._performPendingMapSwap;
                this._performPendingMapSwap = undefined;
                if(!once) return;

                this.currentMapUrl = targetMap;
                this.map.load(tilesetsPaths, targetMap, async() => {
                    this.roomBox.clearText();
                    this.roomBox.setVisibility(false);
                    this.monitorBox.clearText();
                    this.monitorBox.setVisibility(false);
    
                    this.map.prepareTiles();
                    PortalRegistry.register(this.currentMapUrl, this.map.portals);

                    this._placePlayerAtSpawn(targetSpawn ?? "player");
                    this._rebuildNpcsForMap(this.currentMapUrl);
                    this.camera.attachTo(this.player);

                    this.player.freeze = false;
                    this.isTransitioning = false;

                    this.transitionPhase = 'fadeOut';
                })
                
            }

        },
        finishGame(resultText: string, resultParam: string) {
            if (this.endPhase !== 'none') return;
            this.player.freeze = true;
            this.endText = resultText;
            this.endResult = resultParam;
            this.endPhase = 'ending';
            this.transitionPhase = 'fadeIn';
            this.isTransitioning = true;
        },
        setup() {
            this.player.setup();
            this.camera.attachTo(this.player);

            QuestManager.init([
                {
                    id: 'quest1',
                    description: 'q1_description',
                    onStart: () => {
                    },
                    onComplete: () => {
                        PortalRegistry.deactivatePortal("/maps/map_1_inside_p0a.json", "quest1-after-lock");
                    },
                    isComplete: false,
                },
                {
                    id: 'quest2',
                    description: 'q2_description',
                    onStart: () => {
                        PortalRegistry.activatePortal("/maps/map_0_outside.json", "quest2");
                    },
                    onComplete: () => {
                    },
                    isComplete: false,
                }
            ]);
            QuestManager.getCurrent()?.onStart?.();
        },
        update() {
            this.camera.update();
            this.player.update();
            this.dialogBox.update();
            this.roomBox.update();
            this.monitorBox.update();

            const speed = 0.7 * this.easing * p.deltaTime;
            switch(this.transitionPhase){
                case 'fadeIn': {
                    this.alpha = Math.min(255, this.alpha + speed);
                    if(this.alpha >= 255){
                        if(this.endPhase === 'ending'){
                            const ev = new CustomEvent('gameEnd', { detail: { result: this.endResult}});
                            window.dispatchEvent(ev);
                            this.endPhase = 'ended';
                        }else{
                            this.transitionPhase = 'loading';
                        }
                    }
                    break;
                }
                case 'loading': {
                    this._performPendingMapSwap?.();
                    break;
                }
                case 'fadeOut': {
                    this.alpha = Math.max(0, this.alpha - speed);
                    if(this.alpha <= 0){
                        this.transitionPhase = 'idle';
                    }
                    break;
                }
                case 'idle':
                default:
                    break;
            }

            for(const npc of this.npcs) {
                npc.update();
                if(this.dialogBox.isVisible) continue;
                npc.handleCollisionsWith(this.player, () => {
                    // console.log('akcja z NPC');
                    this.startNpcDialog(npc);
                });
            }

            const portal = this.map.checkPortals(this.player);
            
            if(portal) {
                if(portal.questPortalId === 'quest2' && portal.active == true){
                    this.finishGame('Koniec gry', '10102030');
                    portal.active = false;
                }else if(portal.active == true){
                    this.transitionTo(portal.targetMap, portal.targetSpawn);
                    if(portal.once) portal.active = false;
                };
            }
            
            const room = this.map.checkRooms(this.player);
            const monitor = this.map.checkMonitors(this.player);
            
            if(room) {
                // show roomBox
                const roomName: string = (room as any).roomName ?? "000";
                if(!this.roomBox.isVisible){
                    this.roomBox.clearText();
                    this.roomBox.setVisibility(true);
                    this.roomBox.displayText(roomName);
                }
                // console.log(`room: ${roomName}`);
            }else{
                this.roomBox.clearText();
                this.roomBox.setVisibility(false);
            }
            

            if(monitor) {
                // show monitorBox
                const monitorPlan: string = (monitor as any).monitorPlan ?? "PLAN";
                const monitorPlanMobile: string = (monitor as any).monitorPlanMobile ?? "PLAN MOBILE";
                if(!this.monitorBox.isVisible){
                    this.monitorBox.clearText();
                    this.monitorBox.setVisibility(true);
                    this.monitorBox.displayText(monitorPlan, monitorPlanMobile);
                };
            }else{
                this.monitorBox.clearText();
                this.monitorBox.setVisibility(false);
            }
        },
        draw() {
            p.clear();
            p.background(0);

            this.map.drawBackgroundLayers(this.player, this.camera);

            for(const npc of this.npcs) npc.draw(this.camera);
            this.player.draw(this.camera);

            this.map.drawForegroundLayers(this.player, this.camera);

            // console.log(_Globals.height);
            // this.dialogBox.x = 0;
            this.dialogBox.y = _Globals.height - 172;
            this.dialogBox.draw();
            this.roomBox.draw();
            this.monitorBox.draw();

            if(this.alpha > 0){
                const a = p.constrain(this.alpha, 0, 255);
                p.noStroke();
                p.fill(0,0,0,a);
                p.rect(0,0,p.width,p.height);

                if(this.endPhase === 'ending' || this.endPhase === 'ended') {
                    p.fill(255);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.textSize(36);
                    p.text(this.endText || 'KONIEC', p.width/2, p.height/2);
                }
            }
        },
        keyReleased() {
            for (const key of [
                p.RIGHT_ARROW,
                p.LEFT_ARROW,
                p.UP_ARROW,
                p.DOWN_ARROW,
            ]) {
                if (p.keyIsDown(key)) { return }
            }

            switch (this.player.direction) {
                case "up":
                this.player.setAnim("idle-up");
                break;
                case "down":
                this.player.setAnim("idle-down");
                break;
                case "left":
                case "right":
                this.player.setAnim("idle-side");
                break;
                default:
            }

            
            const any =
                p.keyIsDown(p.RIGHT_ARROW) || p.keyIsDown(p.LEFT_ARROW) ||
                p.keyIsDown(p.UP_ARROW)    || p.keyIsDown(p.DOWN_ARROW) ||
                VirtualKeys.has('ArrowRight') || VirtualKeys.has('ArrowLeft') ||
                VirtualKeys.has('ArrowUp')    || VirtualKeys.has('ArrowDown');

            if (!any) {
                switch (this.player.direction) {
                case "up":   this.player.setAnim("idle-up");   break;
                case "down": this.player.setAnim("idle-down"); break;
                default:     this.player.setAnim("idle-side"); break;
                }
            }

        },
    }
}