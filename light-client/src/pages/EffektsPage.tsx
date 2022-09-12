import { Alert, AlertTitle, Autocomplete, Box, Button, Card, CardActions, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, FormGroup, Grid, Modal, Switch, Tab, Tabs, TextField, Toolbar } from "@mui/material"
import { useSnackbar } from "notistack"
import React, { useEffect } from "react"
import { ColorResult } from "react-color"
import { EffektsPanel } from "../components/EffektsPanel"
import { ActiveEffekts } from "../components/EffektsPanel/ActiveEffekts"
import { EffektColor } from "../components/EffektsPanel/EffektColor"
import { EditComposition } from "../components/General/Compositions/EditComposition"
import { PreviewCanvas } from "../components/General/PreviewCanvas"
import { strips } from "../system/StripConfig"
import { createUUID, getFontColorByBgColor, ModalTransition, randomColor } from "../system/Utils"
import { WebSocketClient } from "../system/WebsocketClient"
import { ActiveEffekt } from "../types/ActiveEffekt"
import { setAllCompositions } from "../types/Board"
import { Composition } from "../types/Composition"
import { CompositionTag } from "../types/CompositionTag"
import { Effekt } from "../types/Effekt"
import { ReturnType } from "../types/TopicReturnType"

const stripConfig = strips

type EffektsPageProps = {
    availableEffekts: Array<Effekt>,
    isRandomizerActive: boolean,
    setRandomizerActive: (active: boolean) => void,
    compositionStore: Array<Composition>,
    setCompositionStore: (store: Array<Composition>) => void,
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`color-effekts-tabpanel-${index}`}
            {...other}
        >
            {children}
        </div>
    );
}

type ColorDict = {
    [index: number]: ColorResult
}

type ConfirmDictType = {
    [index: number]: {
        title: string,
        text: JSX.Element,
        confirm: () => void,
        confirmText: string
    }
}


export const EffektsPage = ({ availableEffekts, isRandomizerActive, setRandomizerActive, compositionStore, setCompositionStore }: EffektsPageProps) => {
    const wsClient = WebSocketClient.getInstance()
    const [activeColorPanel, setActiveColorPanel] = React.useState<number>(0)
    const [colorDict, setColorDict] = React.useState<ColorDict>({})
    const [activeEffekts, setActiveEffekts] = React.useState<Array<ActiveEffekt>>([]);
    const [selectedTags, setSelectedTags] = React.useState<Array<CompositionTag>>([]);
    const [newComposition, setNewCompositionName] = React.useState<Composition | null>(null);
    const [selectedExistingComposition, setSelectedExistingComposition] = React.useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState<number>(0);
    const [inPreviewMode, setInPreviewMode] = React.useState<boolean>(false);
    const [previewOpen, setPreviewOpen] = React.useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    const changeColor = (color: ColorResult | null, index: number) => {
        if (color === null) {
            const copyDict = { ...colorDict }
            delete copyDict[index]
            setColorDict(copyDict)
        } else {
            setColorDict({
                ...colorDict,
                [index]: color
            })
        }
    }

    const getColor = (index: number) => {
        return colorDict[index]?.hex || "#000000"
    }

    const getUsedTags = () => {
        const tags: { [key: string]: CompositionTag } = {}
        compositionStore.forEach((comp) => {
            comp.tags.forEach((tag) => {
                if (!tags[tag.id]) tags[tag.id] = tag
            })
        })

        return Object.keys(tags).map((key) => tags[key]);
    }

    const changeSelectedTags = (stuff: (string | CompositionTag)[]) => {
        let selectedTags: CompositionTag[] = []
        stuff.forEach((tag) => {
            if (typeof tag === "string") {
                selectedTags.push({ id: tag, name: tag, color: randomColor() })
            } else {
                selectedTags.push(tag)
            }
        });
        console.log("Set selectedTags to", selectedTags)
        setSelectedTags(selectedTags)
    }

    const changeComp = (stuff: string | Composition | null) => {
        console.log("Set newComposition to", stuff)
        if (typeof stuff === "string") {
            const nComp = new Composition(createUUID(), stuff, selectedTags, activeEffekts)
            console.log("Create new composition", nComp)
            setSelectedExistingComposition(false);
            setNewCompositionName(nComp)
        } else if (stuff !== null) {
            setSelectedExistingComposition(true);
            setSelectedTags(stuff.tags)
            setNewCompositionName(stuff)
        }
    }

    const confirmSave = () => {
        if (selectedExistingComposition) {
            setConfirmDialogOpen(1);
        } else {
            saveComposition();
        }
    }

    const saveComposition = () => {
        if (newComposition !== null) {
            let acte = Array.from(activeEffekts); // copy
            if (inPreviewMode) {
                acte = acte.map(eff => {
                    eff.stripIndex = (eff.stripIndex * -1) - 5
                    return eff;
                })
            }
            const newComp = new Composition(newComposition.id, newComposition.compositionName, selectedTags, acte);
            const newStore = [...compositionStore.filter(a => a.id !== newComp.id), newComp]
            console.log(newStore)
            setCompositionStore(newStore)
            setNewCompositionName(null)
            setSelectedTags([])
            setAllCompositions(newStore)
            enqueueSnackbar(`Saved composition: ${newComp.compositionName}!`, { variant: 'success', anchorOrigin: { vertical: "top", horizontal: "right" } });
        } else {
            enqueueSnackbar(`No composition to save!`, { variant: 'error', anchorOrigin: { vertical: "top", horizontal: "right" } });
        }
        setConfirmDialogOpen(0);
    }


    useEffect(() => {
        const eventID = wsClient.addEventHandler(ReturnType.DATA.ACTIVE_EFFEKTS, (topic => {
            const incommingEffekts = ActiveEffekt.fromJSONArray(topic.message);
            if (inPreviewMode) {
                setActiveEffekts(incommingEffekts.filter((effekt) => effekt.stripIndex < 0))
            } else {
                setActiveEffekts(incommingEffekts.filter((effekt) => effekt.stripIndex >= 0))
            }
        }))
        wsClient.lightReport();
        return () => {
            wsClient.removeEventHandler(eventID)
        }
    }, [inPreviewMode])

    const changePreviewMode = (chk: boolean) => {
        console.log("Change preview mode to: ", chk)
        if (!chk) {
            activeEffekts.forEach((effekt) => {
                wsClient.lightClear(effekt.stripIndex);
            });
        }
        wsClient.lightReport();
        setInPreviewMode(chk)
    }

    const confirmDict: ConfirmDictType = {
        0: {
            title: "",
            text: <></>,
            confirm: () => { },
            confirmText: ""
        },
        1: {
            title: "Overwrite existing composition?",
            text: (
                <DialogContentText id="alert-dialog-slide-description">
                    If you confirm <b>{newComposition?.compositionName}</b> will be overridden with the current effekt composition.
                </DialogContentText>
            ),
            confirm: saveComposition,
            confirmText: "Save"
        },
        2: {
            title: "Delete composition?",
            text: (
                <DialogContentText id="alert-dialog-slide-description">
                    If you confirm <b>{newComposition?.compositionName}</b> will be deleted.
                </DialogContentText>
            ),
            confirm: () => {
                const newStore = compositionStore.filter(a => a.id !== newComposition?.id)
                setCompositionStore(newStore)
                setNewCompositionName(null)
                setSelectedTags([])
                setConfirmDialogOpen(0);
                enqueueSnackbar(`Deleted composition: ${newComposition?.compositionName}!`, { variant: 'success', anchorOrigin: { vertical: "top", horizontal: "right" } });
            },
            confirmText: "Delete"
        },
        3: {
            title: "Load composition?",
            text: (
                <DialogContentText id="alert-dialog-slide-description">
                    If you confirm <b>{newComposition?.compositionName}</b> will be loaded.
                </DialogContentText>
            ),
            confirm: () => {
                if (newComposition) {
                    stripConfig.forEach((strip) => {
                        wsClient.lightClear(strip.index);
                    });
                    newComposition.activate(() => { }, inPreviewMode);
                    setActiveEffekts(newComposition.activeEffekts);
                    setConfirmDialogOpen(0);
                    enqueueSnackbar(`Loaded composition: ${newComposition?.compositionName}!`, { variant: 'success', anchorOrigin: { vertical: "top", horizontal: "right" } });
                }
            },
            confirmText: "Load"
        }
    }


    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: "60%",
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <div>
            <Modal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                aria-labelledby="Preview"
                aria-describedby="previewmodal"
            >
                <Box sx={modalStyle}>
                    <PreviewCanvas />
                </Box>

            </Modal>
            <Dialog
                open={confirmDialogOpen > 0}
                TransitionComponent={ModalTransition}
                keepMounted
                onClose={() => setConfirmDialogOpen(0)}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{confirmDict[confirmDialogOpen].title}</DialogTitle>
                <DialogContent>
                    {confirmDict[confirmDialogOpen].text}
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" style={{ color: "#d4d4d4", borderColor: "#d4d4d4" }} onClick={() => setConfirmDialogOpen(0)}>Abort</Button>
                    <Button variant="contained" onClick={confirmDict[confirmDialogOpen].confirm}>{confirmDict[confirmDialogOpen].confirmText}</Button>
                </DialogActions>
            </Dialog>
            {
                isRandomizerActive ?
                    <Alert severity="warning">
                        <AlertTitle>Warning</AlertTitle>
                        <strong>Randomizer</strong> is active. <Button onClick={() => {
                            setRandomizerActive(false);
                            wsClient.lightRandomSetEnabled(false);
                        }}>Disable</Button>
                    </Alert> : null
            }
            <Card style={{
                marginTop: 10
            }}>
                <CardHeader title={"Colors"} />
                <CardContent style={{
                    paddingTop: 0,
                }}>
                    {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}> */}
                    <Tabs value={activeColorPanel} onChange={(e, value) => setActiveColorPanel(value)}>
                        {stripConfig.map((strip, index) => {
                            return <Tab key={index} label={strip.position} />
                        })}
                    </Tabs>
                    {/* </Box> */}
                    {stripConfig.map((strip, index) => {
                        return <TabPanel key={index} value={activeColorPanel} index={index}>
                            <EffektColor onChange={(c) => changeColor(c, strip.index)} selectedColor={getColor(strip.index)} key={`effekt-color-s-${strip.index}`} />
                        </TabPanel>
                    })}
                </CardContent>
            </Card>
            <Grid container columnSpacing={2} rowSpacing={1}>
                {stripConfig.map(strip => {
                    return (
                        <Grid item xs={12} md={6}>
                            <EffektsPanel key={strip.index} colorDict={colorDict} availableEffekts={availableEffekts} strip={strip} inPreviewMode={inPreviewMode} />
                        </Grid>
                    )
                })}

            </Grid>
            <div style={{
                marginTop: 10
            }}>
                <Card>
                    <CardHeader title={"Composition"} action={(<Toolbar>
                        <FormGroup>
                            <FormControlLabel control={<Switch checked={inPreviewMode} onChange={(e, checked) => changePreviewMode(checked)} />} label="Preview" />
                        </FormGroup>
                        <Button disabled={!inPreviewMode} color="info" variant="contained" onClick={() => { setPreviewOpen(true) }}>Open Preview</Button>
                    </Toolbar>
                    )} />
                    <CardContent>
                        <ActiveEffekts activeEffekts={activeEffekts} availableEffekts={availableEffekts} />
                    </CardContent>
                    <CardActions style={{
                        margin: 10
                    }}>
                        <Grid container columnSpacing={2} rowSpacing={2}>
                            <Grid item xs={12} md={4}>
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    id="names-standard"
                                    options={compositionStore}
                                    freeSolo
                                    onChange={(e, value) => { changeComp(value) }}
                                    getOptionLabel={(option) => (typeof option === "string" ? option : option.compositionName)}
                                    // defaultValue={[top100Films[13]]}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="standard"
                                            label="Compositionname"
                                            placeholder="Name..."
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Autocomplete
                                    size="small"
                                    fullWidth
                                    multiple
                                    id="tags-standard"
                                    options={getUsedTags()}
                                    freeSolo
                                    value={selectedTags}
                                    onChange={(e, value) => { changeSelectedTags(value) }}
                                    getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
                                    renderTags={(value, getTagProps) => {
                                        return value.map(tag =>
                                            <Chip style={{
                                                marginRight: 5,
                                                marginLeft: 5,
                                                height: "80%",
                                                backgroundColor: `#${tag.color}`,
                                                color: getFontColorByBgColor(tag.color)
                                            }} label={tag.name} key={tag.id} {...getTagProps} />
                                        )

                                    }}
                                    // renderOption={(option, value) => (<Chip style={{
                                    //     marginRight: 5,
                                    //     marginLeft: 5,
                                    //     height: "60%",
                                    //     backgroundColor: `#${value.color}`
                                    // }} key={value.id} label={value.name} {...option}/>)}

                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="standard"
                                            label="Tags"
                                            placeholder="Tags..."
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Grid container justifyContent={"center"} spacing={4}>
                                    <Grid item xs={4} md={4}>
                                        <Button fullWidth color="success" variant="contained" onClick={() => { confirmSave() }}>Save</Button>
                                    </Grid>
                                    <Grid item xs={4} md={4}>
                                        <Button fullWidth color="primary" variant="contained" disabled={!selectedExistingComposition} onClick={() => { setConfirmDialogOpen(3) }}>Load</Button>
                                    </Grid>
                                    <Grid item xs={4} md={4}>
                                        <Button fullWidth color="error" variant="contained" disabled={!selectedExistingComposition} onClick={() => { setConfirmDialogOpen(2) }}>Delete</Button>
                                    </Grid>
                                </Grid>



                            </Grid>
                        </Grid>



                    </CardActions>
                </Card>
                {/* <ActiveEffekts activeEffekts={activeEffekts} /> */}
            </div>

        </div >
    )
}