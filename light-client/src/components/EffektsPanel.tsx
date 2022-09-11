import { Autocomplete, Button, Card, CardContent, CardHeader, Grid, MenuItem, Select, Slider, TextField, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";
import { ColorResult } from "react-color";
import { WebSocketClient } from "../system/WebsocketClient";
import { Effekt } from "../types/Effekt";
import { EffektAdditionalData } from "../types/EffektAdditionalData";
import { FrequencyRange } from "../types/FrequencyRanges";
import { LedStrip } from "../types/Strip";



type EffektsPanelProps = {
    availableEffekts: Array<Effekt>,
    strip: LedStrip,
    colorDict: {
        [index: number]: ColorResult
    },
    inPreviewMode: boolean,
}


export const EffektsPanel = ({ availableEffekts, strip, colorDict, inPreviewMode }: EffektsPanelProps) => {
    // const classes = useStyles();
    const [selectedFreqRange, setSelectedFreqRange] = React.useState<number>(0);
    const wsClient = WebSocketClient.getInstance();
    const [selectedEffekt, setSelectedEffekt] = React.useState<Effekt | null>(null);
    const [position, setPosition] = React.useState<number[]>([0, strip.length]);

    const changeEffekt = () => {
        if (!selectedEffekt) {

            return;
        }
        console.log(`Changing effekt to ${selectedEffekt.name}`);
        const freq = FrequencyRange.allRanges[selectedFreqRange]
        const rgb = colorDict[strip.index] ? colorDict[strip.index].rgb : undefined
        console.log(rgb)
        let additionalData: EffektAdditionalData = {}
        if (rgb) {
            additionalData.color = [rgb.r, rgb.g, rgb.b]
        }
        console.log("AdditionalData", additionalData)
        const stripIndex = inPreviewMode ? (strip.index + 5) * -1 : strip.index
        wsClient.lightSetEffekt(selectedEffekt.effektSystemName, stripIndex, freq.range, additionalData);
    }

    const addEffekt = () => {
        if (!selectedEffekt) {
            return;
        }
        console.log(`Changing effekt to ${selectedEffekt.name}`);
        const freq = FrequencyRange.allRanges[selectedFreqRange]
        const rgb = colorDict[strip.index] ? colorDict[strip.index].rgb : undefined
        console.log(rgb)
        let additionalData: EffektAdditionalData = {}
        if (rgb) {
            additionalData.color = [rgb.r, rgb.g, rgb.b]
        }
        console.log("AdditionalData", additionalData)
        const stripIndex = inPreviewMode ? (strip.index + 5) * -1 : strip.index
        wsClient.lightAddEffekt(selectedEffekt.effektSystemName, stripIndex, freq.range, additionalData, position[0], position[1]);
    }


    // const groupEffekts = (effekts: Array<Effekt>) => {
    //     const groups: { [index: string]: Array<Effekt> } = {}
    //     effekts.forEach(effekt => {
    //         const grpName = effekt.group || "Other"
    //         if (grpName in groups) {
    //             groups[grpName].push(effekt)
    //         } else {
    //             groups[grpName] = [effekt]
    //         }
    //     })
    //     return groups
    // }

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
                        size="small"
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
                    <Button variant="contained" color="error" onClick={() => wsClient.lightSetOff(inPreviewMode ? (strip.index + 5) * -1 : strip.index)} style={{ height: "100%", width: "100%" }}>Off</Button>
                </Grid>
            </Grid>
            <h4>Position range</h4>
            <div style={{
                paddingLeft: 5,
                paddingRight: 5
            }}>
                <Slider

                    value={position}
                    onChange={(e, newValue) => setPosition(newValue as number[])}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value) => `Pixel ${value}`}
                    max={strip.length}
                    marks={strip.marks}
                />
            </div>
            <Grid style={{
                marginTop: "0px"
            }} container spacing={2}>
                <Grid item xs={6} md={8}>
                    <Autocomplete
                        size="small"
                        // className={classes.root}
                        id="grouped-demo"
                        options={availableEffekts.sort((a, b) => {
                            return -b.group.localeCompare(a.group) || -b.name.localeCompare(a.name)
                        })}
                        // options={availableEffekts.sort((a, b) => -b.name.localeCompare(a.name))}
                        groupBy={(option) => option.group.toLocaleUpperCase()}
                        renderOption={(props, option) => <Typography {...props} variant="body1">{option.name}</Typography>}
                        getOptionLabel={(option) => option.name}
                        sx={{ width: "100%" }}
                        onChange={(e, value) => {
                            setSelectedEffekt(value)
                            // if (value !== null) changeEffekt(value)
                        }}
                        value={selectedEffekt}
                        renderInput={(params) => <TextField {...params} label="Effekt..." />}
                    />
                </Grid>
                <Grid item xs={3} md={2}>
                    <Button variant="contained" style={{ height: "100%" }} fullWidth onClick={() => addEffekt()}>Add</Button>
                </Grid>
                <Grid item xs={3} md={2}>
                    <Button variant="contained" style={{ height: "100%" }} fullWidth onClick={() => changeEffekt()}>Set</Button>
                </Grid>
            </Grid>


            {/* {Object.entries(groupEffekts(availableEffekts)).sort((a, b) => a[0].localeCompare(b[0])).map(([groupName, effekts]) => {
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
            })} */}

        </CardContent>
    </Card>)
}