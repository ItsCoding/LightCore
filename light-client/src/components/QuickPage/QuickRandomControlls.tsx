import { Button, Card, CardContent, CardHeader, Divider, FormControlLabel, FormGroup, Slider, Switch, Typography } from "@mui/material"
import Grid from '@mui/material/Grid';
import { Box } from "@mui/system";
import React, { useEffect } from "react";
// import { strips } from "../../system/StripConfig";
import { WebSocketClient } from "../../system/WebsocketClient";
import { LightCoreConfig } from "../../types/LightCoreConfig";
import { LedStrip } from "../../types/Strip";
import { BarView } from "../General/BarView";
import { TouchButton } from "../General/TouchButton";



type QuickRandomControllsProps = {
    randomEnabled: boolean,
    randomSpecific: { [key: number]: boolean },
    lightConfig: LightCoreConfig,
    setRandomEnabled: (enabled: boolean) => void,
    setRandomSpecific: (specific: { [key: number]: boolean }) => void,
    setLCConfig: (config: LightCoreConfig) => void,
    strips: Array<LedStrip>;
}

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

export const QuickRandomControlls = ({ randomEnabled, randomSpecific, lightConfig, setRandomEnabled, setRandomSpecific, setLCConfig,strips }: QuickRandomControllsProps) => {
    const wsClient = WebSocketClient.getInstance();
    const [beatDetection, setBeatDetection] = React.useState(lightConfig.beatDetection);
    const isPhone = window.innerWidth < 800;
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

    // const setRandomWait = (time: number[] | number) => {
    //     if (!Array.isArray(time)) {
    //         return;
    //     }
    //     if (time[0] === time[1]) {
    //         time[1] += 1;
    //     }
    //     lightConfig.randomMinWait = time[0];
    //     lightConfig.randomMaxWait = time[1];
    //     wsClient.changeConfigProperty("randomMinWait", time[0]);
    //     wsClient.changeConfigProperty("randomMaxWait", time[1]);
    //     setLCConfig(lightConfig);
    // }

    // const setDropRandomWait = (time: number[] | number) => {
    //     if (!Array.isArray(time)) {
    //         return;
    //     }
    //     if (time[0] === time[1]) {
    //         time[1] += 1;
    //     }
    //     lightConfig.dropRandomMinWait = time[0];
    //     lightConfig.dropRandomMaxWait = time[1];
    //     wsClient.changeConfigProperty("dropRandomMinWait", time[0]);
    //     wsClient.changeConfigProperty("dropRandomMaxWait", time[1]);
    //     setLCConfig(lightConfig);
    // }

    const setMusicBeats = (beats: number) => {
        lightConfig.musicBeatsBar = beats;
        wsClient.changeConfigProperty("musicBeatsBar", beats);
        setLCConfig(lightConfig);
    }

    const randomizerBar = (bar: number) => {
        lightConfig.randomizerBar = bar;
        wsClient.changeConfigProperty("randomizerBar", bar);
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
                    <Grid xs={isPhone? 12 : 6} md={2} item>
                        <Button variant="contained" color={randomEnabled ? "secondary" : "primary"} style={{
                            width: "100%",
                            height: "100%",
                        }} onClick={() => {
                            setRandomEnabled(!randomEnabled);
                            wsClient.lightRandomSetEnabled(!randomEnabled);
                        }}>Random comp. toggle</Button>
                    </Grid>
                    {!isPhone && strips.map(strip => (
                        <Grid xs={6} md={2} item>
                            <TouchButton variant="contained" color={randomSpecific[strip.index] ? "secondary" : "primary"} style={{
                                width: "100%",
                                height: "100%",
                            }} onInteract={() => {
                                wsClient.lightRandomSetEnabledSpecific(strip.index, !randomSpecific[strip.index]);
                                toggleRandoSpecific(strip.index);
                            }}>RND {strip.position} toggle</TouchButton>
                        </Grid>
                    ))}

                </Grid>
                <Divider style={{ borderColor: "rgba(255, 255, 255, 0.12)", marginTop: "20px" }} />
                <Grid container rowSpacing={2} columnSpacing={2} style={{
                    minHeight: "100px",
                    marginTop: "10px",
                }} justifyContent="center">
                    <Grid xs={isPhone? 12 : 6} md={2} item>
                        <TouchButton style={{
                            width: "100%",
                            height: "100%",
                        }} variant="contained" onInteract={() => wsClient.lightRandomNext()}>Next rnd.</TouchButton>
                    </Grid>
                    {strips.map(strip => (
                        <Grid xs={6} md={2} item>
                            <TouchButton variant="contained" style={{
                                width: "100%",
                                height: "100%",
                            }}
                                onInteract={() => wsClient.lightRandomNextSpecific(strip.index)}>Next Comp {strip.symbol}</TouchButton>
                        </Grid>
                    ))}
                </Grid>
                <div style={{
                    paddingTop: "20px",
                }}>
                    <Typography gutterBottom>Randomizer Bars</Typography>
                    <Slider
                        min={1}
                        max={32}
                        marks={marksBars}
                        getAriaLabel={() => 'bars'}
                        defaultValue={lightConfig.randomizerBar}
                        onChange={(e, value) => randomizerBar(value as number)}
                        valueLabelDisplay="auto"
                        getAriaValueText={(value) => `${value} bars`}
                    />
                    <Typography gutterBottom>Beats/Bar</Typography>
                    <Slider
                        min={1}
                        max={8}
                        marks={marksBeat}
                        getAriaLabel={() => 'beats'}
                        defaultValue={lightConfig.musicBeatsBar}
                        onChange={(e, value) => setMusicBeats(value as number)}
                        valueLabelDisplay="auto"
                        getAriaValueText={(value) => `${value} beats`}
                    />
                    {/* <Slider
                        min={1}
                        max={120}
                        getAriaLabel={() => 'Randomizer wait time'}
                        defaultValue={[lightConfig.randomMinWait, lightConfig.randomMaxWait]}
                        onChange={(e, value) => setRandomWait(value)}
                        valueLabelDisplay="auto"
                        getAriaValueText={(value) => `${value}s`}
                    />
                    <Typography gutterBottom>Drop Randomizer wait time</Typography>
                    <Slider
                        min={1}
                        max={120}
                        getAriaLabel={() => 'Drop Randomizer wait time'}
                        defaultValue={[lightConfig.dropRandomMinWait, lightConfig.dropRandomMaxWait]}
                        onChange={(e, value) => setDropRandomWait(value)}
                        valueLabelDisplay="auto"
                        getAriaValueText={(value) => `${value}s`}
                    /> */}
                </div>
                <Grid container>
                    <Grid item xs={isPhone? 12: 8}>
                        <Button fullWidth variant="contained" color="primary" style={{
                            marginTop: "10px",
                        }} onClick={() => {
                            wsClient.send("beat.reset");
                        }}>Reset Beat</Button>
                    </Grid>
                    <Grid item xs={isPhone? 6: 4}>
                        <FormGroup style={{
                            marginTop: "10px",
                            marginLeft: "20px",
                        }}>
                            <FormControlLabel control={<Switch checked={beatDetection} onChange={(e,checked) => {
                                wsClient.changeConfigProperty("beatDetection", checked);
                                lightConfig.beatDetection = checked;
                                setBeatDetection(checked)
                                setLCConfig(lightConfig);
                            }} />} label="Beatdetection" />
                        </FormGroup>
                    </Grid>
                </Grid>

                {/* <BarView /> */}
            </CardContent>

        </Card>)
}