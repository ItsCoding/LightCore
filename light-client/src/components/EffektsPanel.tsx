import { Button, Card, CardContent, CardHeader, Grid, MenuItem, Select } from "@mui/material";
import React from "react";
import { WebSocketClient } from "../system/WebsocketClient";
import { Effekt } from "../types/Effekt";
import { FrequencyRange } from "../types/FrequencyRanges";
import { LedStrip } from "../types/Strip";

type EffektsPanelProps = {
    availableEffekts: Array<Effekt>,
    strip: LedStrip
}

export const EffektsPanel = ({ availableEffekts, strip }: EffektsPanelProps) => {
    const [selectedFreqRange, setSelectedFreqRange] = React.useState<number>(0);
    const wsClient = WebSocketClient.getInstance();
    const changeEffekt = (effekt: Effekt) => {
        console.log(`Changing effekt to ${effekt.name}`);
        const freq = FrequencyRange.allRanges[selectedFreqRange]
        wsClient.lightSetEffekt(effekt.effektSystemName, strip.index, freq.range);
    }

    return (<Card>
        <CardHeader title={strip.position} />
        <CardContent>
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <Select
                        style={{
                            minWidth: "100%",
                        }}
                        value={selectedFreqRange}
                        onChange={(e) => setSelectedFreqRange(e.target.value as number)}
                        label="Age"
                    >
                        {FrequencyRange.allRanges.map((range, index) => {
                            return <MenuItem value={index}>{range.name}</MenuItem>
                        })}
                    </Select>
                </Grid>
                <Grid item xs={4}>
                    <Button variant="contained" color="error" onClick={() => wsClient.lightSetOff(strip.index)} style={{height: "100%", width: "100%"}}>Off</Button>
                </Grid>
            </Grid>

            <Grid container>
                {availableEffekts.sort((a,b) => a.effektSystemName.localeCompare(b.effektSystemName)).map(effekt => {
                    return (
                        <Grid item xs={6} md={4} key={effekt.effektSystemName}>
                            <Button onClick={() => changeEffekt(effekt)}>{effekt.name}</Button>
                        </Grid>)
                })}
            </Grid>
        </CardContent>
    </Card>)
}