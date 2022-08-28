import { Grid } from "@mui/material"

export const HomePage = () => {
    return (
        <div>
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
                style={{ minHeight: '80vh' }}
            >
                <Grid item xs={4}>
                    <img style={{
                        width: "200px",
                    }}src="lamps.png"/>
                    <h1>LightCore</h1>
                    <p>Audio-reactive LED controller</p>
                </Grid>
            </Grid>
        </div>
    )
}