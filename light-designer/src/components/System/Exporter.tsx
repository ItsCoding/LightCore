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
}


export const Exporter = ({ strips, closeModal }: ExporterProps) => {

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
            const startPoint = strip.getPhysicalPositionsAt(0)
            const endPoint = strip.getPhysicalPositionsAt(strip.ledCount - 1)

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
            const startPoint = strip.getPhysicalPositionsAt(0)
            const endPoint = strip.getPhysicalPositionsAt(strip.ledCount - 1)
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
            strips: {}
        }
        strips.forEach((strip, index) => {
            const stripConfig = strip.getExportConfig();
            config.strips[strip.lcid + "-" + index] = stripConfig;
        })

        return config;
    }


    useEffect(() => {
        if (strips) {
            const cvs = document.createElement('canvas');
            const size = getCanvasSize();
            cvs.width = size.width + 1;
            cvs.height = size.height + 1;
            const context = cvs.getContext("2d");
            //Our first draw
            context.fillStyle = '#000000'
            context.fillRect(0, 0, context.canvas.width, context.canvas.height)
            let pointCount = 0;
            strips.forEach(strip => {
                const points = strip.getPhysicalPositions();
                points.flat().forEach(point => {
                    pointCount++;
                    context.fillStyle = '#FFFFFF'
                    context.fillRect(point.x - size.smallestX, point.y - size.smallestY, 1, 1)
                })
            });
            console.table(strips.map(strip => ({ name: strip.stripName, start: strip.getExportLEDsAt(0).map(p => `${p.x}/${p.y}`).join("; "), end: strip.getExportLEDsAt(strip.ledCount - 1).map(p => `${p.x}/${p.y}`).join("; ") })))
            console.table(strips.map(strip => ({ name: strip.stripName, start: strip.getPhysicalPositionsAt(0).toString(), end: strip.getPhysicalPositionsAt(strip.ledCount - 1).toString() })))
            setPixelAmount(pointCount)
            setImageBase64(cvs.toDataURL());
            setCanvasSize(new Point(cvs.width, cvs.height));
            const exportCfg = generateConfig();
            console.log("Config:::: ", exportCfg);
            setExportConfig(exportCfg)
        }

    }, [])

    const syncToMessageBroker = async () => {
        try {
            const wsClient = WebSocketClient.getInstance()
            wsClient.send("wsapi.syncStage", exportConfig);
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