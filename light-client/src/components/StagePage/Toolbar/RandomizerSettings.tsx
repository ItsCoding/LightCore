import { Button, Card, CardContent, CircularProgress, Divider, Grid, Paper, Slider, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { strips } from "../../../system/StripConfig";
import { WebSocketClient } from "../../../system/WebsocketClient";
import { LightCoreConfig } from "../../../types/LightCoreConfig";
import { ReturnType } from "../../../types/TopicReturnType";

export const RandomizerSettings = () => {
    const wsClient = WebSocketClient.getInstance();
    const [randomizerEnabled, setRandomizerEnabled] = React.useState<boolean>(false);
    const [randomizerSpecific, setRandomizerSpecific] = React.useState<{ [key: number]: boolean }>({});
    const [waitTime, setWaitTime] = React.useState<number[]>([]);
    const [dropWaitTime, setDropWaitTime] = React.useState<number[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    useEffect(() => {
        const handlerID = wsClient.addEventHandler(ReturnType.SYSTEM.STATUS, topic => {
            const data = topic.message;
            const config: LightCoreConfig = data.config;
            setRandomizerEnabled(data.mainRandomizerEnabled);
            setRandomizerSpecific(data.ENDABLED_RND_PARTS);
            setWaitTime([data.config.randomMinWait, data.config.randomMaxWait]);
            setDropWaitTime([data.config.dropRandomMinWait, data.config.dropRandomMaxWait]);
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

    const setRandomWait = (time: number[] | number) => {
        if (!Array.isArray(time)) {
            return;
        }
        if (time[0] === time[1]) {
            time[1] += 1;
        }
        wsClient.changeConfigProperty("randomMinWait", time[0]);
        wsClient.changeConfigProperty("randomMaxWait", time[1]);
        setWaitTime(time);
    }

    const setDropRandomWait = (time: number[] | number) => {
        if (!Array.isArray(time)) {
            return;
        }
        if (time[0] === time[1]) {
            time[1] += 1;
        }
        wsClient.changeConfigProperty("dropRandomMinWait", time[0]);
        wsClient.changeConfigProperty("dropRandomMaxWait", time[1]);
        setDropWaitTime(time);
    }

    const isSpecificEnabled = (index: number) => {
        if (!randomizerSpecific || randomizerSpecific[index] === undefined) {
            return true;
        }
        return randomizerSpecific[index];
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
            <Grid container columnSpacing={2} >
                {strips.map(strip => (
                    <Grid md={6} item>
                        <Button variant="contained" color={isSpecificEnabled(strip.index) ? "secondary" : "primary"} size="small" style={{
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
                    }} variant="contained" onClick={() => wsClient.lightRandomNext()}>{strips.map(s => s.symbol).join(" ")}</Button>
                </Grid>
                {strips.map(strip => (
                    <Grid md={6} item>
                        <Button variant="contained" style={{
                            width: "100%",
                        }} onClick={() => wsClient.lightRandomNextSpecific(strip.index)}>{strip.symbol}</Button>
                    </Grid>
                ))}
            </Grid>
        </div>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
        <div style={{ marginTop: "20px" }}>
            <Typography gutterBottom>Randomizer wait time</Typography>
            <Slider
                min={1}
                max={120}
                getAriaLabel={() => 'Randomizer wait time'}
                defaultValue={waitTime}
                onChangeCommitted={(e, value) => setRandomWait(value)}
                valueLabelDisplay="auto"
                getAriaValueText={(value) => `${value}s`}
            />
            <Typography gutterBottom>Drop Randomizer wait time</Typography>
            <Slider
                min={1}
                max={120}
                getAriaLabel={() => 'Drop Randomizer wait time'}
                defaultValue={dropWaitTime}
                onChangeCommitted={(e, value) => setDropRandomWait(value)}
                valueLabelDisplay="auto"
                getAriaValueText={(value) => `${value}s`}
            />
        </div>
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