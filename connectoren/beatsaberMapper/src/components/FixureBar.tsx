import { Flare, Lightbulb } from "@mui/icons-material"
import { Button, Dialog, Grid, List, MenuItem, Paper, Typography } from "@mui/material"
import { Box, Stack } from "@mui/system"
import { ipcRenderer } from "electron"
import { useState } from "react"
import { sendKnobToMidi, sendToMidi } from "../system/ArtnetHelper"
import { BeatMapEvent, BSFixture, existingFixures } from "../system/BeatsaberHandler"

export type FixureBarProps = {
    stateMap: Map<number, BeatMapEvent>
}

export const FixureBar = ({ stateMap }: FixureBarProps) => {

    const [selectedFixure, setSelectedFixure] = useState<BSFixture | undefined>(undefined)

    const getCardBackgroundColor = (fixure: BSFixture) => {
        if (fixure.type === "effekt") {
            // scale white from 0 to 7
            const state = stateMap.get(fixure.id)
            if (!state) return undefined
            if (!state.value) return undefined

            const value = state.value
            const white = Math.round((value / 7) * 255)
            return `rgb(${white},${white},${white})`
        } else {
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

    }

    // console.log("ReRender");

    const trainMidi = (value: number) => {
        if (value > 4) {
            ipcRenderer.send('sendToMidi', {
                command: "noteon",
                data: {
                    channel: 1,
                    note: (selectedFixure.id * 10) + value,
                    velocity: 127
                }
            })
            setTimeout(() => {
                ipcRenderer.send('sendToMidi', {
                    command: "noteoff",
                    data: {
                        channel: 1,
                        note: (selectedFixure.id * 10) +  value,
                        velocity: 127
                    }
                })
            }, 1000);
        } else {
            sendToMidi(selectedFixure?.id, value, selectedFixure)
        }

    }

    const trainMidiKnob = (value: number) => {
        sendKnobToMidi(selectedFixure?.id, value)
    }

    return (
        <Box sx={{ padding: 2 }}>

            <Dialog open={!!selectedFixure} onClose={() => setSelectedFixure(undefined)}>
                <Paper sx={{ padding: 2 }}>
                    <Typography variant="h5">{selectedFixure?.name} {selectedFixure?.type !== "effekt" ? <Lightbulb fontSize="medium" /> : <Flare fontSize="medium" />}</Typography>
                    {selectedFixure?.type === "light" && <Box>
                        <List>
                            <MenuItem onClick={() => trainMidi(0)}>0: Off</MenuItem>
                            <MenuItem onClick={() => trainMidi(1)}>1: On</MenuItem>
                            <MenuItem onClick={() => trainMidi(2)}>2: Flash</MenuItem>
                            <MenuItem onClick={() => trainMidi(3)}>3: Fade</MenuItem>
                            <MenuItem onClick={() => trainMidi(5)}>5: Color 1 (Blue)</MenuItem>
                            <MenuItem onClick={() => trainMidi(6)}>6: Color 2 (Red)</MenuItem>

                        </List>
                    </Box>}
                    {selectedFixure?.type === "effekt" && <Box>
                        <List>
                            {[-60, -45, -30, -15, 15, 30, 45, 60].map((value, index) => {
                                return <MenuItem onClick={() => trainMidiKnob(index)}>Speed {index}</MenuItem>
                            })}
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