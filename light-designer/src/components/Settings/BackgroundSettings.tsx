import { Button, Divider, Grid, Paper, Slider, Typography } from "@mui/material"
export type BackgroundSettingsProps = {
    backgroundInfos: {
        backgroundBase64: string,
        backgroundScaling: number,
    },
    setBackgroundInfos: (newBackgroundInfos: { backgroundBase64: string, backgroundScaling: number }) => void;
}

export const BackgroundSettings = ({ backgroundInfos, setBackgroundInfos }: BackgroundSettingsProps) => {
    return (<Paper sx={{
        width: "100%",
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingBottom: "10px",
        marginTop: "10px"
    }}>

        <Typography variant="h6">
            Background
        </Typography>
        <Divider />
        {/* Make a zoom slider that changes the scaling property in backgroundInfos */}
        {/* Make a button that opens a file picker and sets the backgroundBase64 property in backgroundInfos */}
        <Grid container columnSpacing={2} sx={{ paddingLeft: 1.2, paddingRight: 1 }}>
            <Grid item xs={7} >
                <Slider min={0.1} marks={[
                    { value: 0.1, label: "0.1" },
                    { value: 10, label: "10" },
                ]} max={10} step={0.1} value={backgroundInfos.backgroundScaling} onChange={(event, newValue) => {
                    setBackgroundInfos({ ...backgroundInfos, backgroundScaling: newValue as number })
                }} />
            </Grid>
            <Grid item xs={3}>
                <Button sx={{marginTop: 1}} onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (event) => {
                        const file = (event.target as HTMLInputElement).files![0];
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            setBackgroundInfos({ ...backgroundInfos, backgroundBase64: event.target!.result as string })
                        }
                        reader.readAsDataURL(file);
                    }
                    input.click();
                }}>Select background</Button>
            </Grid>
            <Grid item xs={2}>
                <Button sx={{marginTop: 1}} onClick={() => {
                    setBackgroundInfos({ backgroundScaling: 1, backgroundBase64: "" })
                }}>Clear</Button>
            </Grid>
        </Grid>


    </Paper>)
}