export const Header1word = ({props}:any) => {
    return(<>
        <div className="d-flex flex-row gap-4 justify-content-center align-items-center h-25">
            <div className="big-txt light">{props.word}</div>
        </div>
    </>);
}

export const Header2word = ({props}:any) => {
    return(<>
        <div className="col-for-phone justify-content-center align-items-center h-25">
            <div className="big-txt light">{props.word1}</div>
            <div className="big-txt dark">{props.word2}</div>
        </div>
    </>);
}