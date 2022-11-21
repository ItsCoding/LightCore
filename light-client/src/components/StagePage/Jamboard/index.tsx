import { Box, Button, Divider, FormControl, FormControlLabel, FormGroup, Grid, InputLabel, List, ListItem, ListItemButton, ListItemText, MenuItem, Modal, Paper, Select, Slider, Switch, SxProps, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react";
import { LedStrip } from "../../../types/Strip"
import { FrequencyRange } from "../../../types/FrequencyRanges"
import { Effekt } from "../../../types/Effekt";
import { getEffektGroups, getEffektSetMode, getHoldToActivate, getModKey, getOptionKey, setModKey } from "../../../system/JamboardCrossHandler";
import * as _ from "lodash"
import { WebSocketClient } from "../../../system/WebsocketClient";
import { createUUID } from "../../../system/Utils";
import { Theme } from "@mui/system";
import { TouchButton } from "./TouchButton"

type ButtonState = {
    holdToActivate: boolean;
    effekt: Effekt;
    activeEffektId: (string | number) | (string | number)[];
}
type JamRowState = {
    buttons: {
        [key: string]: ButtonState
    },
    frequencyRangeIndex: number
    brightness: number
    activeEffektIDs: Array<string | number>
}

const countOfEffektGroups = 5;


type JamRowProps = {
    strip: LedStrip;
    masterEffektGroups: MasteEffektDict,
    jamRowState: JamRowState;
    changeRowState: (newState: JamRowState) => void;
    index: number;
    effektGroups: {
        [key: string]: Effekt[];
    };
}


const JamRow = ({ effektGroups, index, strip, changeRowState, jamRowState, masterEffektGroups }: JamRowProps) => {
    const wsClient = WebSocketClient.getInstance();
    const randomizeEffekts = () => {
        const newButtons = jamRowState.buttons;
        Object.keys(newButtons).forEach((key) => {
            const effektGroup = effektGroups[masterEffektGroups[key]]
            newButtons[key].effekt = _.sample(effektGroup)!;
        })
        changeRowState({ ...jamRowState, buttons: newButtons })
    }

    const setBrightness = (value: number) => {
        wsClient.send("light.setStripBrightness", {
            stripIndex: strip.index,
            brightness: value
        });
        changeRowState({ ...jamRowState, brightness: value })
    }

    const spawnEffekt = useCallback((key: number) => {
        console.log("=============================")
        const effekt = jamRowState.buttons[key].effekt;
        const effektSetModeGlobal = getEffektSetMode();
        const wsTransaction = WebSocketClient.startTransaction();
        if (jamRowState.buttons[key].activeEffektId.toString().length > 0) {
            const activeEffektIDs = jamRowState.activeEffektIDs.filter((id) => id !== jamRowState.buttons[key].activeEffektId);
            console.log("activeEffektIDs", activeEffektIDs);
            if (activeEffektIDs.length === 0) {
                console.log("TURN OFFFF :!!!!");
                wsTransaction.lightSetOff(strip.index);
            } else {
                console.log("REMOVE EFFEKTS");
                wsTransaction.lightRemoveEffekt(jamRowState.buttons[key].activeEffektId as string | number);
            }
            const newButtons = jamRowState.buttons;
            newButtons[key].activeEffektId = "";
            changeRowState({ ...jamRowState, buttons: newButtons, activeEffektIDs: activeEffektIDs })
        } else {
            const newJamState = jamRowState;
            if (effektSetModeGlobal === "SET") {
                newJamState.activeEffektIDs = [];
                Object.keys(newJamState.buttons).forEach((key) => {
                    newJamState.buttons[key].activeEffektId = "";
                })
                changeRowState(newJamState);
                wsTransaction.lightClear(strip.index);
            }
            console.log("Spawning effekt", effekt.effektSystemName);
            const effektID = wsTransaction.lightAddEffekt(effekt.effektSystemName, strip.index, FrequencyRange.allRanges[jamRowState.frequencyRangeIndex].range, {}, 0, strip.length, createUUID());
            const newButtons = jamRowState.buttons;
            newButtons[key].activeEffektId = effektID;
            newJamState.activeEffektIDs.push(effektID);
            newJamState.buttons = newButtons;
            changeRowState(newJamState);
        }
        wsTransaction.commit()
    }, [jamRowState])

    const onButtonInteract = (key: number) => {
        const modKey = getModKey();
        const optionKey = getOptionKey();
        // const holdToActivateGlobal = getHoldToActivate();
        switch (true) {
            case modKey && !optionKey:
                const newButtons = jamRowState.buttons;
                const effektGroup = effektGroups[masterEffektGroups[key]]
                newButtons[key].effekt = _.sample(effektGroup.filter(eff => eff.effektSystemName !== newButtons[key].effekt.effektSystemName))!;
                changeRowState({ ...jamRowState, buttons: newButtons })
                break;
            case !modKey && optionKey:
                const newButtonsActivate = jamRowState.buttons;
                //switch holdOnActivate
                newButtonsActivate[key].holdToActivate = !newButtonsActivate[key].holdToActivate;
                changeRowState({ ...jamRowState, buttons: newButtonsActivate })
                break;
            default:
                console.log("Spawn Effekt")
                spawnEffekt(key);
        }
    }

    const onButtonInteractEnd = useCallback((key: number) => {
        const holdToActivateGlobal = getHoldToActivate();
        switch (true) {
            case holdToActivateGlobal || jamRowState.buttons[key].holdToActivate:
                console.log("Remove Effekt")

                //check if other effekts are active
                const activeEffektIDs = jamRowState.activeEffektIDs.filter((id) => id !== jamRowState.buttons[key].activeEffektId);
                if (activeEffektIDs.length === 0) {
                    wsClient.lightSetOff(strip.index);
                } else {
                    wsClient.lightRemoveEffekt(jamRowState.buttons[key].activeEffektId as string | number);
                }
                const newButtons = jamRowState.buttons;
                const newActiveIds = jamRowState.activeEffektIDs.filter((id) => id !== jamRowState.buttons[key].activeEffektId)
                newButtons[key].activeEffektId = "";
                changeRowState({ ...jamRowState, buttons: newButtons, activeEffektIDs: newActiveIds })
                break;
        }
    }, [jamRowState])


    const lightOff = () => {
        wsClient.lightSetOff(strip.index);
        const newButtons = jamRowState.buttons;
        Object.keys(newButtons).forEach((key) => {
            newButtons[key].activeEffektId = "";
        });
        changeRowState({ ...jamRowState, buttons: newButtons, activeEffektIDs: [] })
    }

    const isButtonActive = (key: number) => {

        return jamRowState.buttons[key].activeEffektId.toString().length > 0;
    }

    const getButtonColor = (key: number) => {
        if (isButtonActive(key)) {
            return "#5e0000";
        } else {
            if (jamRowState.buttons[key].holdToActivate) {
                return "#00005e";
            } else {
                return null;
            }
        }
    }

    const getButtonHoverColor = (key: number) => {
        if (isButtonActive(key)) {
            return "#780000";
        } else {
            if (jamRowState.buttons[key].holdToActivate) {
                return "#00005e";
            } else {
                return null;
            }
        }
    }

    return (
        <Grid item xs={1.5} sx={{
            padding: "10px",
            marginLeft: index === 0 ? "10px !important" : null,
        }}>

            <Typography variant="h5" color="text.secondary">
                {strip.position}
            </Typography>
            {Array(countOfEffektGroups).fill(0).map((_, i) =>
                <TouchButton
                    onInteractEnd={() => onButtonInteractEnd(i)}
                    onInteract={() => onButtonInteract(i)}
                    sx={{
                        backgroundColor: getButtonColor(i),
                        "&:hover": {
                            backgroundColor: getButtonHoverColor(i)
                        },
                        height: "6vh",
                        marginBottom: 2,
                        fontSize: 9.5
                    }}
                    title={jamRowState.buttons[i].effekt.name} />
            )}
            <Grid container justifyContent={"center"} sx={{
                marginTop: 2,
                marginBottom: 2,
                minHeight: "25vh",
            }}>
                <Grid item xs={1}>
                    <Slider orientation="vertical" value={jamRowState.brightness} onChange={(e, val) => setBrightness(val as number)} />
                </Grid>
            </Grid>
            <FormControl fullWidth>
                <Select
                    defaultValue={6}
                    onChange={(e) => {
                        const newFrequencyRangeIndex = e.target.value as number;
                        changeRowState({ ...jamRowState, frequencyRangeIndex: newFrequencyRangeIndex })
                    }}
                // value={age}
                // label="Age"
                // onChange={handleChange}
                >
                    {FrequencyRange.allRanges.map((range, i) => <MenuItem value={i}>{range.name}</MenuItem>)}
                </Select>
            </FormControl>
            <Grid columnSpacing={2} container sx={{
                marginTop: 2,
            }}>
                <Grid item xs={6}>
                    <Button variant="contained" color="error" fullWidth onClick={() => lightOff()}>OFF</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color="warning" fullWidth onClick={randomizeEffekts}>RND</Button>
                </Grid>
            </Grid>
        </Grid >
    )
}

type JamRowMasterProps = {
    masterEffektGroups: MasteEffektDict,
    jamRowState: JamRowState;
    changeRowState: (newState: JamRowState) => void;
    effektGroups: {
        [key: string]: Effekt[];
    };
    strips: LedStrip[];
    clearAllEffekts: () => void;
    openMasterChooser: (key: number) => void;
}

const JamRowMaster = ({ clearAllEffekts, changeRowState, jamRowState, masterEffektGroups, effektGroups, strips, openMasterChooser }: JamRowMasterProps) => {
    const wsClient = WebSocketClient.getInstance();
    const randomizeEffekts = () => {
        const newButtons = jamRowState.buttons;
        Object.keys(newButtons).forEach((key) => {
            const effektGroup = effektGroups[masterEffektGroups[key]]
            newButtons[key].effekt = _.sample(effektGroup)!;
        })
        changeRowState({ ...jamRowState, buttons: newButtons })
    }

    const setBrightness = (value: number) => {
        wsClient.changeConfigProperty("brightness", value);
        changeRowState({ ...jamRowState, brightness: value })
    }
    const spawnEffekt = useCallback((key: number) => {
        console.log("=============================")
        const effekt = jamRowState.buttons[key].effekt;
        const effektSetModeGlobal = getEffektSetMode();
        const wsTransaction = WebSocketClient.startTransaction();
        if (jamRowState.buttons[key].activeEffektId.toString().length > 0) {
            const activeEffektIDs = jamRowState.activeEffektIDs.filter((id) => !(jamRowState.buttons[key].activeEffektId as (string | number)[]).includes(id));
            if (activeEffektIDs.length === 0) {
                strips.forEach(strip => {
                    wsTransaction.lightSetOff(strip.index);
                })
            } else {
                (jamRowState.buttons[key].activeEffektId as string[] | number[]).forEach((id) => {
                    wsTransaction.lightRemoveEffekt(id);
                })
            }
            const newButtons = jamRowState.buttons;
            newButtons[key].activeEffektId = "";
            changeRowState({ ...jamRowState, buttons: newButtons, activeEffektIDs: activeEffektIDs })
        } else {
            const newJamState = jamRowState;
            if (effektSetModeGlobal === "SET") {
                newJamState.activeEffektIDs = [];
                Object.keys(newJamState.buttons).forEach((key) => {
                    newJamState.buttons[key].activeEffektId = "";
                })
                changeRowState(newJamState);
                strips.forEach(strip => {
                    wsTransaction.lightClear(strip.index);
                })
            }
            console.log("Spawning effekt", effekt.effektSystemName);
            const newIds: (string | number)[] = [];
            strips.forEach(strip => {
                const effektID = wsTransaction.lightAddEffekt(effekt.effektSystemName, strip.index, FrequencyRange.allRanges[jamRowState.frequencyRangeIndex].range, {}, 0, strip.length, createUUID());
                newIds.push(effektID);
            })
            const newButtons = jamRowState.buttons;
            newButtons[key].activeEffektId = newIds;
            newJamState.activeEffektIDs = [...newJamState.activeEffektIDs, ...newIds];
            newJamState.buttons = newButtons;
            changeRowState(newJamState);
        }
        wsTransaction.commit()
    }, [jamRowState])

    const onButtonInteract = (key: number) => {
        const modKey = getModKey();
        const optionKey = getOptionKey();
        // const holdToActivateGlobal = getHoldToActivate();
        switch (true) {
            case modKey && !optionKey:
                const newButtons = jamRowState.buttons;
                const effektGroup = effektGroups[masterEffektGroups[key]]
                newButtons[key].effekt = _.sample(effektGroup.filter(eff => eff.effektSystemName !== newButtons[key].effekt.effektSystemName))!;
                changeRowState({ ...jamRowState, buttons: newButtons })
                break;
            case !modKey && optionKey:
                openMasterChooser(key);
                break;
            default:
                console.log("Spawn Effekt")
                spawnEffekt(key);
        }
    }

    const onButtonInteractEnd = useCallback((key: number) => {
        const holdToActivateGlobal = getHoldToActivate();
        switch (true) {
            case holdToActivateGlobal || jamRowState.buttons[key].holdToActivate:
                console.log("Remove Effekt")

                //check if other effekts are active
                const activeEffektIDs = jamRowState.activeEffektIDs.filter((id) => id !== jamRowState.buttons[key].activeEffektId);
                const wsTransaction = WebSocketClient.startTransaction();
                if (activeEffektIDs.length === 0) {
                    strips.forEach(strip => {
                        wsTransaction.lightSetOff(strip.index);
                    })
                } else {
                    (jamRowState.buttons[key].activeEffektId as (string | number)[]).forEach((id) => {
                        wsTransaction.lightRemoveEffekt(id);
                    })
                }
                wsTransaction.commit();
                const newButtons = jamRowState.buttons;
                const newActiveIds = jamRowState.activeEffektIDs.filter((id) => id !== jamRowState.buttons[key].activeEffektId)
                newButtons[key].activeEffektId = "";
                changeRowState({ ...jamRowState, buttons: newButtons, activeEffektIDs: newActiveIds })
                break;
        }
    }, [jamRowState])

    const isButtonActive = (key: number) => {
        return jamRowState.buttons[key].activeEffektId.toString().length > 0;
    }

    const lightOff = () => {
        strips.forEach(strip => {
            wsClient.lightSetOff(strip.index);
        })

        clearAllEffekts();
    }

    const getButtonColor = (key: number) => {
        if (isButtonActive(key)) {
            return "#5e0000";
        } else {
            if (jamRowState.buttons[key].holdToActivate) {
                return "#00005e";
            } else {
                return null;
            }
        }
    }

    const getButtonHoverColor = (key: number) => {
        if (isButtonActive(key)) {
            return "#780000";
        } else {
            if (jamRowState.buttons[key].holdToActivate) {
                return "#00005e";
            } else {
                return null;
            }
        }
    }

    return (
        <>
            <Typography variant="h5" color="text.secondary">
                Master
            </Typography>
            {Array(countOfEffektGroups).fill(0).map((_, i) =>
                <TouchButton
                    onInteractEnd={() => onButtonInteractEnd(i)}
                    onInteract={() => onButtonInteract(i)}
                    sx={{
                        height: "6vh",
                        marginBottom: 2,
                        fontSize: 9.5,
                        backgroundColor: getButtonColor(i),
                        "&:hover": {
                            backgroundColor: getButtonHoverColor(i)
                        },
                    }}
                    title={jamRowState.buttons[i].effekt.name} />
            )}
            <Grid container justifyContent={"center"} sx={{
                marginTop: 2,
                marginBottom: 2,
                minHeight: "25vh",
            }}>
                <Grid item xs={1}>
                    <Slider orientation="vertical" value={jamRowState.brightness} onChange={(e, val) => setBrightness(val as number)} />
                </Grid>
            </Grid>
            <Button variant="contained" color="info" fullWidth sx={{
                height: "6vh",
            }} onTouchStart={() => setModKey(true)} onTouchEnd={() => setModKey(false)}>MOD</Button>
            <Grid columnSpacing={2} container sx={{
                marginTop: 2,
            }}>
                <Grid item xs={6}>
                    <Button variant="contained" color="error" fullWidth onClick={lightOff}>OFF</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color="warning" fullWidth onClick={randomizeEffekts}>RND</Button>
                </Grid>
            </Grid>
        </>
    )
}

export type JamboardProps = {
    strips: Array<LedStrip>;
    availableEffekts: Array<Effekt>;
}

export type MasteEffektDict = {
    [key: string]: string;
}

export const Jamboard = ({ strips, availableEffekts }: JamboardProps) => {
    const [masterEffektGroups, setMasterEffektGroups] = useState<MasteEffektDict>({})
    const [jamRowStates, setJamRowStates] = useState<{ [key: number | string]: JamRowState }>({})
    const [openMasterModal, setOpenMasterModal] = useState(-1);
    const changeRowState = (stripPosition: number | string, newState: JamRowState) => {
        setJamRowStates({ ...jamRowStates, [stripPosition]: newState })
    }
    const effektGroups = getEffektGroups(availableEffekts)

    const clearAllEffekts = () => {
        const newJamStates = jamRowStates;
        Object.keys(newJamStates).forEach((key) => {
            newJamStates[key].activeEffektIDs = [];
            Object.keys(newJamStates[key].buttons).forEach((buttonKey) => {
                newJamStates[key].buttons[buttonKey].activeEffektId = "";
            });
        })
        setJamRowStates({ ...newJamStates });
    }

    const openMasterChooser = (key: number) => {
        setOpenMasterModal(key);
    }



    const initializeJamRowStates = (masterEffektGrp: MasteEffektDict) => {
        const newStates: { [key: number | string]: JamRowState } = {}
        const allRows = [...(strips.map(s => s.index)), "MASTER"]
        allRows.forEach(index => {
            newStates[index] = {
                buttons: {},
                frequencyRangeIndex: 6,
                brightness: 100,
                activeEffektIDs: []
            }
            for (let x = 0; x < countOfEffektGroups; x++) {
                newStates[index].buttons[x] = {
                    holdToActivate: false,
                    effekt: _.sample(effektGroups[masterEffektGrp[x]])!,
                    activeEffektId: ""
                }
            }
        })
        setJamRowStates(newStates)
    }

    useEffect(() => {
        if (availableEffekts.length > 0) {
            console.log(effektGroups)

            const masterEffektGroups: MasteEffektDict = {}
            const effektGroupKeys = Object.keys(effektGroups);
            for (let i = 0; i < countOfEffektGroups; i++) {
                masterEffektGroups[i] = effektGroupKeys[i]
            }
            initializeJamRowStates(masterEffektGroups)
            setMasterEffektGroups(masterEffektGroups)
        }
    }, [])

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        // p: 4,
    };

    const onMasterSelection = useCallback((effektGroupKey: string) => {
        const newMasterEffektGroups = masterEffektGroups;
        newMasterEffektGroups[openMasterModal] = effektGroupKey;
        setMasterEffektGroups({ ...newMasterEffektGroups });


        const newJamStates = jamRowStates;
        Object.keys(newJamStates).forEach((key) => {
            newJamStates[key].buttons[openMasterModal].effekt = _.sample(effektGroups[effektGroupKey])!;
        })
        setJamRowStates({ ...newJamStates });
        setOpenMasterModal(-1);
    }, [openMasterModal])

    const changeMasterHoldToActivate = (key: number, state: boolean) => {
        const newJamStates = jamRowStates;
        Object.keys(newJamStates).forEach((jKey) => {
            newJamStates[jKey].buttons[key].holdToActivate = state
        })
        setJamRowStates({ ...newJamStates });
    }

    return (
        <>
            <Modal
                open={openMasterModal >= 0}
                onClose={() => setOpenMasterModal(-1)}
            // aria-labelledby="modal-modal-title"
            // aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <List>
                        {Object.keys(effektGroups).map((key) => (
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={() => onMasterSelection(key)}
                                    sx={{
                                        backgroundColor: masterEffektGroups[openMasterModal] === key ? "rgb(2, 45, 97,0.4)" : null
                                    }}>
                                    <ListItemText primary={key} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <Divider style={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
                    <FormGroup sx={{
                        paddingLeft: 2,
                        paddingBottom: 1
                    }}>
                        <FormControlLabel control={<Switch onChange={(e, check) => changeMasterHoldToActivate(openMasterModal, check)} checked={jamRowStates["MASTER"]?.buttons[openMasterModal]?.holdToActivate} />} label="Hold to activate" />
                    </FormGroup>
                </Box>
            </Modal>
            {Object.keys(jamRowStates).length > 0 && <Grid container columnSpacing={2}>
                {strips.map((strip, i) => {
                    return (
                        <JamRow effektGroups={effektGroups} index={i} jamRowState={jamRowStates[strip.index]} changeRowState={(state: JamRowState) => changeRowState(strip.index, state)} masterEffektGroups={masterEffektGroups} key={i} strip={strip} />
                    )
                })}
                <Grid item xs />
                <Grid item xs={1.5} sx={{ backgroundColor: "#222222", padding: "10px" }}>
                    <JamRowMaster openMasterChooser={openMasterChooser} clearAllEffekts={() => clearAllEffekts()} strips={strips} effektGroups={effektGroups} jamRowState={jamRowStates["MASTER"]} changeRowState={(state: JamRowState) => changeRowState("MASTER", state)} masterEffektGroups={masterEffektGroups} />
                </Grid>
            </Grid>}
        </>
    )
}