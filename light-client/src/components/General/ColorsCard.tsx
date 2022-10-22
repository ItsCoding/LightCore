import { Grid, Card, CardHeader, CardContent, List, ListItem, Chip, DialogContentText, Button } from "@mui/material"
import React, { useEffect } from "react";
import { PhotoshopPicker } from "react-color"
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { ConfirmDictType, SaveBar } from "./SaveBar";
import { ColorPalette } from "../../types/ColorPalette";
import { WebSocketClient } from "../../system/WebsocketClient";
import { ReturnType } from "../../types/TopicReturnType";
import { useSnackbar } from "notistack";
import { createUUID } from "../../system/Utils";

export const ColorsCard = () => {
    const wsClient = WebSocketClient.getInstance();
    const [colorSet, setColorSet] = React.useState<string[]>([]);
    const [color, setColor] = React.useState<string>("#000000");
    const [colorPalettes, setColorPalettes] = React.useState<ColorPalette[]>([]);
    const [selectedPalette, setSelectedPalette] = React.useState<ColorPalette>();
    const { enqueueSnackbar } = useSnackbar();
    useEffect(() => {
        const handlerID = wsClient.addEventHandler(ReturnType.WSAPI.GET_KEY_VALUE, (topic) => {
            if (topic.message.key === "colorPalettes") {
                console.log("Got color palettes", topic);
                console.log(JSON.parse(topic.message.value))
                setColorPalettes(JSON.parse(topic.message.value));
            }
        })
        wsClient.issueKeyGet("colorPalettes");
        return () => {
            wsClient.removeEventHandler(handlerID)
        }
    }, [])

    const savePalette = () => {
        if (colorSet.length < 3) {
            enqueueSnackbar("Palette must have at least thre colors", { variant: "error"});
            return;
        }

        if (!selectedPalette) {
            enqueueSnackbar("Please enter a name", { variant: "error"});
            return;
        }
        if (selectedPalette.id !== "") {
            const index = colorPalettes.findIndex((palette) => palette.id === selectedPalette.id);
            const newPalette = {
                ...selectedPalette,
            }
            newPalette.colors = colorSet;
            if (index !== -1) {
                colorPalettes[index] = newPalette;
                wsClient.issueKeySet("colorPalettes", JSON.stringify(colorPalettes));
                enqueueSnackbar("Palette saved", { variant: "success"});
            } else {
                enqueueSnackbar("Palette not found", { variant: "error"});
                return
            }
        } else {
            const newPalette: ColorPalette = {
                id: createUUID(),
                name: selectedPalette?.name || "New Palette",
                colors: colorSet
            }
            setColorPalettes([...colorPalettes, newPalette])
            setSelectedPalette(newPalette);
            wsClient.issueKeySet("colorPalettes", JSON.stringify([...colorPalettes, newPalette]))
            enqueueSnackbar("Palette saved", { variant: "success"});
        }

    }

    const confirmDict: ConfirmDictType = {
        1: {
            title: "Overwrite existing composition?",
            text: (
                <DialogContentText id="alert-dialog-slide-description">
                    If you confirm <b>{selectedPalette?.name}</b> will be overridden with the current colors.
                </DialogContentText>
            ),
            confirm: (exit) => {
                savePalette();
                exit();
            },
            confirmText: "Save"
        },
        2: {
            title: "Delete composition?",
            text: (
                <DialogContentText id="alert-dialog-slide-description">
                    If you confirm <b>{selectedPalette?.name}</b> will be deleted.
                </DialogContentText>
            ),
            confirm: (exit) => {
                const newStore = colorPalettes.filter(a => a.id !== selectedPalette?.id)
                setColorPalettes(newStore);
                wsClient.issueKeySet("colorPalettes", JSON.stringify(newStore))
                enqueueSnackbar(`Deleted Colorpalette: ${selectedPalette?.name}!`, { variant: 'success'});
                exit();
            },
            confirmText: "Delete"
        },
        3: {
            title: "Load composition?",
            text: (
                <DialogContentText id="alert-dialog-slide-description">
                    If you confirm <b>{selectedPalette?.name}</b> will be loaded.
                </DialogContentText>
            ),
            confirm: (exit) => {
                if (selectedPalette) {
                    setColorSet(selectedPalette.colors);
                    enqueueSnackbar(`Loaded composition: ${selectedPalette?.name}!`, { variant: 'success'});
                    exit();
                }
            },
            confirmText: "Load"
        }
    }

    const addColor = (co: string) => {
        console.log("addColor", co);
        setColorSet([...colorSet, co]);
    }

    const removeColor = (index: number) => {
        console.log("removeColor", index);
        const newColorSet = [...colorSet];
        newColorSet.splice(index, 1);
        setColorSet(newColorSet);
    }

    const isIdInSet = (id: string | undefined) => {
        if (!id) return false;
        for (const pal of colorPalettes) {
            if (pal.id === id) return true;
        }
        return false;
    }

    return (<>
        {/* <Grid container columnSpacing={2}>
            <Grid item xs={6} md={6}> */}
        <Card variant="outlined">
            <CardHeader title="Colors" />
            <CardContent>
                <Grid container columnSpacing={2}>
                    <Grid item xs={5}>
                        <List sx={{
                            overflow: "scroll",
                            maxHeight: "30vh"
                        }}>
                            {colorSet.map((co, index) => (
                                <ListItem sx={{
                                    marginBottom: "15px"
                                }} key={co} disablePadding>
                                    <Chip
                                        style={{
                                            width: "100%",
                                            backgroundColor: co,
                                        }}
                                        deleteIcon={<HighlightOffIcon sx={{
                                            position: "absolute",
                                            right: "0.5rem",
                                        }} />}
                                        label={co}
                                        onDelete={() => removeColor(index)}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>
                    <Grid item xs={7}>
                        <PhotoshopPicker
                            onAccept={() => {
                                addColor(color);
                            }}
                            color={color}
                            onChange={(co) => setColor(co.hex)}
                        />
                    </Grid>
                </Grid>
                <Grid container sx={{
                    marginTop: "20px"
                }} columnSpacing={3}>
                    <Grid item xs={10}>
                        <SaveBar
                            confirmDict={confirmDict}
                            onSave={savePalette}
                            autocompleteOptions={colorPalettes}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                            label="Colorpalettes"
                            onAutocompleteChange={(event, newValue) => {
                                if (!newValue) return;
                                if (typeof newValue === "string") {
                                    setSelectedPalette({
                                        id: "",
                                        name: newValue,
                                        colors: []
                                    });
                                } else {
                                    setSelectedPalette(newValue);
                                }
                            }}
                            placeholder="Select a colorpalette"
                            selectedExists={isIdInSet(selectedPalette?.id)}
                            key="colorPalette-savebar"
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button variant="contained" color="warning" fullWidth onClick={() => {
                            if (colorSet.length > 0) {
                                wsClient.setColorPalette(colorSet);
                            } else {
                                enqueueSnackbar("No colors to send, please load a palette", { variant: "warning"});
                            }

                        }}>Activate</Button>
                    </Grid>
                </Grid>


            </CardContent>
        </Card>
        {/* </Grid>
        </Grid> */}
    </>)
}