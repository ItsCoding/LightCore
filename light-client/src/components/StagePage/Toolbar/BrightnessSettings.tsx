import { Card, CardContent, CircularProgress, Divider, Grid, Typography } from "@mui/material"
import React, { useEffect } from "react";
import { WebSocketClient } from "../../../system/WebsocketClient";
import { LightCoreConfig } from "../../../types/LightCoreConfig";
import { ReturnType } from "../../../types/TopicReturnType";

export const BrightnessSettings = () => {
    const [systemConfig, setSystemConfig] = React.useState<LightCoreConfig | undefined>(undefined);
    const wsClient = WebSocketClient.getInstance();

    useEffect(() => {
        const handlerID = wsClient.addEventHandler(ReturnType.SYSTEM.CONFIG, topic => {
            const config: LightCoreConfig = LightCoreConfig.fromJSON(topic.message)
            setSystemConfig(config)
        })
        wsClient.send("system.config.get");
        return () => {
            wsClient.removeEventHandler(handlerID);
        }
    }, [])

    const changeStripBrightness = (strip: number, brightness: number) => {
        if(!systemConfig) {
            return;
        }
        systemConfig.stripBrightness[strip] = brightness;
        wsClient.changeConfigProperty("stripBrightness", systemConfig?.stripBrightness);
        setSystemConfig(systemConfig);
    }

    const changeGlobalBrightness = (brightness: number) => {
        if(!systemConfig) {
            return;
        }
        systemConfig.brightness = brightness;
        wsClient.changeConfigProperty("globalBrightness", systemConfig?.brightness);
        setSystemConfig(systemConfig);
    }


    const CardBody = () => (
        <>
            <Typography gutterBottom variant="h5" component="div">
                Brightness
            </Typography>
            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
            <div style={{ marginTop: "10px" }}>
                
            </div>
        </>)

    const Loader = () => (<Grid container columnSpacing={2}>
        <Grid item xs={2}>
            <CircularProgress />
        </Grid>
        <Grid item xs={10}>
            <Typography sx={{
                paddingTop: "10px"
            }}>Loading system settings...</Typography>
        </Grid>
    </Grid>)

    return (<>
        <Card>
            <CardContent>
                {!systemConfig ? <Loader /> : <CardBody />}
            </CardContent>
        </Card>
    </>)
}