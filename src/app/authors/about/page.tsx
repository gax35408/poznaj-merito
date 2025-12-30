'use client';
import { BackBtn, Header2word } from '../../components';

export default () => {
    return(
        <main className="monitor-screen">
            <Header2word props={{word1: "o",word2:"aplikacji"}} />

            <div className='d-flex flex-col my-auto'>
                <div className='d-flex flex-row justify-content-center gap-3'>
                    <div className='sm-txt light d-flex text-center'>
                        Aplikacja stworzona w&nbsp;ramach projektu inżynieryjnego.<br/>
                        Beneficjntem projektu jest uczelnia Merito Uniwersytety WSB.<br/><br/>
                        Powstała w&nbsp;2025&nbsp;roku w&nbsp;oparciu o&nbsp;technologie:<br />
                        WordPress (CMS)<br/>
                        NodeJS (Backend)<br/>
                        ReactJS + NextJS (Frontend)<br/>
                        p5.js (Silnik gry)
                    </div>
                </div>
            </div>

            <BackBtn />

        </main>
    )
}