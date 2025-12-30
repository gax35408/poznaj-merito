'use client';
import { BackBtn, Header2word, Loading, BottomClear, BtmClrBnnr } from '../../components';


export default () => {

    return(
        <main className="monitor-screen">
            <Header2word props={{word1: "poznaj", word2: "merito"}} />
            <Loading props={{href: "/game_play/game", timeToRefresh:800*3, titleOnStart:"Ładowanie"}} />
            {/* <Loading props={{href: "#"}} /> */}
            <BtmClrBnnr />
        </main>
    )
}