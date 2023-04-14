import { Button, CssBaseline, Stack, TextField } from "@mui/material"
import { ThemeProvider } from "@mui/system"
import { SnackbarProvider } from "notistack"
import { BeatMapEvent, BeatsaberHandler, BSEventType, BSMessage } from "./system/BeatsaberHandler"
import { Theme } from "./system/Theme"
import { useEffect, useState } from "react"
import { FixureBar } from "./components/FixureBar"

export const App = () => {
    const bsHandler = BeatsaberHandler.getInstance()
    const [lightState, setLightState] = useState<Map<number, BeatMapEvent>>(new Map())
    const [flip, setFlip] = useState(false)
    const [ipField, setIpField] = useState("127.0.0.1");
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
                    <Stack sx={{pt:1,pl:1,pr:1}} direction={"row"} spacing={2}>
                        <TextField fullWidth variant="standard" size="small" label="IP" value={ipField} onChange={(e) => setIpField(e.target.value)} />
                        {bsHandler.connected ? <Button variant="contained" size="small" color="warning" onClick={() => {
                            bsHandler.disconnect()
                            setFlip(!flip)
                        }}>Disconnect</Button> : <Button variant="contained" onClick={async () => {
                            await bsHandler.connect(ipField);
                            setFlip(!flip)
                        }}>Connect</Button>}
                    </Stack>
                    <FixureBar stateMap={lightState} />
                </ThemeProvider>
            </SnackbarProvider>

        </div>
    )
}