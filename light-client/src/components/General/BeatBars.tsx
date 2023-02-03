import { Stack } from "@mui/system";
import { useEffect, useState } from "react";
import { WebSocketClient } from "../../system/WebsocketClient"

type BeatConfig = {
    beatsPerBar: number;
    bars: number;
}

export const BeatBars = () => {
    const wsClient = WebSocketClient.getInstance();

    const [beat, setBeat] = useState(0);
    const [config, setConfig] = useState<BeatConfig>({
        beatsPerBar: 4,
        bars: 4
    });

    useEffect(() => {
        const handlerID = wsClient.addEventHandler("return.system.beatUpdate", (data: any) => {
            const message = data.message;
            setBeat(message.beat);
            // console.log(message)
            if (config.bars !== message.bar || config.beatsPerBar !== message.beats) {
                setConfig({
                    beatsPerBar: message.beats,
                    bars: message.bar
                })
            }
        })
        return () => {
            wsClient.removeEventHandler(handlerID);
        }
    }, [wsClient]);


    return (
        <Stack direction={"row"}>
            {Array(config.bars >= config.beatsPerBar ? config.bars : config.beatsPerBar).fill(0).map((_, i) => {
                return (
                    <div key={i} style={{
                        borderRadius: "50%",
                        width: "5px",
                        height: "5px",
                        backgroundColor: beat % config.beatsPerBar === i ? "red" : (config.beatsPerBar * i <= beat ? "lightblue" : "black"),
                        margin: "5px"
                    }} />
                )
            })}
        </Stack>
    )
}