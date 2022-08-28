import { Card, CardContent, CardHeader, Slider, Typography } from "@mui/material"
import { WebSocketClient } from "../../system/WebsocketClient";
import { LightCoreConfig } from "../../types/LightCoreConfig"

type QuickSystemControllsProps = {
    lightConfig: LightCoreConfig,
    setLCConfig: (config: LightCoreConfig) => void,
}

const marks = [
    {
      value: 1,
      label: 'Normal',
    }
  ];

export const QuickSystemControlls = ({ lightConfig, setLCConfig }: QuickSystemControllsProps) => {
    const wsClient = WebSocketClient.getInstance();

    const setBrightness = (brightness: number | number[]) => {
        if (Array.isArray(brightness)) {
            return;
        }
        lightConfig.brightness = brightness;
        wsClient.changeConfigProperty("brightness", brightness);
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
                <Typography gutterBottom>Brightness</Typography>
                <Slider
                    min={0}
                    max={100}
                    getAriaLabel={() => 'Brightness adjuster'}
                    defaultValue={lightConfig.brightness}
                    onChange={(e, value) => setBrightness(value)}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value) => `${value}%`}
                />
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
            </CardContent>
        </Card>
    </>)
}