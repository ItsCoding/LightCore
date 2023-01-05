import { Button, Card, CardContent, CardHeader, Divider, Slider, Typography } from "@mui/material"
import { useSnackbar } from "notistack";
// import { strips } from "../../system/StripConfig";
import { WebSocketClient } from "../../system/WebsocketClient";
import { LightCoreConfig } from "../../types/LightCoreConfig"
import { LedStrip } from "../../types/Strip";

type QuickSystemControllsProps = {
    lightConfig: LightCoreConfig,
    setLCConfig: (config: LightCoreConfig) => void,
    strips: Array<LedStrip>;
}

const marks = [
    {
        value: 1,
        label: 'Normal',
    }
];

export const QuickSystemControlls = ({ lightConfig, setLCConfig,strips }: QuickSystemControllsProps) => {
    const wsClient = WebSocketClient.getInstance();
    const {enqueueSnackbar} = useSnackbar();
    const setBrightness = (brightness: number | number[]) => {
        if (Array.isArray(brightness)) {
            return;
        }
        lightConfig.brightness = brightness;
        wsClient.changeConfigProperty("brightness", brightness);
        setLCConfig(lightConfig);
    }

    const setBrightnessStrip = (brightness: number | number[], index: number) => {
        if (Array.isArray(brightness)) {
            return;
        }
        lightConfig.stripBrightness[index] = brightness;
        wsClient.changeConfigProperty("stripBrightness", lightConfig.stripBrightness);
        setLCConfig(lightConfig);
    }

    const setSpeed = (speed: number | number[]) => {
        if (Array.isArray(speed)) {
            return;
        }
        lightConfig.globalSpeed = speed;
        wsClient.changeConfigProperty("globalSpeed", speed);
        setLCConfig(lightConfig);
    }

    const setIntensity = (intiensity: number | number[]) => {
        if (Array.isArray(intiensity)) {
            return;
        }
        lightConfig.globalIntensity = intiensity;
        wsClient.changeConfigProperty("globalIntensity", intiensity);
        setLCConfig(lightConfig);
    }

    const reloadIps = () => {
        wsClient.send("wsapi.reloadIPs",{})
        enqueueSnackbar("Reloaded IPs", { variant: "success" });
    }

    const reloadPipelineCompositions = () => {
        wsClient.send("wsapi.reloadPipelineCompositions",{})
        enqueueSnackbar("Reloaded Compositions", { variant: "success" });
    }

    return (<>
        <Card variant="outlined" style={{
            paddingTop: "10px"
        }}>
            <CardHeader title={"System"}>
            </CardHeader>
            <CardContent style={{
                marginLeft: "10px",
                marginRight: "10px",
            }}>
                <Typography gutterBottom>Brightness global</Typography>
                <Slider
                    min={0}
                    max={100}
                    getAriaLabel={() => 'Brightness adjuster'}
                    defaultValue={lightConfig.brightness}
                    onChange={(e, value) => setBrightness(value)}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value) => `${value}%`}
                />
                {strips.map((strip, index) => (
                    <>
                        <Typography gutterBottom>Brightness {strip.position}</Typography>
                        <Slider
                            min={0}
                            max={100}
                            getAriaLabel={() => `Brightness ${strip.symbol}`}
                            defaultValue={lightConfig.stripBrightness[strip.index]}
                            onChange={(e, value) => setBrightnessStrip(value, strip.index)}
                            valueLabelDisplay="auto"
                            getAriaValueText={(value) => `${value}%`}
                        />
                    </>

                ))}
                <Divider sx={{
                        marginTop: "10px",
                        marginBottom: "20px",
                        borderColor: "rgba(255, 255, 255, 0.12)"
                    }}/>
                <Typography gutterBottom>Speed</Typography>
                <Slider
                    min={1}
                    max={99}
                    getAriaLabel={() => 'Adjuster'}
                    defaultValue={lightConfig.globalSpeed}
                    onChange={(e, value) => setSpeed(value)}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value) => `${value}%`}
                />
                <Typography gutterBottom>Intensity</Typography>
                <Slider
                    min={0.6}
                    max={1.5}
                    step={0.01}
                    marks={marks}
                    getAriaLabel={() => 'Adjuster'}
                    defaultValue={lightConfig.globalIntensity}
                    onChange={(e, value) => setIntensity(value)}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value) => `${value}%`}
                />
               <Divider sx={{
                        marginTop: "10px",
                        marginBottom: "20px",
                        borderColor: "rgba(255, 255, 255, 0.12)"
                    }}/>
                <Button onClick={() => reloadIps()} variant="contained">Reload IPs</Button>
                <Button onClick={() => reloadPipelineCompositions()} variant="contained">Reload Compositions</Button>
            </CardContent>
        </Card>
    </>)
}