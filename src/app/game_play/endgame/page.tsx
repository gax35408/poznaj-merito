'use client';
import React from "react";
import { useEffect, useRef, useState } from "react";
import { BackBtn, Header2word } from '../../components';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { sha256Hex, hash } from "../game/engine/hashscore";
import CryptoJS from 'crypto-js';

import "./endgame.css";

const EndgamePage = () => {
    const searchParams = useSearchParams();
    const score = searchParams.get('score') ?? "";
    const sig = searchParams.get('sig') ?? "";
    const [valid, setValid] = React.useState<boolean | null>(null);

    useEffect(() => {
        (async () => {
            const expected = await sha256Hex(score + hash);
            setValid(expected === sig);
        })();
    },[score,sig]);

    const [letters, setLetters] = useState(["", "", ""]);
    const [btnStatus, setBtnStatus] = useState(true);
    const inputsRef:any = useRef([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
        inputsRef.current[0]?.select();
    }, []);

    const focusIndex = (idx: any) => {
        inputsRef.current[idx]?.focus();
        inputsRef.current[idx]?.select?.();
    };

    const handleChange = (idx:any) => (e:any) => {
        const ch = e.target.value.slice(-1);
        setLetters((prev) => {
            const next = [...prev];
            next[idx] = ch;
            return next;
        });
        if (ch && idx < inputsRef.current.length - 1) {
            focusIndex(idx + 1);
        }
    };

    const handleKeyDown = (idx:any) => (e:any) => {
        if (e.key === "Backspace") {

        if (!letters[idx] && idx > 0) {
            e.preventDefault();
            setLetters((prev) => {
                const next = [...prev];
                next[idx - 1] = "";
                return next;
            });
            focusIndex(idx - 1);
        }

        return;
        }

        
        const isCharKey = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
        if (isCharKey && idx < inputsRef.current.length - 1) {
            requestAnimationFrame(() => focusIndex(idx + 1));
        }

        if (e.key === "ArrowLeft" && idx > 0) {
            e.preventDefault();
            focusIndex(idx - 1);
        } else if (e.key === "ArrowRight" && idx < inputsRef.current.length - 1) {
            e.preventDefault();
            focusIndex(idx + 1);
        }

    };

    const handlePaste = (e:any) => {
        const raw = e.clipboardData.getData("text");
        if (!raw) return;
        e.preventDefault();
        const chars = raw.replace(/\s+/g, "").slice(0, 3).split("");

        setLetters((prev) => {
            const next = [...prev];
            for (let i = 0; i < 3; i++) next[i] = chars[i] ?? "";
            return next;
        });

        const nextIdx = Math.min(chars.length, 2);
        focusIndex(nextIdx);
    };

    
    const handleFocus = (e:any) => {
        requestAnimationFrame(() => e.target.select());
    };

    const handleMouseDown = (e:any) => {
        e.preventDefault();
        const el = e.currentTarget;
        el.focus();
        el.select();
    };

    const handleTouchStart = (e:any) => {
        const el = e.currentTarget;
        setTimeout(() => {
            el.focus();
            el.select();
        }, 0);
    };

    const inputs = [0, 1, 2];

    useEffect(() => {
        setBtnStatus(!letters.every(ch => ch.trim() !== ""))
    },[letters]);

    const [encryptedData,setEncryptedData] = useState<any>();

    useEffect(()=> {
        if(letters.every(l => l.trim() !== "")&&score){
            const newDate = new Date();
            const lettersString = letters.join("");
            setEncryptedData(
                CryptoJS.AES.encrypt(JSON.stringify({"name":lettersString,"score":score,"date":newDate}), hash).toString()
            );
        }
    },[letters,score]);

    return(
        <main className="monitor-screen">
            <Header2word props={{word1: "Koniec", word2: "gry"}} />
            
        { valid === null ? (
            <div className="d-flex flex-col my-auto">
                <div className='d-flex flex-col justify-content-center gap-5'>
                    <div className='mid-txt light m-auto'>
                        Weryfikacja...
                    </div>
                </div>
            </div>
        ) : valid ? (
            <div className='d-flex flex-col my-auto'>
                <div className='d-flex flex-col justify-content-center gap-5'>
                    <div className='mid-txt light m-auto'>
                        Twój wynik: {score} PKT
                    </div>
                    <div onPaste={handlePaste} className='mid-txt light d-flex flex-row justify-content-center align-content-center'>
                        {
                            inputs.map((i) => (
                                <input
                                key={i}
                                id={`letter-${i + 1}`}
                                ref={(el:any) => (inputsRef.current[i] = el)}
                                type="text"
                                inputMode="text"
                                maxLength={1}
                                className="letter"
                                placeholder="_"
                                value={letters[i]}
                                onChange={handleChange(i)}
                                onKeyDown={handleKeyDown(i)}
                                onFocus={handleFocus}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleTouchStart}
                                autoComplete="off"
                                />
                            ))
                        }
    
                    </div>
                </div>
            </div>
        ) : (
            <div className="d-flex flex-col my-auto">
                <div className='d-flex flex-col justify-content-center gap-5'>
                    <div className='mid-txt light m-auto text-center'>
                        Błąd wyniku<br/>ktoś próbuje oszukać!
                    </div>
                    <BackBtn props={{title: "RESTART", href:"/game_play/game" }} />
                </div>
            </div>
        )}
        { valid ? (
            <BackBtn props={{title: "zapisz wynik", href:`/scoreboard?endgame=true&data=${encodeURIComponent(encryptedData)}`, disabled: btnStatus}} />
            // <BackBtn props={{title: "zapisz wynik", href:`/scoreboard?endgame=true&name=${letters?.toString().replace(/,/g,"")}&score=${score}&date=${new Date()}&data=${encryptedData}`, disabled: btnStatus}} />
        ): <></> }
        </main>
    )
}


export default () => {
    return(
        <Suspense fallback={<div>Ładowanie...</div>}>
            <EndgamePage />
        </Suspense>
    )
}