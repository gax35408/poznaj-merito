'use client';

import { useRouter } from 'next/navigation';
import { BackBtn, Header2word } from './components';

export default () => {
    const router = useRouter();

    return(
        <main className="monitor-screen">
            <Header2word props={{word1: "Error 404", word2: "- Page not found"}} />
            <div className='d-flex h-75 justify-content-center align-items-center'>
                <BackBtn mainMenu={true} />
            </div>
        </main>
    )
}