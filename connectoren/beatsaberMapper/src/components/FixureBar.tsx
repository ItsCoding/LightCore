import { Flare, Lightbulb } from "@mui/icons-material"
import { Button, Dialog, Grid, List, MenuItem, Paper, Typography } from "@mui/material"
import { Box, Stack } from "@mui/system"
import { useState } from "react"
import { sendToMidi } from "../system/ArtnetHelper"
import { BeatMapEvent, BSFixture, existingFixures } from "../system/BeatsaberHandler"

export type FixureBarProps = {
    stateMap: Map<number, BeatMapEvent>
}

export const FixureBar = ({ stateMap }: FixureBarProps) => {

    const [selectedFixure, setSelectedFixure] = useState<BSFixture | undefined>(undefined)

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

    const trainMidi = (value: number) => {
        sendToMidi(selectedFixure?.id, value,selectedFixure)
    }

    return (
        <Box sx={{ padding: 2 }}>

            <Dialog open={!!selectedFixure} onClose={() => setSelectedFixure(undefined)}>
                <Paper sx={{ padding: 2 }}>
                    <Typography variant="h5">{selectedFixure?.name} {selectedFixure?.type !== "effekt" ? <Lightbulb fontSize="medium" /> : <Flare fontSize="medium" />}</Typography>
                    {selectedFixure?.type === "light" && <Box>
                        <List>
                            <MenuItem onClick={() => trainMidi(0)}>0: Off</MenuItem>
                            <MenuItem onClick={() => trainMidi(1)}>1: Color 1 On</MenuItem>
                            <MenuItem onClick={() => trainMidi(2)}>2: Color 1 Flash</MenuItem>
                            <MenuItem onClick={() => trainMidi(3)}>3: Color 1 Fade</MenuItem>
                            <MenuItem onClick={() => trainMidi(5)}>5: Color 2 On</MenuItem>
                            <MenuItem onClick={() => trainMidi(6)}>6: Color 2 Flash</MenuItem>
                            <MenuItem onClick={() => trainMidi(7)}>7: Color 2 Fade</MenuItem>
                        </List>
                    </Box>}
                </Paper>
            </Dialog>


            <Grid container rowSpacing={2} columnSpacing={2} >
                {existingFixures.map((fixure) => {
                    return (
                        <Grid key={fixure.id} item xs={2}>
                            <Button sx={{ bgcolor: getCardBackgroundColor(fixure), padding: 1 }} onClick={() => {
                                setSelectedFixure(fixure)
                            }}>
                                <Stack spacing={2} direction="column" alignItems={"center"}>
                                    <Typography>{fixure.name}</Typography>
                                    <Box>
                                        {fixure.type !== "effekt" ? <Lightbulb fontSize="large" /> : <Flare fontSize="large" />}
                                    </Box>
                                </Stack>
                            </Button>
                        </Grid>
                    )
                })}
            </Grid>
        </Box>
    )
}