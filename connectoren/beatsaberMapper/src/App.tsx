import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/system"
import { SnackbarProvider } from "notistack"
import { BeatMapEvent, BeatsaberHandler, BSEventType, BSMessage } from "./system/BeatsaberHandler"
import { Theme } from "./system/Theme"
import { useEffect, useState } from "react"
import { FixureBar } from "./components/FixureBar"

// const eventStore: BSMessage[] = []

// setInterval(() => {
//     // console.log("EVENT STORE", eventStore)

//     const eventTypeMap = new Map<number, BSMessage[]>()
//     eventStore.forEach((event) => {
//         if (!event.beatmapEvent) return
//         if (eventTypeMap.has(event.beatmapEvent?.type)) {
//             eventTypeMap.get(event.beatmapEvent?.type)?.push(event)
//         } else {
//             eventTypeMap.set(event.beatmapEvent?.type, [event])
//         }
//     })
//     console.group("Events")
//     eventTypeMap.forEach((events, eventType) => {
//         console.log(eventType, events[0])
//     })
//     console.groupEnd()

// }, 5000)

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