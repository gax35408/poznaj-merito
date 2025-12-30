import Image from 'next/image';
import Link from 'next/link';
import { BottomClear } from "./bottom-clear";

import "./banner.css";

export const BtmClrBnnr = () => {
    return(
        <BottomClear>
            <Link href="https://merito.pl" target="_blank" rel="noopener noreferrer" className="pixel-corners-for-gif w-100">
                    <Image
                        src="/logoMerito3.png"
                        alt="Animacja"
                        width={400}
                        height={91}
                        sizes="100vw"
                        className="banner-image"
                        unoptimized
                        title="Przejdź na stronę Merito.pl"
                    />
                    {/* <Image
                        src="/uniwersytety_animacja.gif"
                        alt="Animacja"
                        width={400}
                        height={91}
                        sizes="100vw"
                        className="banner-image"
                        unoptimized
                        title="Przejdź na stronę Merito.pl"
                    /> */}
                </Link>
        </BottomClear>
    )
}