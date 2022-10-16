import { Card, CardContent, CardHeader, Divider, Slider, Typography } from "@mui/material"
import { WebSocketClient } from "../../system/WebsocketClient";
import { LightCoreConfig } from "../../types/LightCoreConfig"

type ColorCalibrationProps = {
    lightConfig: LightCoreConfig,
    setLCConfig: (config: LightCoreConfig) => void,
}


export const ColorCalibration = ({ lightConfig, setLCConfig }: ColorCalibrationProps) => {
    const wsClient = WebSocketClient.getInstance();
    const adjustColor = (color: number, index: number, group: string) => {
        lightConfig.colorCalibration[group][index] = color;
        console.log(lightConfig.colorCalibration);
        wsClient.changeConfigProperty("colorCalibration", lightConfig.colorCalibration);
        setLCConfig(lightConfig);
    }

    return (
        <Card variant="outlined" style={{
            paddingTop: "10px"
        }}
        >
            <CardHeader title={"Color Calibration"}>
            </CardHeader>
            <CardContent style={{
                marginLeft: "10px",
                marginRight: "10px",
            }}>
                {Object.keys(lightConfig.colorCalibration).map((group, index) => (<>
                    {index > 0 && <Divider sx={{
                        marginTop: "10px",
                        marginBottom: "20px",
                        borderColor: "rgba(255, 255, 255, 0.12)"
                    }}/>}
                    <Typography gutterBottom>{group.toLocaleUpperCase()}</Typography>
                    <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        getAriaLabel={() => 'Red adjuster'}
                        sx={{ color: "red" }}
                        defaultValue={lightConfig.colorCalibration[group][0]}
                        onChange={(e, value) => adjustColor(value as number, 0, group)}
                        valueLabelDisplay="auto"
                        getAriaValueText={(value) => `${value}%`}
                    />
                    <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        getAriaLabel={() => 'Green adjuster'}
                        sx={{ color: "green" }}
                        defaultValue={lightConfig.colorCalibration[group][1]}
                        onChange={(e, value) => adjustColor(value as number, 1, group)}
                        valueLabelDisplay="auto"
                        getAriaValueText={(value) => `${value}%`}
                    />
                    <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        getAriaLabel={() => 'Blue adjuster'}
                        sx={{ color: "blue" }}
                        defaultValue={lightConfig.colorCalibration[group][2]}
                        onChange={(e, value) => adjustColor(value as number, 2, group)}
                        valueLabelDisplay="auto"
                        getAriaValueText={(value) => `${value}%`}
                    />
                    
                </>))}
            </CardContent>
        </Card>
    )
}