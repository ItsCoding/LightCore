import { Flare, Lightbulb } from "@mui/icons-material"
import { Grid, Paper, Typography } from "@mui/material"
import { Box, Stack } from "@mui/system"
import { BeatMapEvent, BSFixture, existingFixures } from "../system/BeatsaberHandler"

export type FixureBarProps = {
    stateMap: Map<number, BeatMapEvent>
}

export const FixureBar = ({ stateMap }: FixureBarProps) => {

    const getCardBackgroundColor = (fixure: BSFixture) => {
        if (fixure.type === "effekt") return undefined
        const state = stateMap.get(fixure.id)
        if (!state) return undefined
        if (!state.value) return undefined

        switch (state.value) {
            case 1:
                return "#1716ff"
            case 2:
                return "white"
            case 3:
                return "#5e5cff"
            case 5:
                return "#ff2135"
            case 6:
                return "white"
            case 7:
                return "#ff8f99"
            default:
                return undefined
        }
    }

    console.log("ReRender");

    return (
        <Box sx={{ padding: 2 }}>
            <Grid container rowSpacing={2} columnSpacing={2} >
                {existingFixures.map((fixure) => {
                    return (
                        <Grid key={fixure.id} item xs={2}>
                            <Paper sx={{ bgcolor: getCardBackgroundColor(fixure), padding: 1 }} elevation={3}>
                                <Stack spacing={2} direction="column" alignItems={"center"}>
                                    <Typography>{fixure.name}</Typography>
                                    <Box>
                                        {fixure.type !== "effekt" ? <Lightbulb fontSize="large" /> : <Flare fontSize="large" />}
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    )
                })}
            </Grid>
        </Box>
    )
}