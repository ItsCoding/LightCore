import { useTheme } from "@mui/material/styles";
import { Button, Grid, useMediaQuery } from "@mui/material"
import { TouchButton } from "../General/TouchButton";
import { Board } from "../../types/Board";
import { BoardButtonInfos } from "../BoardEditor/BoardButtonInfos";

type ButtonGridProsp = {
    board: Board;
}

export const ButtonGrid = ({ board }: ButtonGridProsp) => {

    const amountButtons = Array.from(Array(42).keys())
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.only('xs'));
    console.log("IS SX: ", matches)
    return (
        <Grid container columnSpacing={1} rowSpacing={1}>
            {
                amountButtons.map((btn, i) => {
                    const composition = board.elements[i]?.data
                    return (
                        <Grid item xs={4} md={2}>
                            <TouchButton
                                disabled={!composition}
                                style={{
                                    height: matches ? "6vh" : "11.7vh",
                                    color: "white"
                                }}
                                variant="outlined"
                                fullWidth
                                size="medium"
                                onInteract={() => composition.activate()}>
                                {
                                    composition ? <BoardButtonInfos composition={composition} /> : null
                                }
                            </TouchButton>
                        </Grid>
                    )
                })
            }
        </Grid>)
}