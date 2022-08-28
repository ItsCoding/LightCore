import { Button, Card, CardContent, CardHeader, Slider, Typography } from "@mui/material"
import Grid from '@mui/material/Grid';
import { Box } from "@mui/system";
import React, { useEffect } from "react";
import { strips } from "../../system/StripConfig";
import { WebSocketClient } from "../../system/WebsocketClient";
import { LightCoreConfig } from "../../types/LightCoreConfig";



type QuickRandomControllsProps = {
    randomEnabled: boolean,
    randomSpecific: { [key: number]: boolean },
    lightConfig: LightCoreConfig,
    setRandomEnabled: (enabled: boolean) => void,
    setRandomSpecific: (specific: { [key: number]: boolean }) => void,
    setLCConfig: (config: LightCoreConfig) => void,
}

export const QuickRandomControlls = ({ randomEnabled, randomSpecific, lightConfig, setRandomEnabled, setRandomSpecific, setLCConfig }: QuickRandomControllsProps) => {
    const wsClient = WebSocketClient.getInstance();


    useEffect(() => {
        if (Object.keys(randomSpecific).length < 1) {
            const newSpecific = { ...randomSpecific };
            strips.forEach(strip => {
                newSpecific[strip.index] = !newSpecific[strip.index];
            })
            setRandomSpecific(newSpecific);
        }
    }, [])


    const toggleRandoSpecific = (index: number) => {
        const newSpecific = { ...randomSpecific };
        newSpecific[index] = !newSpecific[index];
        setRandomSpecific(newSpecific);
    }

    const setRandomWait = (time: number[] | number) => {
        if (!Array.isArray(time)) {
            return;
        }
        lightConfig.randomMinWait = time[0];
        lightConfig.randomMaxWait = time[1];
        wsClient.changeConfigProperty("randomMinWait", time[0]);
        wsClient.changeConfigProperty("randomMaxWait", time[1]);
        setLCConfig(lightConfig);
    }

    const setDropRandomWait = (time: number[] | number) => {
        if (!Array.isArray(time)) {
            return;
        }
        lightConfig.dropRandomMinWait = time[0];
        lightConfig.dropRandomMaxWait = time[1];
        wsClient.changeConfigProperty("dropRandomMinWait", time[0]);
        wsClient.changeConfigProperty("dropRandomMaxWait", time[1]);
        setLCConfig(lightConfig);
    }

    return (
        <Card variant="outlined" style={{
            paddingTop: "10px"
        }}
        >
            <CardHeader title={"Random"}>
            </CardHeader>
            <CardContent style={{
                marginLeft: "10px",
                marginRight: "10px",
            }}>
                <Grid container rowSpacing={2} columnSpacing={2} spacing={{
                    xs: 0,
                    md: 4,
                }}
                    justifyContent="center"
                >
                    <Grid xs={6} md={1} item>
                        <Button variant="outlined" onClick={() => wsClient.lightRandomNext()}>Next Random Comp</Button>
                    </Grid>
                    <Grid xs={6} md={1} item>
                        <Button variant="outlined" style={{
                            backgroundColor: randomEnabled ? "green" : "red",
                        }} onClick={() => {
                            setRandomEnabled(!randomEnabled);
                            wsClient.lightRandomSetEnabled(!randomEnabled);
                        }}>Random comp. toggle</Button>
                    </Grid>
                    {strips.map(strip => (
                        <Grid xs={6} md={1} item>
                            <Button variant="outlined" style={{
                                backgroundColor: randomSpecific[strip.index] ? "green" : "red",
                            }} onClick={() => {
                                wsClient.lightRandomSetEnabledSpecific(strip.index, !randomSpecific[strip.index]);
                                toggleRandoSpecific(strip.index);
                            }}>RND {strip.position} toggle</Button>
                        </Grid>
                    ))}
                    {strips.map(strip => (
                        <Grid xs={6} md={1} item>
                            <Button variant="outlined" onClick={() => wsClient.lightRandomNextSpecific(strip.index)}>Next Comp {strip.position}</Button>
                        </Grid>
                    ))}
                </Grid>
                <div style={{
                    paddingTop: "20px",
                }}>
                    <Typography gutterBottom>Randomizer wait time</Typography>
                    <Slider
                        min={0}
                        max={1000}
                        getAriaLabel={() => 'Randomizer wait time'}
                        defaultValue={[lightConfig.randomMinWait, lightConfig.randomMaxWait]}
                        onChange={(e, value) => setRandomWait(value)}
                        valueLabelDisplay="auto"
                        getAriaValueText={(value) => `${value}s`}
                    />
                    <Typography gutterBottom>Drop Randomizer wait time</Typography>
                    <Slider
                        min={1}
                        max={1000}
                        getAriaLabel={() => 'Drop Randomizer wait time'}
                        defaultValue={[lightConfig.dropRandomMinWait, lightConfig.dropRandomMaxWait]}
                        onChange={(e, value) => setDropRandomWait(value)}
                        valueLabelDisplay="auto"
                        getAriaValueText={(value) => `${value}s`}
                    />
                </div>

            </CardContent>

        </Card>)
}