import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/system"
import { SnackbarProvider } from "notistack"
import { BeatMapEvent, BeatsaberHandler, BSEventType, BSMessage } from "./system/BeatsaberHandler"
import { Theme } from "./system/Theme"
import { useEffect, useState } from "react"
import { FixureBar } from "./components/FixureBar"

export const App = () => {
    const bsHandler = BeatsaberHandler.getInstance()
    const [lightState, setLightState] = useState<Map<number, BeatMapEvent>>(new Map())
    useEffect(() => {
        const handlerID = bsHandler.on(BSEventType.BEATMAP_EVENT, (event) => {
            console.debug("HANDLER EVENT", event.beatmapEvent)
            // eventStore.push(event)
            if (!event.beatmapEvent) return


            setLightState((prev) => {
                const coppyMap = new Map<number, BeatMapEvent>(prev)
                coppyMap.set(event.beatmapEvent.type, event.beatmapEvent)
                return coppyMap
            })
        })
        return () => {
            bsHandler.off(handlerID)
        }
    }, [])



    return (
        <div>
            <SnackbarProvider anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
            }} maxSnack={10}>
                <ThemeProvider theme={Theme}>
                    <CssBaseline />
                    <FixureBar stateMap={lightState} />
                </ThemeProvider>
            </SnackbarProvider>

        </div>
    )
}