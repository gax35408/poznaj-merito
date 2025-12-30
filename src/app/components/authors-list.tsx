type AuthorsListType = {
    children?: any;
    props: any;
}
export const AuthorList = ({children, props}:AuthorsListType) => {
    return(
        <div className='d-flex flex-col my-auto gap-for-phone-5'>
            <div className='d-flex flex-col my-auto gap-2'>
            {
                props.nameList.map((element: any, i:number) => {
                    return(
                        <div className='d-flex flex-row justify-content-center gap-3' key={element.name+element.surname+i}>
                            <div className="mid-txt light">{element.name}</div>
                            <div className="mid-txt dark">{element.surname}</div>
                        </div>
                    )
                })
            }
            </div>
            <div className="font-[family-name:var(--font-press-start-2p)] font-bold d-flex align-items-center justify-content-center h-25">
                <div className="mx-auto d-flex flex-col gap-2">
                    { children && children }
                </div>
            </div>
        </div>
    );
}