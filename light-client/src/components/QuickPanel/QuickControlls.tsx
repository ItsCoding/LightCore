import { Button, Card, CardContent } from "@mui/material"
import Grid from '@mui/material/Grid';
import React from "react";
import { WebSocketClient } from "../../system/WebsocketClient";
export const QuickControlls = () => {
    const wsClient = WebSocketClient.getInstance();
    const [randomEnabled, setRandomEnabled] = React.useState(true);
    return (
        <Card variant="outlined" style={{
            paddingTop: "10px"
        }}>
            <CardContent style={{
                marginLeft: "10px",
                marginRight: "10px",
            }}>
                <Grid container spacing={2}>
                    <Grid xs={6}>
                        <Button variant="outlined" onClick={() => wsClient.lightRandomNext()}>Next Random Composition</Button>
                    </Grid>
                    <Grid xs={6}>
                        <Button variant="outlined" onClick={() => wsClient.lightRandomNextTriangle()}>Next Random Triangle</Button>
                    </Grid>
                    <Grid xs={6}>
                        <Button variant="outlined" onClick={() => wsClient.lightRandomNextMiddle()}>Next Random Middle</Button>
                    </Grid>
                    <Grid xs={6}>
                        <Button variant="outlined" style={{
                            backgroundColor: randomEnabled ? "green" : "red",
                        }} onClick={() => {
                            setRandomEnabled(!randomEnabled);
                            wsClient.lightRandomSetEnabled(!randomEnabled);
                        }}>Random comp. Toggle</Button>
                    </Grid>
                </Grid>
            </CardContent>

        </Card>)
}