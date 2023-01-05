import { MenuItem, Select } from "@mui/material";
import { useEffect, useState } from "react";
import { WebSocketClient } from "../../system/WebsocketClient";
import { ReturnType } from "../../types/TopicReturnType";

export const RandomizerMode = () => {
    const wsClient = WebSocketClient.getInstance();
    const [randomizerMode, setRandomizerMode] = useState(-1);

    useEffect(() => {
        const handlerID = wsClient.addEventHandler(ReturnType.SYSTEM.RANDOMIZER_MODE, topic => {
            const data = topic.message;
            console.log("Got randomizer mode", data)
            setRandomizerMode(data);
        });

        wsClient.send("light.random.getMode", "");
        return () => {
            wsClient.removeEventHandler(handlerID)
        }
    }, [])

    const onRandomizerModeChange = (mode: number) => {
        setRandomizerMode(mode);
        wsClient.send("wsapi.reloadPipelineCompositions",{});
        wsClient.send("light.random.setMode", mode);
    }


    return (
        <div>
            <Select
                fullWidth
                value={randomizerMode}
                label="Randomizer Mode"
                onChange={(e) => onRandomizerModeChange(e.target.value as number)}
            >
                <MenuItem value={-1} disabled>Randomizer Mode</MenuItem>
                <MenuItem value={0}>Auto</MenuItem>
                <MenuItem value={1}>By Compositions</MenuItem>
            </Select>
        </div>
    )

}