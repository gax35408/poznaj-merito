import { useCallback, useEffect, useMemo } from 'react';

import "./table.css";

type Props = {
    data: any,
    exact?: any
}

export const Scoreboard = ({data, exact}:Props) => {
    const compare = useCallback((a:any, b:any) => (parseInt(b.score) - parseInt(a.score)) || (a.date - b.date),[]);
    const sorted = useMemo(() => (data ? [...data].sort(compare) : []), [data, compare]);

    return(
        <div className='overflow-table font-[family-name:var(--font-press-start-2p)] d-flex flex-col my-auto align-items-center'>
            <table className='own-table'>
                <thead>
                    <tr>
                    <th scope="col" style={{textAlign: "end"}}>#</th>
                    <th scope="col"><span className='span-color'>|</span>Nick</th>
                    <th scope="col"><span className='span-color'>|</span>Punktacja</th>
                    <th scope="col"><span className='span-color'>|</span>Data</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        sorted?.map((el, index):any => {
                            const check = el.name == exact?.name && el.score == exact?.score && el.date == exact?.date ? 'text-light' : '';
                            return(
                                <tr key={(index + 1) + el.name + el.score + el.date}>
                                    <th className={check} scope="row" style={{textAlign: "end"}}>{index+1}</th>
                                    <td className={check}><span className='span-color'>|</span>{el.name}</td>
                                    <td className={check}><span className='span-color'>|</span>{el.score}</td>
                                    <td className={check}><span className='span-color'>|</span>{(el.date).toISOString().split("T")[0].slice(2).replace(/-/g, '/')} <span className='date-time'>{(el.date).toISOString().split("T")[1].split(".")[0].slice(0,5) }</span></td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}