import { Button, Card, CardContent, CardHeader } from "@mui/material"
import Grid from '@mui/material/Grid';
import React from "react";
import { WebSocketClient } from "../../system/WebsocketClient";
export const QuickRandomControlls = () => {
    const wsClient = WebSocketClient.getInstance();
    const [randomEnabled, setRandomEnabled] = React.useState(true);
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
                <Grid container spacing={{
                    xs: 0,
                    md: 4,
                }}
                justifyContent="center"
                >
                    <Grid xs={6} md={1} item>
                        <Button variant="outlined" onClick={() => wsClient.lightRandomNext()}>Next Random Comp</Button>
                    </Grid>
                    <Grid xs={6} md={1} item>
                        <Button variant="outlined" onClick={() => wsClient.lightRandomNextTriangle()}>Next Random Triangle</Button>
                    </Grid>
                    <Grid xs={6} md={1} item>
                        <Button variant="outlined" onClick={() => wsClient.lightRandomNextMiddle()}>Next Random Middle</Button>
                    </Grid>
                    <Grid xs={6} md={1} item>
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