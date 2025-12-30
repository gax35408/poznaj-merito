'use client';
import Link from 'next/link';

import { BackBtn, Header2word, AuthorList } from '../components';

export default function Authors() {

    const nameList = [
        {name:"KAROL",surname:"MARCZAK"},
        {name:"PIOTR",surname:"JAŚKIEWICZ"},
        {name:"ANDRZEJ",surname:"GUTOWSKI"}
    ]

    return(
        <main className="monitor-screen">
            <Header2word props={{word1: "AUTORZY",word2:"APLIKACJI"}} />

            <AuthorList props={{nameList}}>
                <Link href="/authors/about" className="btn-menu pixel-corners px-5 py-2 vw-25">o&nbsp;aplikacji</Link>
            </AuthorList>

            <BackBtn />

        </main>
    )
}