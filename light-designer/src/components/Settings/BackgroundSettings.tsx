import { Button, Divider, Grid, Paper, Slider, Typography } from "@mui/material"
export type BackgroundSettingsProps = {
    backgroundInfos: {
        backgroundBase64: string,
        backgroundScaling: number,
        width: number,
        height: number,
    },
    setBackgroundInfos: (newBackgroundInfos: {
        backgroundBase64: string,
        backgroundScaling: number,
        width: number,
        height: number
    }) => void;
    backgroundGreyScale: number,
    setBackgroundGreyScale: (newBackgroundGreyScale: number) => void;
}

const getImageSize = async (base64: string) => {
    return new Promise<{ width: number, height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                width: img.width,
                height: img.height,
            })
        }
        img.src = base64;
    })
}

export const BackgroundSettings = ({ backgroundInfos, setBackgroundInfos, backgroundGreyScale, setBackgroundGreyScale }: BackgroundSettingsProps) => {
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
        <Typography variant="caption">Backgroundscaling</Typography>
        <div style={{ paddingLeft: 10, paddingRight: 20 }}>

            <Slider min={0.1} valueLabelDisplay="auto" marks={[
                { value: 0.1, label: "0.1" },
                { value: 10, label: "10" },
            ]} max={10} step={0.01} value={backgroundInfos.backgroundScaling} onChange={(event, newValue) => {
                setBackgroundInfos({ ...backgroundInfos, backgroundScaling: newValue as number })
            }} />
        </div>
        <Typography variant="caption">Brightness</Typography>
        <div style={{ paddingLeft: 10, paddingRight: 20 }}>
            <Slider min={0} valueLabelDisplay="auto" marks={[
                { value: 0, label: "0%" },
                { value: 100, label: "100%" },
            ]} max={100} step={1} value={backgroundGreyScale} onChange={(event, newValue) => {
                setBackgroundGreyScale(newValue as number)
            }} />
        </div>
        <Grid container columnSpacing={2} sx={{ paddingLeft: 1.2, paddingRight: 1 }}>
            <Grid item xs={3}>
                <Button sx={{ marginTop: 1 }} onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (event) => {
                        const file = (event.target as HTMLInputElement).files![0];
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                            const size = await getImageSize(event.target!.result as string);
                            setBackgroundInfos({ ...backgroundInfos, backgroundBase64: event.target!.result as string, ...size })
                        }
                        reader.readAsDataURL(file);
                    }
                    input.click();
                }}>Select background</Button>
            </Grid>
            <Grid item xs={3}>
                <Button sx={{ marginTop: 1 }} onClick={() => {
                    setBackgroundInfos({ backgroundScaling: 1, backgroundBase64: "", width: 0, height: 0 })
                }}>Clear</Button>
            </Grid>
        </Grid>


    </Paper>)
}