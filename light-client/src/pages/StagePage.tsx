import { Alert, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { ButtonGrid } from "../components/StagePage/ButtonGrid";
import { StageToolbar } from "../components/StagePage/StageToolbar";
import { RandomizerSettings } from "../components/StagePage/Toolbar/RandomizerSettings";
import { BrightnessSettings } from "../components/StagePage/Toolbar/BrightnessSettings";
import { initEvents } from "../system/StageSystem/WebsocketHelper";
import { Board } from "../types/Board";

export type StagePageProps = {
    setActiveRoute: React.Dispatch<React.SetStateAction<string>>;
}

export const StagePage = ({ setActiveRoute }: StagePageProps) => {
    const [activeBoard, setActiveBoard] = useState<Board>({ elements: {} })
    const [availableBoards, setAvailableBoards] = useState<Array<Board>>([])
    const [activeWidget, setActiveWidget] = useState<string | undefined>(undefined)
    useEffect(() => {
        initEvents(setAvailableBoards, setActiveBoard)
    }, [])

    const getWidget = () => {
        switch (activeWidget) {
            case "randomizer":
                return <RandomizerSettings />
            case "system":
                return <BrightnessSettings />
            default:
                return <Alert variant="filled" severity="error" sx={{
                    marginLeft: "5px",
                    marginRight: "auto",
                    marginTop: "40vh"
                }}>Widget "{activeWidget}" is not implemented</Alert>
        }
    }

    return (<div style={{
        padding: "10px"
    }}>
        <Grid container spacing={2} rowSpacing={2} columnSpacing={2}>
            {activeWidget && <Grid item xs={3}>
                {getWidget()}
            </Grid>}
            <Grid item xs={(activeWidget ? 9 : 12)}>
                <ButtonGrid board={activeBoard} />
            </Grid>
        </Grid>

        <StageToolbar activeWidget={activeWidget} setActiveWidget={setActiveWidget} activeBoard={activeBoard} setActiveRoute={setActiveRoute} setActiveBoard={setActiveBoard} availableBoards={availableBoards} />
    </div>)
}