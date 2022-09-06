import { useTheme } from "@mui/material/styles";
import { Button, Grid, useMediaQuery } from "@mui/material"
import { TouchButton } from "../General/TouchButton";

export const ButtonGrid = () => {

    const amountButtons = Array.from(Array(42).keys())
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.only('xs'));
    console.log("IS SX: ", matches)
    return ( 
        <Grid container columnSpacing={1} rowSpacing={1}>
            {
                amountButtons.map((btn, i) => {
                    return (
                        <Grid item xs={4} md={2}>
                            <TouchButton style={{
                                height: matches ? "6vh" : "11.7vh",
                                color: "white"
                            }} variant="outlined" fullWidth size="medium">{i}</TouchButton>
                        </Grid>
                    )
                })
            }
        </Grid>)
}