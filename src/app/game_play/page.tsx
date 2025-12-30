'use client';

import { useRouter } from 'next/navigation';
import { Button, Table } from 'react-bootstrap';

import { Buttons as CompBtns } from "../components/";

import { BackBtn, Header2word } from '../components';

import Link from 'next/link';

export default () => {
    const router = useRouter();

    return(
        <main className="monitor-screen">
            <Header2word props={{word1: "the", word2: "game"}} />
            
            <BackBtn />
        </main>
    )
}