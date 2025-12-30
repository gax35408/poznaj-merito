'use client';
import { useRouter } from 'next/navigation';

import { BackBtn, Header2word } from "../components/";
import { MenuLinks, menuItemType } from "../components/";


const menuItems: menuItemType[] = [
  {id:"game-gdynia", href:"/game_play/loading", name:"Gdynia", title:"", start:true, disabled:false},
  {id:"game-gdansk", href:"#", name:"Gdańsk", title:"Wkrótce dostępne", start:false, disabled:true},
  {id:"game-others", href:"#", name:"Inne\u000Amiasta..", title:"Wkrótce dostępne", start:false, disabled:true}
]


export default () => {
    const router = useRouter();

    return(
        <main className="monitor-screen">
            <Header2word props={{word1: "Wybierz", word2: "Miasto"}} />
            
            <MenuLinks items={menuItems} />
            
            <BackBtn />
        </main>
    )
}