import { Button, Card, CardContent, CircularProgress, Divider, FormControlLabel, FormGroup, Grid, Paper, Slider, Switch, Typography } from "@mui/material";
import React, { useEffect } from "react";
// import { strips } from "../../../system/StripConfig";
import { WebSocketClient } from "../../../system/WebsocketClient";
import { LightCoreConfig } from "../../../types/LightCoreConfig";
import { LedStrip } from "../../../types/Strip";
import { ReturnType } from "../../../types/TopicReturnType";

const marksBeat = [
    {
        value: 4,
        label: '4',
    }
];

const marksBars = [
    {
        value: 2,
        label: '2',
    },
    {
        value: 4,
        label: '4',
    },
    {
        value: 8,
        label: '8',
    },
    {
        value: 16,
        label: '16',
    }
];

export const RandomizerSettings = ({strips}: {strips: LedStrip[]}) => {
    const wsClient = WebSocketClient.getInstance();
    const [randomizerEnabled, setRandomizerEnabled] = React.useState<boolean>(false);
    const [randomizerSpecific, setRandomizerSpecific] = React.useState<{ [key: number]: boolean }>({});
    const [beatDetection, setBeatDetection] = React.useState(true);
    const [randomizerBar, setRandomizerBar] = React.useState(1);
    const [beat, setBeat] = React.useState(1);
    const [loading, setLoading] = React.useState<boolean>(true);
    useEffect(() => {
        const handlerID = wsClient.addEventHandler(ReturnType.SYSTEM.STATUS, topic => {
            const data = topic.message;
            const config: LightCoreConfig = LightCoreConfig.fromJSON(data.config);
            setRandomizerEnabled(data.mainRandomizerEnabled);
            setRandomizerSpecific(data.ENDABLED_RND_PARTS);
            setRandomizerBar(config.randomizerBar);
            setBeat(config.musicBeatsBar);
            setBeatDetection(config.beatDetection);
            console.log("Got Data", data);
            setLoading(false);
        })
        
        wsClient.getSystemStatus();
        return () => {
            wsClient.removeEventHandler(handlerID)
        }
    }, [])

    const toggleRandomizer = () => {
        wsClient.lightRandomSetEnabled(!randomizerEnabled);
        setRandomizerEnabled(!randomizerEnabled);
    }

    const toggleRandoSpecific = (index: number) => {
        const newSpecific = { ...randomizerSpecific };
        newSpecific[index] = !newSpecific[index];
        wsClient.lightRandomSetEnabledSpecific(index, newSpecific[index]);
        setRandomizerSpecific(newSpecific);
    }


    const isSpecificEnabled = (index: number) => {
        if (!randomizerSpecific || randomizerSpecific[index] === undefined) {
            return true;
        }
        return randomizerSpecific[index];
    }

    const setMusicBeatsSetting = (beats: number) => {
        wsClient.changeConfigProperty("musicBeatsBar", beats);
        setBeat(beats);
    }

    const setRandomizerBarSetting = (bar: number) => {
        wsClient.changeConfigProperty("randomizerBar", bar);
        setRandomizerBar(bar)
    }

    const CardBody = () => (<>
        <Typography gutterBottom variant="h5" component="div">
            Randomizer
        </Typography>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
        <div style={{ marginTop: "10px" }}>
            <Button fullWidth variant="contained" color={randomizerEnabled ? "secondary" : "primary"} size="small" onClick={() => toggleRandomizer()}>Toggle randomizer</Button>
        </div>
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            <Grid container columnSpacing={2} rowSpacing={2} >
                {strips.map(strip => (
                    <Grid md={6} item>
                        <Button variant="contained" color={isSpecificEnabled(strip.index) ? "secondary" : "primary"} size="medium" style={{
                            width: "100%",
                        }} onClick={() => {
                            toggleRandoSpecific(strip.index);
                        }}>RND {strip.position} toggle</Button>
                    </Grid>
                ))}
            </Grid>
        </div>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            <Grid container columnSpacing={2} rowSpacing={2} >
                <Grid md={12} item>
                    <Button style={{
                        width: "100%",
                    }} variant="contained" size="large" onClick={() => wsClient.lightRandomNext()}>Next all</Button>
                </Grid>
                {strips.map(strip => (
                    <Grid md={6} item>
                        <Button variant="contained" size="large" style={{
                            width: "100%",
                        }} onClick={() => wsClient.lightRandomNextSpecific(strip.index)}>{strip.symbol ?? strip.position}</Button>
                    </Grid>
                ))}
            </Grid>
        </div>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
        <div style={{ marginTop: "20px" }}>
            <Typography gutterBottom>Randomizer wait time</Typography>
            <Slider
                min={1}
                max={32}
                marks={marksBars}
                getAriaLabel={() => 'bars'}
                defaultValue={randomizerBar}
                onChange={(e, value) => setRandomizerBarSetting(value as number)}
                valueLabelDisplay="auto"
                getAriaValueText={(value) => `${value} bars`}
            />
            <Typography gutterBottom>Beats/Bar</Typography>
            <Slider
                min={1}
                max={8}
                marks={marksBeat}
                getAriaLabel={() => 'beats'}
                defaultValue={beat}
                onChange={(e, value) => setMusicBeatsSetting(value as number)}
                valueLabelDisplay="auto"
                getAriaValueText={(value) => `${value} beats`}
            />
        </div>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
        <Grid container justifyItems={"center"}>
            <Grid item xs={12}>
                <Button fullWidth variant="contained" color="primary" style={{
                    marginTop: "10px",
                }} onClick={() => {
                    wsClient.send("beat.reset");
                }}>Reset Beat</Button>
            </Grid>
            <Grid item xs={4}>
                <FormGroup style={{
                    marginTop: "10px",
                    marginLeft: "20px",
                }}>
                    <FormControlLabel control={<Switch checked={beatDetection} onChange={(e, checked) => {
                        wsClient.changeConfigProperty("beatDetection", checked);
                        setBeatDetection(checked)
                    }} />} label="Beatdetection" />
                </FormGroup>
            </Grid>
        </Grid>
    </>)

    const Loader = () => (<Grid container columnSpacing={2}>
        <Grid item xs={2}>
            <CircularProgress />
        </Grid>
        <Grid item xs={10}>
            <Typography sx={{
                paddingTop: "10px"
            }}>Loading server status...</Typography>
        </Grid>
    </Grid>)

    return (<>
        <Card>
            <CardContent>
                {loading ? <Loader /> : <CardBody />}
            </CardContent>
        </Card>
    </>)
}