'use client';
import { BackBtn, Header2word, Scoreboard } from '../components';
import {defaultData} from "./default_data";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import CryptoJS from 'crypto-js';
import { hash } from "../game_play/game/engine/hashscore";

type TypeData = { name: string, score: string, date: any}

const ScoreboardPage = () => {
    const searchParams = useSearchParams();
    const encryptedData = searchParams.get('data');

    
    const [data, setData] = useState<TypeData[]>([]);
    // const [decrypted, setDecrypted] = useState<any>();
    const [decrypted, setDecrypted] = useState<TypeData>({name:"",score:"",date:null});
    const [newData, setNewData] = useState<TypeData>({name:"",score:"",date:null});


    
    useEffect(() => {
        if(encryptedData){
            try{
                const bytes = CryptoJS.AES.decrypt(encryptedData, hash);
                const originalText = bytes.toString(CryptoJS.enc.Utf8);
                if(originalText){
                    setDecrypted(JSON.parse(originalText));
                }
            }catch(e){
                console.error("Error:"+e);
            }
        }
        
        
    },[searchParams]);
    
    useEffect(()=>{
        setData(defaultData);
        if(decrypted){
            setNewData({
                name: decrypted.name,
                score: decrypted.score,
                date: new Date(decrypted.date)
            });
        }
 
    },[decrypted]);
    
    useEffect(()=> {
        if(newData.name && newData.score && newData.date && !data.includes(newData)){
            setData(prevItems => [...prevItems, newData]);
        }
    },[newData]);

    return(
        <main className="monitor-screen">
            <Header2word props={{word1: "tablica", word2: "wyników"}}/>

            { data.length !== 0 &&
                <Scoreboard data={data} exact={newData}/>
            }

            { data.length !== 0 &&
                <BackBtn />
            }
            
        </main>
    )
}

export default () => {
    return(
        <Suspense fallback={<div>Ładowanie...</div>}>
            <ScoreboardPage />
        </Suspense>
    )
}