'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';


type BckBtnType = {
    props?: any;
    mainMenu?: boolean
}


export const BackBtnContent = ({props, mainMenu}:BckBtnType) => {
    const router = useRouter();

    const sp = useSearchParams();
    const query = sp?.get('endgame');

    return(
        <div className="font-[family-name:var(--font-press-start-2p)] font-bold d-flex align-items-center justify-content-center py-2 h-25">
            <div className="mx-auto d-flex flex-col gap-2">
                { (!props && !query && !mainMenu) && <Link href="#" className="btn-menu pixel-corners px-5 py-2 vw-25" onClick={() => router.back()}>Wróć</Link> }
                { (mainMenu || ( query && query == "true")) && <Link href="/menu" className="btn-menu pixel-corners px-5 py-2 vw-25">Menu główne</Link> }
                { (props && props.disabled == true) && <Link href={props.href} className="btn-menu pixel-corners px-5 py-2 vw-25 disabled" onClick={(e)=>e.preventDefault()}>{props.title}</Link> }
                { (props && props.disabled != true) && <Link href={props.href} className="btn-menu pixel-corners px-5 py-2 vw-25">{props.title}</Link> }
            </div>
        </div>
    );
}


export const BackBtn = (props: BckBtnType) => (
  <Suspense fallback={<div>Ładowanie...</div>}>
    <BackBtnContent {...props} />
  </Suspense>
);;