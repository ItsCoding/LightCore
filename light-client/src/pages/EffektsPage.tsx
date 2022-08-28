import { Alert, AlertTitle, Button } from "@mui/material"
import { EffektsPanel } from "../components/EffektsPanel"
import { strips } from "../system/StripConfig"
import { WebSocketClient } from "../system/WebsocketClient"
import { Effekt } from "../types/Effekt"
import { LedStrip } from "../types/Strip"

const stripConfig = strips

type EffektsPageProps = {
    availableEffekts: Array<Effekt>,
    isRandomizerActive: boolean,
    setRandomizerActive: (active: boolean) => void,
}

export const EffektsPage = ({ availableEffekts, isRandomizerActive, setRandomizerActive }: EffektsPageProps) => {
    const wsClient = WebSocketClient.getInstance()
    return (
        <div>
            {isRandomizerActive ?
                <Alert severity="warning">
                    <AlertTitle>Warning</AlertTitle>
                    <strong>Randomizer</strong> is active. <Button onClick={() => {
                        setRandomizerActive(false);
                        wsClient.lightRandomSetEnabled(false);
                    }}>Disable</Button>
                </Alert> : null}
            {stripConfig.map(strip => {
                return <EffektsPanel key={strip.index} availableEffekts={availableEffekts} strip={strip} />
            })}
        </div>
    )
}