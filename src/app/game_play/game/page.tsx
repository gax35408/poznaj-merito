'use client';
import { useEffect } from 'react';
import { GameEngine } from './engine/game_engine';
import { clearVirtualKeys, pressKey, releaseKey } from './engine/utils/keysMobile';

import "./game.css";

import * as Icons from "react-bootstrap-icons";

export default () => {

    let tiles = [];

    for(let i=0;i<=23;i++){
        tiles.push(i);
    }

    
    
    useEffect(() => {
        const bind = (id: string, code: string) => {
            const el = document.getElementById(id);
            if (!el) return;
            const down = (ev: Event) => { ev.preventDefault(); pressKey(code); };
            const up   = (ev: Event) => { ev.preventDefault(); releaseKey(code); };
            el.addEventListener('pointerdown', down);
            el.addEventListener('pointerup', up);
            el.addEventListener('pointerleave', up);
            el.addEventListener('touchend', up);
            el.addEventListener('touchcancel', up);
            return () => {
                el.removeEventListener('pointerdown', down);
                el.removeEventListener('pointerup', up);
                el.removeEventListener('pointerleave', up);
                el.removeEventListener('touchend', up);
                el.removeEventListener('touchcancel', up);
            };
        };

        const cleanups = [
            bind('key-up',    'ArrowUp'),
            bind('key-down',  'ArrowDown'),
            bind('key-left',  'ArrowLeft'),
            bind('key-right', 'ArrowRight'),
            bind('key-1',     'Action1'),
            bind('key-2',     'Action2'),
            bind('key-3',     'Action3'),
        ].filter(Boolean) as (()=>void)[];
        
        
        const blur = () => clearVirtualKeys();
        const vis  = () => { if (document.visibilityState !== 'visible') clearVirtualKeys(); };

        window.addEventListener('blur', blur);
        document.addEventListener('visibilitychange', vis);

        return () => {
            cleanups.forEach(fn => fn());
            window.removeEventListener('blur', blur);
            document.removeEventListener('visibilitychange', vis);
            clearVirtualKeys();
        };

    }, []);



    return(
        <main className="monitor-screen h-100 font-[family-name:var(--font-press-start-2p)]">
            {/* <div className='d-flex flex-row w-100 justify-content-between text-light'>
                <WhereIs />
                <Info />
            </div> */}

            <div className='h-100 p-2 pad2forMobile h75Mobile' style={{minHeight: 0}}>
                <div className='w-100 h-100 p-2 pad2forMobile' style={{boxSizing:"border-box", minHeight: 0}}>
                    <GameEngine />
                    {/* <div className='d-flex w-100 h-100 m-0 row row-cols-6 game-plan' style={{border: "dashed 1px red"}}>
                    {
                        tiles.map((it,index) => (
                            <div className='col game-box' key={it+index}>
                                {it} / {index}
                            </div>
                        ))
                    }
                    </div> */}
                </div>
                {/* <div className='bg-danger w-25 d-flex m-2'>

                </div> */}
            </div>
            <div id="buttons" className='on-screen-keys text-light h-25 w-100 d-flex p-2 flex-row justify-content-between align-items-center px-4' style={{fontSize: "36px"}}>
                <div className='d-flex flex-col gap-2'>
                    <div className="d-flex flex-row gap-2">
                        <Icons.Square className='opacity-0'/>
                        <Icons.CaretUpSquare id="key-up" className='btn-key' />
                    </div>
                    <div className="d-flex flex-row gap-2">
                        <Icons.CaretLeftSquare id="key-left" className='btn-key' />
                        <Icons.Square className='opacity-0'/>
                        <Icons.CaretRightSquare id="key-right" className='btn-key' />
                    </div>
                    <div className="d-flex flex-row gap-2">
                        <Icons.Square className='opacity-0'/>
                        <Icons.CaretDownSquare id="key-down" className='btn-key' />
                    </div>
                </div>
                <div className='d-flex flex-col gap-2'>
                    <div className="d-flex flex-row gap-2">
                        <Icons.Square className='opacity-0'/>
                        <div id="key-1" className='d-flex flex-row btn-key'>
                            <Icons.Square />
                            <div style={{fontSize: "26px", marginLeft: "-30px"}}>A</div>
                        </div>
                    </div>
                    <div className="d-flex flex-row gap-2">
                        <Icons.Square className='opacity-0'/>
                        <Icons.Square className='opacity-0'/>
                        <div id="key-2" className='d-flex flex-row btn-key'>
                            <Icons.Square />
                            <div style={{fontSize: "26px", marginLeft: "-30px"}}>B</div>
                        </div>
                    </div>
                    <div className="d-flex flex-row gap-2">
                        <Icons.Square className='opacity-0'/>
                        <div id="key-3" className='d-flex flex-row btn-key'>
                            <Icons.Square />
                            <div style={{fontSize: "26px", marginLeft: "-30px"}}>E</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}