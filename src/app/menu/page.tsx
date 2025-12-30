import { Header2word, BtmClrBnnr } from "../components/";
import { MenuLinks, menuItemType } from "../components/";

const menuItems: menuItemType[] = [
  {id:"game-menu", href:"/game_menu", title:"", name:"Rozpocznij", start:true, disabled: false},
  {id:"authors", href:"/authors", title:"", name:"Autorzy", start:false, disabled: false},
  {id:"scoreboard", href:"/scoreboard", title:"", name:"Tablica\u000AWyników", start:false, disabled: false}
]

export default function Menu() {
  return (
    <main className="monitor-screen">
      <Header2word props={{word1: "POZNAJ", word2: "MERITO"}} />
      
      <MenuLinks items={menuItems}/>

      <BtmClrBnnr />
    </main>
  );
}
