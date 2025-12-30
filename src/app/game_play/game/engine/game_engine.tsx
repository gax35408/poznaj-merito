import dynamic from 'next/dynamic';
import type p5 from 'p5';
import type p5Types from 'p5';
import { makeWorld } from './scene/world';
import { makeMenu } from './scene/menu';
import { debugMode } from './entities/debugMode';

import { _Globals } from './utils/globals';

import { startingMap } from "./properties/mapsPaths";
import { VirtualKeys, eHandledThisPress, setPressHandled, resetPressHandled } from './utils/keysMobile';

import { sha256Hex, hash } from './hashscore';

const Sketch = dynamic(() => import('react-p5').then(m => m.default), { ssr: false });


export const GameEngine = (p:any) => {
    let containerEl: HTMLDivElement | null = null;
    let font: p5.Font;
    let toggledThisPress = false;
    
    let bgm: HTMLAudioElement | null = null;
    let bgmUnlocked = false;
    let removeUnlockers: (() => void) | null = null;
    
    const attachUnlockers = (p5: any) => {
        const tryPlay = () => {
            if (!bgm || bgmUnlocked === true) return;
            bgm.muted = false;
            bgm.volume = 0.0;
            fadeInBgm();
            bgmUnlocked = true;
            removeUnlockers?.();

            bgm.play().catch(err => {
                console.warn('Muted autoplay failed, will retry after interaction', err);
            });
        }
        const onPointerDown = () => tryPlay();
        const onKeyDown = () => tryPlay();

        
        // p5.canvas?.addEventListener('pointerdown', onPointerDown, { passive: true });
        document.addEventListener('keydown', onKeyDown, { capture: true });

        removeUnlockers = () => {
            p5.canvas?.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown, { capture: true } as any);
        };            
    };
    const fadeInBgm = (target = 0.1, step = 0.05, intervalMs = 80) => {
        if (!bgm) return;
        let v = bgm.volume;
        const id = setInterval(() => {
            v = Math.min(target, v + step);
            bgm!.volume = v;
            if (v >= target) clearInterval(id);
        }, intervalMs);
    };

    const scenes = ["menu", "world", "inDialog"];
    let currentScene = "world";
    const setScene = (name:any) => {
        if(scenes.includes(name)) {
            currentScene = name;
        }
    };
    let world: ReturnType<typeof makeWorld>;
    let menu: ReturnType<typeof makeMenu>;

    const preload = (p: p5) => {
        // console.log('preload urls', "/maps/map1.json");
        font = p.loadFont("/assets/PressStart2P-Regular.ttf");
        world = makeWorld(p, setScene);
        menu = makeMenu(p);
        world.load(`/maps/${startingMap}`);
        menu.load();
    }
    
    const setup = (p5: p5, parent: Element) => {
        containerEl = parent as HTMLDivElement;
        _Globals.width = containerEl.clientWidth | 100;
        _Globals.height = containerEl.clientHeight | 100;

        const canvas = p5.createCanvas(_Globals.width, _Globals.height).parent(parent);
        canvas.id('game');     

        requestAnimationFrame(() => {
            windowResized(p5)
        });

        p5.frameRate(30);
        
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1:1;
        p5.pixelDensity(Math.min(dpr,1.5));
        p5.textFont(font);
        p5.noSmooth();
        
        if (!bgm) {
            bgm = new Audio('/assets/3cybermania.mp3');
            bgm.loop = true;

            bgm.muted = true;
            bgm.volume = 0.0;
        }

        attachUnlockers(p5)
        const visHandler = () => {
            if (!bgm) return;
            if (document.hidden) bgm.pause();
            else {
                bgm.play().catch((e) => {console.warn(e)})
            };
        };

        document.addEventListener('visibilitychange', visHandler);
        window.addEventListener('beforeunload', () => {
            document.removeEventListener('visibilitychange', visHandler);
            removeUnlockers?.();
            bgm?.pause();
            bgm = null;
            bgmUnlocked = false;
        });

        const onGameEnd = async(ev: any) => {
            try {
                const score = ev?.detail?.result ?? 'ok';
                const sig = await sha256Hex(String(score) + hash);
                window.location.href = `/game_play/endgame?score=${encodeURIComponent(score)}&sig=${sig}`;
            } catch(e) { console.warn(e); }
        };
        window.addEventListener('gameEnd', onGameEnd);
        
        window.addEventListener('beforeunload', () => {
            document.removeEventListener('visibilitychange', visHandler);
            removeUnlockers?.();
            bgm?.pause();
            bgm = null;
            bgmUnlocked = false;
            window.removeEventListener('gameEnd', onGameEnd);
        });

        world.setup();
    };

    const draw = (p5:p5) => {
        if(VirtualKeys.has('Action3') && !eHandledThisPress){
            handleAction3();
        }

        switch (currentScene) {
            case "menu":
                menu.update();
                menu.draw();
                break;
            case "world":
                world.update();
                world.draw();
                break;
            default:
                break;
        }

        debugMode.drawFpsCounter(p5);
    };
    
    const windowResized = (p5: any) => {
        if (!containerEl) return;
        p5.resizeCanvas(containerEl.clientWidth, containerEl.clientHeight);
        _Globals.width = containerEl.clientWidth;
        _Globals.height = containerEl.clientHeight;
    };

    const handleAction3 = (event?: UIEvent) => {
        if(eHandledThisPress) return;
        setPressHandled(true);

        if(world?.awaitNextOnE) {
            world.awaitNextOnE();
            event && (event as KeyboardEvent).preventDefault();
            return;
        }
        world?.interact?.();
        event && (event as KeyboardEvent).preventDefault();
    };

    const keyPressed = (p5: p5Types, event?: UIEvent) => {
        if (event instanceof KeyboardEvent && event.repeat) return;

        const key = p5.key?.toLowerCase();
        const code = event instanceof KeyboardEvent ? event.code : '';

        if(!toggledThisPress && (key === 'p' || code === 'KeyP' || p5.keyCode === 80)) {
            toggledThisPress = true;
            debugMode.toggle();
            console.log("debug mode on/off");
            event && 'preventDefault' in event && (event as KeyboardEvent).preventDefault();
        }

        if(key === 'enter' && currentScene === 'menu') {
            setScene('world');
            event && 'preventDefault' in event && (event as KeyboardEvent).preventDefault();
        }

        if(key==='e' || code === 'KeyE' || code === 'ShiftRight' || code === 'ShiftLeft') {
            handleAction3(event);
        }
    };  

    const keyReleased = (_p: p5) => {
        toggledThisPress = false;
        setPressHandled(false);
        if (currentScene === 'world') world.keyReleased();
    };

    return(
        <div className="canvas-wrap" style={{width: "100%", height: "100%", boxSizing: "border-box"}}>
            <Sketch
                preload={preload}
                setup={setup}
                draw={draw}
                windowResized={windowResized}
                keyPressed={keyPressed}
                keyReleased={keyReleased}
            />
        </div>
    )
}