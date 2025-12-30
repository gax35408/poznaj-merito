import Image from "next/image";
"use client";

import { Loading } from './components/';

export default function Home() {

  return (
    <main className="monitor-screen font-[family-name:var(--font-press-start-2p)]">

      <Loading props={{href: "/menu", timeToRefresh: 800, titleOnStart:"Ładowanie"}} />

      <footer className="sm-txt dark row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        wersja 0.1
      </footer>

    </main>
  );
}

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         {/* <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         /> */}
//         start

//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         footer
//       </footer>
//     </div>
//   );
// }
