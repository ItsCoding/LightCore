import { Alert, Divider, Grid, Paper, Slider, TextField, Typography } from "@mui/material";
import { Strip } from "../../classes/Strips/Strip";
import ColorizeIcon from '@mui/icons-material/Colorize';
import { Point } from "../../classes/Point";
import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
export type StageViewerProps = {
    selectedStrip: Strip | null;
    changeSelectedStrip: (newStrip: Strip) => void;
}

const valuetext = (value: number) => {
    return `${value}°`;
}

const NoStrip = () => {
    return (<div style={{ paddingTop: 20 }}>
        <Alert severity="info">No Strip Selected</Alert>
    </div>)
}

const marks = [
    {
        value: -180,
        label: '-180°',
    },
    {
        value: -135,
        label: '-135°',
    },
    {
        value: -90,
        label: '-90°',
    },
    {
        value: -45,
        label: '-45°',
    },
    {
        value: 0,
        label: '0°',
    },
    {
        value: 45,
        label: '45°',
    },
    {
        value: 90,
        label: '90°',
    },
    {
        value: 135,
        label: '135°',
    },
    {
        value: 180,
        label: '180°',
    },
];

export const StripSettings = ({ selectedStrip, changeSelectedStrip }: StageViewerProps) => {

    const [posX, setPosX] = useState<string>();
    const [posY, setPosY] = useState<string>();
    const { enqueueSnackbar } = useSnackbar();
    useEffect(() => {
        if (selectedStrip) {
            setPosX(selectedStrip.startPoint.x.toString());
            setPosY(selectedStrip.startPoint.y.toString());
        }
    }, [selectedStrip])

    const changeStartPosition = (newPosition: Point) => {
        if (selectedStrip && `${newPosition.x}`.length > 0 && `${newPosition.y}`.length > 0) {
            selectedStrip.setPosition(newPosition.x, newPosition.y)
            changeSelectedStrip(selectedStrip);
        }
    }

    const onXChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length > 0) {
            const newPoint = new Point(parseInt(event.target.value), parseInt(posY) || 0);
            changeStartPosition(newPoint);
        }
        setPosX(event.target.value);
    }

    const onYChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length > 0) {
            const newPoint = new Point(parseInt(posX) || 0, parseInt(event.target.value));
            changeStartPosition(newPoint);
        }
        setPosY(event.target.value);
    }

    const onAngleChange = (value: number | number[]) => {
        if (value > 180 || value < -180) {
            enqueueSnackbar("Angle must be between -180° and 180°", { variant: "error" });
            return;
        }
        if (selectedStrip) {
            selectedStrip.rotate(value as number);
            changeSelectedStrip(selectedStrip);
        }
    }

    const StartEnd = () => {
        const startReal = selectedStrip.getPositionAt(0)[0]
        const endRealData = selectedStrip.getPositionAt(selectedStrip.ledCount - 1)
        const endReal = endRealData[endRealData.length - 1]
        return (<Grid container columnSpacing={2} rowSpacing={2}>
            <Grid item xs={6}>
                <p>Start X/Y: {Math.round(startReal.x * 100) / 100} / {Math.round(startReal.y * 100) / 100} </p>
            </Grid>
            <Grid item xs={6}>
                <p>End X/Y: {Math.round(endReal.x * 100) / 100} / {Math.round(endReal.y * 100) / 100} </p>
            </Grid>
        </Grid>)
    }

    return (
        <div style={{
            marginTop: 10,
        }}>
            <Paper sx={{
                width: "100%",
                height: "100%",
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingBottom: "20px"
            }}>
                <Typography variant="h6">
                    Strip settings
                </Typography>
                <Divider />
                {selectedStrip ?
                    <Grid container columnSpacing={2} rowSpacing={2}>
                        <Grid item xs={6}>
                            <TextField onChange={onXChange} type={"number"} id="standard-basic" label="Position-X" variant="standard" fullWidth value={posX} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField onChange={onYChange} type={"number"} id="standard-basic" label="Position-Y" variant="standard" fullWidth value={posY} />
                        </Grid>
                        <Grid item xs={6}>
                            <p>End X: {Math.round(selectedStrip.endPoint.x * 100) / 100} </p>
                        </Grid>
                        <Grid item xs={6}>
                            <p>End Y: {Math.round(selectedStrip.endPoint.y * 100) / 100} </p>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption">
                                Pixel Coordinates
                            </Typography>
                            <StartEnd />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>

                        <Grid item xs={8}>
                            <div style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                            }}>
                                <Slider
                                    aria-label="Angle"
                                    value={selectedStrip.getStripAngle}
                                    defaultValue={selectedStrip.getStripAngle}
                                    getAriaValueText={valuetext}
                                    min={-180}
                                    max={180}
                                    valueLabelDisplay="auto"
                                    marks={marks}
                                    onChange={(e, v) => onAngleChange(v)}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={4}>
                            <div style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                            }}>
                                <TextField onChange={(e) => onAngleChange(parseInt(e.target.value))} type={"number"} id="standard-basic" label="Position-Y" variant="standard" fullWidth value={selectedStrip.getStripAngle} />
                            </div>
                        </Grid>
                    </Grid> : <NoStrip />}
            </Paper>
        </div>
    )
}