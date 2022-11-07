import { Divider, Grid, InputAdornment, Paper, Slider, TextField, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { Strip } from "../../classes/Strips/Strip";
import { debounce } from "lodash";
export type StripSettingsProps = {
    strips: Strip[];
    setStrips: (newStrips: Strip[]) => void;
    globalScaling: number;
    setGlobalScalingState: (newScaling: number) => void;
}

export const GlobalSettings = ({ setStrips, strips, setGlobalScalingState, globalScaling }: StripSettingsProps) => {

    const [getGlobalMaxStripDensity, setGlobalMaxStripDensityState] = useState(60)
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })


    const handleDebounceFn = () => {
        console.log("Global Settings Updated");
        //find the max strip density
        let maxDensity = 0;
        strips.forEach(strip => {
            const density = strip.ledCount / (strip.getPhysicalLength / 100)
            if (maxDensity < density) {
                maxDensity = density;
            }
        })
        //get the largest pixel coordinate
        let largestX = 0;
        let largestY = 0;
        let smallestX = Number.MAX_VALUE;
        let smallestY = Number.MAX_VALUE;
       
        strips.forEach(strip => {
            const startPoint = strip.getPositionAt(0)[0]
            const endRealData = strip.getPositionAt(strip.ledCount - 1)
            const endPoint = endRealData[endRealData.length - 1]
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
            const startPoint = strip.getPositionAt(0)[0]
            const endRealData = strip.getPositionAt(strip.ledCount - 1)
            const endPoint = endRealData[endRealData.length - 1]
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
        setCanvasSize({ width: Math.ceil(largestX - smallestX), height: Math.ceil(largestY - smallestY) })
        setGlobalMaxStripDensityState(maxDensity);
    }
    const debounceFn = useCallback(debounce(handleDebounceFn, 500), [strips]);

    useEffect(() => {
        console.log("UseEffect")
        debounceFn();

    }, [strips])


    const setGlobalMaxStripDensity = (newDensity: number) => {
        setGlobalMaxStripDensityState(newDensity)
        const newStrips = [...strips]
        newStrips.forEach(strip => {
            strip.maxStripDensity = newDensity
        })
        setStrips(newStrips)
    }


    return (
        <Paper sx={{
            width: "100%",
            paddingLeft: "10px",
            paddingRight: "10px",
            paddingBottom: "10px",
            marginTop: "10px"
        }}>
            <Typography variant="h6">
                Global Settings
            </Typography>
            <Divider />
            <Typography variant="caption">
                Global Scaling
            </Typography>
            <Slider
                aria-label="Angle"
                value={globalScaling}
                min={0.5}
                max={10}
                step={0.1}
                valueLabelDisplay="auto"
                onChange={(e, v) => setGlobalScalingState(v as number)}
            />
            <TextField type={"number"} id="standard-basic" label="Most Dense Strip" variant="standard" InputProps={{
                endAdornment: <InputAdornment position="start">/m</InputAdornment>,
            }} disabled onChange={(e) => setGlobalMaxStripDensity(parseInt(e.target.value))} value={getGlobalMaxStripDensity} fullWidth />
            <Typography variant="caption">
                Canvas Size: {canvasSize.width} x {canvasSize.height}
            </Typography>
        </Paper>
    )
}