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
                style={{ minHeight: '100vh' }}
            >
                <Grid item xs={4}>
                    <h2>LightCore</h2>
                    <p>Audio-reactive LED controller</p>
                </Grid>
            </Grid>
        </div>
    )
}