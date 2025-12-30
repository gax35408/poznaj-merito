"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react"

function startLoadingDots(elementId = "loading", titleOnStart:string) {
    let checkNumOfDots = 0;
    const el = typeof document !== "undefined" ? document.getElementById(elementId) : null;
    if (!el) return () => {};
    const interval = setInterval(() => {
        if(checkNumOfDots > 2){
        el.textContent = titleOnStart || "Loading";
        checkNumOfDots = 0;
        }else{
        el.textContent += ".";
        checkNumOfDots++;
        }
    }, 500);
    return () => clearInterval(interval); // cleanup
}


export const Loading = ({props}:any) => {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push(props.href);
        // window.location.reload();
        }, props.timeToRefresh || 800*3*2.5);

        return () => clearTimeout(timer);
    },[router]);

    useEffect(() => {
        return startLoadingDots("loading",props.titleOnStart);
    },[]);

    return(
        <div className="mid-txt light d-flex flex-column justify-content-center m-auto gap-2 fs-1">
            <div className="" style={{width: "480px"}} id="loading">{props.titleOnStart || "Loading"}</div>
        </div>
    )
}