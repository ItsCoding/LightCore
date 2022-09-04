import { Button, Card, CardContent, CardHeader, Grid, MenuItem, Select } from "@mui/material";
import React from "react";
import { ColorResult } from "react-color";
import { WebSocketClient } from "../system/WebsocketClient";
import { Effekt } from "../types/Effekt";
import { EffektAdditionalData } from "../types/EffektAdditionalData";
import { FrequencyRange } from "../types/FrequencyRanges";
import { LedStrip } from "../types/Strip";
import { TouchButton } from "./General/TouchButton";

type EffektsPanelProps = {
    availableEffekts: Array<Effekt>,
    strip: LedStrip,
    colorDict: {
        [index: number]: ColorResult
    },
}

export const EffektsPanel = ({ availableEffekts, strip, colorDict }: EffektsPanelProps) => {
    const [selectedFreqRange, setSelectedFreqRange] = React.useState<number>(0);
    const wsClient = WebSocketClient.getInstance();
    const changeEffekt = (effekt: Effekt) => {
        console.log(`Changing effekt to ${effekt.name}`);
        const freq = FrequencyRange.allRanges[selectedFreqRange]
        const rgb = colorDict[strip.index] ? colorDict[strip.index].rgb : undefined
        console.log(rgb)
        let additionalData: EffektAdditionalData = {}
        if (rgb) {
            additionalData.color = [rgb.r, rgb.g, rgb.b]
        }
        console.log("AdditionalData", additionalData)
        wsClient.lightSetEffekt(effekt.effektSystemName, strip.index, freq.range, additionalData);
    }

    const groupEffekts = (effekts: Array<Effekt>) => {
        const groups: { [index: string]: Array<Effekt> } = {}
        effekts.forEach(effekt => {
            const grpName = effekt.group || "Other"
            if (grpName in groups) {
                groups[grpName].push(effekt)
            } else {
                groups[grpName] = [effekt]
            }
        })
        return groups
    }

    return (<Card style={{
        marginTop: "10px",
    }}>
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
                    <Button variant="contained" color="error" onClick={() => wsClient.lightSetOff(strip.index)} style={{ height: "100%", width: "100%" }}>Off</Button>
                </Grid>
            </Grid>
            {Object.entries(groupEffekts(availableEffekts)).sort((a,b) => a[0].localeCompare(b[0])).map(([groupName, effekts]) => {
                return (<div style={{
                    marginTop: "10px",
                }}>
                    <h3>{groupName.toLocaleUpperCase()}</h3>
                    <Grid container columnSpacing={2} rowSpacing={2}>
                        {effekts.sort((a, b) => a.effektSystemName.localeCompare(b.effektSystemName)).map(effekt => {
                            return (
                                <Grid item xs={6} md={4} key={effekt.effektSystemName}>
                                    <TouchButton variant="contained" fullWidth style={{
                                        height: "50px",
                                    }} onInteract={() => changeEffekt(effekt)}>{effekt.name}</TouchButton>
                                </Grid>)
                        })}
                    </Grid>
                </div>)
            })}

        </CardContent>
    </Card>)
}