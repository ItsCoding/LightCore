import { Button, Card, CardContent, CardHeader } from "@mui/material"
import Grid from '@mui/material/Grid';
import React, { useEffect } from "react";
import { strips } from "../../system/StripConfig";
import { WebSocketClient } from "../../system/WebsocketClient";



type RNDSpecificDict = {
    [key: number]: boolean
}

export const QuickRandomControlls = () => {
    const wsClient = WebSocketClient.getInstance();
    const [randomEnabled, setRandomEnabled] = React.useState(true);
    const [randomSpecific, setRandomSpecific] = React.useState<RNDSpecificDict>({});

    useEffect(() => {
        const newSpecific = { ...randomSpecific };
        strips.forEach(strip => {
            newSpecific[strip.index] = !newSpecific[strip.index];
        })
        setRandomSpecific(newSpecific);
    }, [])


    const toggleRandoSpecific = (index: number) => {
        const newSpecific = { ...randomSpecific };
        newSpecific[index] = !newSpecific[index];
        setRandomSpecific(newSpecific);
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
                <Grid container rowSpacing={2} spacing={{
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
            </CardContent>

        </Card>)
}