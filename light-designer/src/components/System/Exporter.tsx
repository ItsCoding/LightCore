import { Button, Divider, Grid, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Point } from "../../classes/Point";
import { Strip } from "../../classes/Strips/Strip";
import * as path from "path"
import { GeneratedConfig } from "../../classes/ExportConfig";
import { WebSocketClient } from "../../../../light-client/src/system/WebsocketClient";
import { useSnackbar } from "notistack";


export type ExporterProps = {
    strips: Strip[];
    closeModal: () => void;
    backgroundInfos: {
        backgroundBase64: string,
        backgroundScaling: number,
        width: number,
        height: number,
    },
    globalScaling: number;
}

export type PointDict = {
    [key: number]: {
        [key: number]: Array<{ stripID: string; ledIndex: number; }>
    }
}

export const Exporter = ({ strips, closeModal, backgroundInfos, globalScaling }: ExporterProps) => {

    const canvasRef = useRef(null)
    const [imageBase64, setImageBase64] = useState<string>("");
    const [canvasSize, setCanvasSize] = useState<Point>(new Point(0, 0));
    const [pixelAmount, setPixelAmount] = useState(0);
    const [exportConfig, setExportConfig] = useState<GeneratedConfig>();
    const { enqueueSnackbar } = useSnackbar();

    const getCanvasSize = () => {
        let largestX = 0;
        let largestY = 0;
        let smallestX = Number.MAX_VALUE;
        let smallestY = Number.MAX_VALUE;

        strips.forEach(strip => {
            const startPoint = strip.startPoint;
            const endPoint = strip.endPoint;

            if (endPoint.x > largestX) {
                largestX = endPoint.x;
            }
            if (endPoint.y > largestY) {
                largestY = endPoint.y;
            }
            if (startPoint.x > largestX) {
                largestX = startPoint.x;
            }
            if (startPoint.y > largestY) {
                largestY = startPoint.y;
            }
        });

        //get the smallest pixel coordinate
        strips.forEach(strip => {
            const startPoint = strip.startPoint;
            const endPoint = strip.endPoint;
            if (endPoint.x < smallestX) {
                smallestX = endPoint.x;
            }
            if (endPoint.y < smallestY) {
                smallestY = endPoint.y;
            }
            if (startPoint.x < smallestX) {
                smallestX = startPoint.x;
            }
            if (startPoint.y < smallestY) {
                smallestY = startPoint.y;
            }
        });
        console.log("Largest X: " + largestX);
        console.log("Largest Y: " + largestY);
        console.log("Smallest X: " + smallestX);
        console.log("Smallest Y: " + smallestY);
        return { width: Math.ceil(largestX - smallestX), height: Math.ceil(largestY - smallestY), smallestX: smallestX, smallestY: smallestY }
    }

    const generateConfig = () => {
        const config: GeneratedConfig = {
            strips: {},
            ledPositions: {},
        }
        strips.forEach((strip, index) => {
            const stripConfig = strip.getExportConfig();

            // remove all properties that are null
            Object.keys(stripConfig).forEach(key => {
                if (stripConfig[key] === null) {
                    delete stripConfig[key];
                }
            });

            config.strips[strip.lcid + "-" + index] = stripConfig;
        })

        return config;
    }

    const randomHexColor = () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }


    useEffect(() => {
        if (strips) {
            const cvs = document.createElement('canvas');
            const { pointDict, size } = pointsTo2DDict(strips);
            cvs.width = size.width + 1;
            cvs.height = size.height + 1;
            const context = cvs.getContext("2d");
            //Our first draw
            context.fillStyle = '#000000'
            context.fillRect(0, 0, context.canvas.width, context.canvas.height)

            let pointCount = 0;
            Object.keys(pointDict).forEach(xString => {
                const x = parseInt(xString);
                Object.keys(pointDict[x]).forEach(yString => {
                    const y = parseInt(yString);
                    context.fillStyle = randomHexColor();
                    pointCount++;
                    context.fillRect(x - size.smallestX, y - size.smallestY, 1, 1)
                })
            })

            // let pointCount = 0;
            // strips.forEach(strip => {
            //     const points = strip.getLedsPositions();
            //     console.log("Points: ", points, strip);
            //     points.flat().forEach(point => {
            //         pointCount++;
            //         context.fillStyle = ledColor;
            //         ledColor = ledColor === '#FFFFFF' ? '#32a852' : '#FFFFFF';
            //         context.fillRect(point.x - size.smallestX, point.y - size.smallestY, 1, 1)
            //     })
            // });
            // console.table(strips.map(strip => ({ name: strip.stripName, start: strip.getExportLEDsAt(0).map(p => `${p.x}/${p.y}`).join("; "), end: strip.getExportLEDsAt(strip.ledCount - 1).map(p => `${p.x}/${p.y}`).join("; ") })))
            // console.table(strips.map(strip => ({ name: strip.stripName, start: strip.getPhysicalPositionsAt(0).toString(), end: strip.getPhysicalPositionsAt(strip.ledCount - 1).toString() })))
            setPixelAmount(pointCount)
            setImageBase64(cvs.toDataURL());
            setCanvasSize(new Point(cvs.width, cvs.height));
            const exportCfg = generateConfig();
            console.log("Config:::: ", exportCfg);
            setExportConfig(exportCfg)
        }

    }, [])



    const pointsTo2DDict = (strips: Strip[]) => {
        const pointDict: PointDict = {}
        let largestX = 0;
        let largestY = 0;
        let smallestX = 0;
        let smallestY = 0;
        let smallestDensity = Number.MAX_VALUE;
        strips.forEach(strip => {
            const density = strip.ledCount / (strip.getPhysicalLength / 100)
            if (smallestDensity > density) {
                smallestDensity = density;
            }
        })

        console.log("Smallest Density: ", smallestDensity)
        strips.forEach(strip => {
            const leds = strip.getExportLEDs(smallestDensity);
            console.log("StripLEDs", strip.lcid, leds)
            leds.forEach((virtualPoints, ledIndex) => {
                // console.log("Virtual Points: ", strip.lcid, ledIndex)
                virtualPoints.forEach((point) => {
                    if (!pointDict[Math.round(point.x)]) {
                        pointDict[Math.round(point.x)] = {}
                    }
                    if (!pointDict[Math.round(point.x)][Math.round(point.y)]) {
                        pointDict[Math.round(point.x)][Math.round(point.y)] = []
                    }

                    if (point.x > largestX) {
                        largestX = point.x;
                    }
                    if (point.y > largestY) {
                        largestY = point.y;
                    }
                    if (point.x < smallestX) {
                        smallestX = point.x;
                    }
                    if (point.y < smallestY) {
                        smallestY = point.y;
                    }

                    pointDict[Math.round(point.x)][Math.round(point.y)].push({
                        stripID: strip.lcid,
                        ledIndex: ledIndex
                    })
                })
            })
        })

        return {
            pointDict,
            size: {
                width: largestX,
                height: largestY,
                smallestX,
                smallestY
            }
        };
    }

    const syncToMessageBroker = async () => {
        try {
            const { pointDict, size } = pointsTo2DDict(strips);
            console.log("LedPositions: ", pointDict)
            const wsClient = WebSocketClient.getInstance()
            wsClient.send("wsapi.syncStage", {
                ...exportConfig,
                ledPositions: pointDict,
                canvasSize: size
            });

            wsClient.issueKeySet("designer.project", JSON.stringify({
                strips,
                backgroundInfos,
                globalScaling
            }))
            enqueueSnackbar("Synced to message broker", { variant: "success" })
        } catch (error) {
            enqueueSnackbar("Failed to sync to message broker", { variant: "error" })
            console.warn(error);
        }
    }

    return (
        <Grid container>
            <Grid item xs={8}>
                <div style={{
                    height: "100vh",
                }}>
                    <div style={{ marginTop: "20px", marginLeft: "20px" }}>
                        <Typography variant="h4">Export <Typography variant="caption">{canvasSize.x}/ {canvasSize.y} - {canvasSize.x * canvasSize.y} Canvaspixels - {pixelAmount} LEDs </Typography></Typography>
                    </div>
                    <Divider />
                    <img src={imageBase64} style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        marginTop: "20px"
                    }} />
                </div>
            </Grid>
            <Grid item xs={4} >
                <Button sx={{
                    marginTop: "20px",
                    marginBottom: "20px",
                    position: "absolute",
                    right: "20px"
                }} color="warning" variant="contained" onClick={() => syncToMessageBroker()}>Sync to MessageBroker</Button>
                <Button sx={{
                    marginTop: "20px",
                    marginBottom: "20px",
                    position: "absolute",
                    right: "250px"
                }} variant="contained" onClick={() => closeModal()}>Close</Button>
                <pre>{exportConfig && JSON.stringify(exportConfig, null, 2)}</pre>
            </Grid>
        </Grid>
    )
}