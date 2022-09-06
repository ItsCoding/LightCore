import { useEffect, useState } from "react";
import { ButtonGrid } from "../components/StagePage/ButtonGrid";
import { StageToolbar } from "../components/StagePage/StageToolbar";
import { initEvents } from "../system/StageSystem/WebsocketHelper";
import { Board } from "../types/Board";

export type StagePageProps = {
    setActiveRoute: React.Dispatch<React.SetStateAction<string>>;
}

export const StagePage = ({setActiveRoute}: StagePageProps) => {
    const [activeBoard, setActiveBoard] = useState<Board>({ elements: {} })
    const [availableBoards, setAvailableBoards] = useState<Array<Board>>([])

    useEffect(() => {
        initEvents(setAvailableBoards)
    },[])


    return (<>

        <ButtonGrid board={activeBoard}/>
        <StageToolbar activeBoard={activeBoard} setActiveRoute={setActiveRoute} setActiveBoard={setActiveBoard} availableBoards={availableBoards} />
    </>)
}