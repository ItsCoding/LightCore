import { useTheme } from "@mui/material/styles";
import { Button, Grid, useMediaQuery } from "@mui/material"
import { TouchButton } from "../General/TouchButton";
import { Board } from "../../types/Board";
import { BoardButtonInfos } from "../BoardEditor/BoardButtonInfos";
import { useEffect, useState } from "react";
import { Composition } from "../../types/Composition";
import { WebSocketClient } from "../../system/WebsocketClient";
import { ReturnType } from "../../types/TopicReturnType";
import { LedStrip } from "../../types/Strip";

type ButtonGridProsp = {
    board: Board;
    strips: Array<LedStrip>
}

type InnerButtonProps = {
    composition: Composition
    matches: boolean
    strips: Array<LedStrip>
}


const InnerButton = ({ composition, matches, strips }: InnerButtonProps) => {
    const [active, setActive] = useState(false)
    const onDeactivateHandler = () => {
        setActive(false)
    }
    return (
        <Grid item xs={4} md={2}>
            <TouchButton
                disabled={!composition}
                style={{
                    height: matches ? "6vh" : "11.7vh",
                    color: "white"
                }}
                variant="outlined"
                color={active ? "warning" : "primary"}
                fullWidth
                size="medium"
                onInteract={() => { composition.activate(() => onDeactivateHandler()); setActive(true); console.log("Set Active") }}>
                {
                    composition ? <BoardButtonInfos strips={strips} composition={composition} /> : null
                }
            </TouchButton>
        </Grid>
    )
}


export const ButtonGrid = ({ board,strips }: ButtonGridProsp) => {
    const wsClient = WebSocketClient.getInstance()
    const amountButtons = Array.from(Array(41).keys())
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.only('xs'));
    const [flashBeat, setFlashBeat] = useState(false)

    useEffect(() => {
        const handlerID = wsClient.addEventHandler(ReturnType.BEAT.DETECTED, topic => {
            setFlashBeat(true)
            setTimeout(() => {
                setFlashBeat(false)
            }, 150);
        });
        return () => {
            wsClient.removeEventHandler(handlerID)
        }
    }, [board])
    // console.log("IS SX: ", matches)
    return (
        <Grid sx={{
            padding: "10px"
        }} container columnSpacing={1} rowSpacing={1}>
            {
                amountButtons.map((btn, i) => {
                    const composition = board.elements[i]?.data
                    return (
                        <InnerButton strips={strips} key={i} composition={composition} matches={matches} />
                    )
                })
            }
            <Grid item xs={4} md={2} key={42}>
                <TouchButton
                    style={{
                        height: matches ? "6vh" : "11.7vh",
                        color: "white",
                        display: "flex",
                        textAlign: "center",
                        flexDirection: "column",
                        justifyContent: "center",
                        border: (flashBeat ? "4px solid rgba(244, 67, 54, 0.5)" : "1px solid rgba(244, 67, 54, 0.5)")
                    }}
                    variant="outlined"
                    color="error"
                    fullWidth
                    size="medium"
                    onInteract={() => { wsClient.beatTap() }}>
                    <h2>Beat Tap</h2>
                </TouchButton>
            </Grid>
        </Grid>)
}