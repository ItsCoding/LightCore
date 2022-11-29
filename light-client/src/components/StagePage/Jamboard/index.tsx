import { Box, Button, CircularProgress, Divider, FormControl, FormControlLabel, FormGroup, Grid, InputLabel, List, ListItem, ListItemButton, ListItemText, MenuItem, Modal, Paper, Select, Slider, Switch, SxProps, Typography } from "@mui/material"
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
import { ReturnType } from "../../../types/TopicReturnType";

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
    openOptionSelect: (key: number) => void;
}


const JamRow = ({ effektGroups, index, strip, changeRowState, jamRowState, masterEffektGroups, openOptionSelect }: JamRowProps) => {
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
                // const newButtonsActivate = jamRowState.buttons;
                // //switch holdOnActivate
                // newButtonsActivate[key].holdToActivate = !newButtonsActivate[key].holdToActivate;
                // changeRowState({ ...jamRowState, buttons: newButtonsActivate })
                openOptionSelect(key);
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

            <Typography variant="caption" color="text.secondary">
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
                clearAllEffekts();
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
            {Array(countOfEffektGroups).fill(0).map((_, i) =>
                <>
                    <Typography key={i} variant="caption" style={{ color: "white", textAlign: "center" }}>{masterEffektGroups[i].toLocaleUpperCase()}</Typography>
                    <TouchButton
                        onInteractEnd={() => onButtonInteractEnd(i)}
                        onInteract={() => onButtonInteract(i)}
                        sx={{
                            height: "6vh",
                            // marginBottom: 2,
                            fontSize: 9.5,
                            backgroundColor: getButtonColor(i),
                            "&:hover": {
                                backgroundColor: getButtonHoverColor(i)
                            },
                        }}
                        title={jamRowState.buttons[i].effekt.name} />
                </>
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
    activeJamBoardIndex: number;
    setActiveJamBoardIndex: React.Dispatch<React.SetStateAction<number>>;
}

export type MasteEffektDict = {
    [key: string]: string;
}

export type JamBoard = {
    [key: number]: {
        masterEffektGroups: MasteEffektDict;
        rowStates: { [key: number | string]: JamRowState };
    }
}

export const Jamboard = ({ strips, availableEffekts, activeJamBoardIndex, setActiveJamBoardIndex }: JamboardProps) => {
    const wsClient = WebSocketClient.getInstance();
    const [jamBoards, setJamBoards] = useState<JamBoard>({})
    const [loading, setLoading] = useState(true);
    const [masterEffektGroups, setMasterEffektGroups] = useState<MasteEffektDict>({})
    const [jamRowStates, setJamRowStates] = useState<{ [key: number | string]: JamRowState }>({})
    const [openMasterModal, setOpenMasterModal] = useState(-1);
    const [openRowIdKey, setOpenRowIdKey] = useState({ rowId: -1, key: -1 });

    const changeRowState = (stripPosition: number | string, newState: JamRowState) => {
        setJamRowStates({ ...jamRowStates, [stripPosition]: newState })
        setJamBoards({ ...jamBoards, [stripPosition]: { masterEffektGroups, rowStates: { ...jamRowStates, [stripPosition]: newState } } })
        // wsClient.issueKeySet("jampages", JSON.stringify({ ...jamBoards, [stripPosition]: { masterEffektGroups, rowStates: { ...jamRowStates, [stripPosition]: newState } } }));
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

    const openRowChooser = (key: number, rowID: number) => {
        setOpenRowIdKey({
            rowId: rowID,
            key: key
        });
    }

    useEffect(() => {
        const board = jamBoards[activeJamBoardIndex];
        if (!loading) {
            wsClient.issueKeySet("jampages", JSON.stringify(jamBoards));
        }
        if (board) {
            console.log("Found board", board);
            setMasterEffektGroups(board.masterEffektGroups);
            setJamRowStates(board.rowStates);
        } else {
            console.log("No board found for Index", activeJamBoardIndex);
            const masterEffektGroups: MasteEffektDict = {}
            const effektGroupKeys = Object.keys(effektGroups);
            for (let i = 0; i < countOfEffektGroups; i++) {
                masterEffektGroups[i] = effektGroupKeys[i]
            }
            initializeJamRowStates(masterEffektGroups)
            setMasterEffektGroups(masterEffektGroups)
        }
    }, [activeJamBoardIndex])


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
        const newBoard = { ...jamBoards }
        newBoard[activeJamBoardIndex] = { masterEffektGroups: masterEffektGrp, rowStates: newStates }
        setJamBoards(newBoard);
        // wsClient.issueKeySet("jampages", JSON.stringify(newBoard));
    }

    useEffect(() => {
        if (availableEffekts.length > 0) {
            console.log(effektGroups)
            const boardsHandler = wsClient.addEventHandler(ReturnType.WSAPI.GET_KEY_VALUE, (data) => {
                console.log("BoardData", data, Object.keys(JSON.parse(data.message.value)).length)
                if (data.message.key === "jampages") {
                    if (data.message.value && Object.keys(JSON.parse(data.message.value)).length > 0) {
                        const boards = JSON.parse(data.message.value) as JamBoard
                        console.log("Board Parsed", boards)

                        setMasterEffektGroups(boards[activeJamBoardIndex].masterEffektGroups);
                        setJamRowStates(boards[activeJamBoardIndex].rowStates);
                        setJamBoards(boards);
                    } else {
                        console.log("Generating new Board")
                        const masterEffektGroups: MasteEffektDict = {}
                        const effektGroupKeys = Object.keys(effektGroups);
                        for (let i = 0; i < countOfEffektGroups; i++) {
                            masterEffektGroups[i] = effektGroupKeys[i]
                        }
                        initializeJamRowStates(masterEffektGroups)
                        setMasterEffektGroups(masterEffektGroups)
                    }
                    setLoading(false);
                }
                wsClient.removeEventHandler(boardsHandler);
            });
            wsClient.issueKeyGet("jampages");
            console.log("Requesting jamboards")
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
        const newBoards = { ...jamBoards };
        newBoards[activeJamBoardIndex].masterEffektGroups = newMasterEffektGroups;
        newBoards[activeJamBoardIndex].rowStates = newJamStates;
        setJamBoards(newBoards)
        wsClient.issueKeySet("jampages", JSON.stringify(newBoards));
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

    const getEffektsForRow = () => {
        if (openRowIdKey.rowId === -1) return [];
        const effektGroupKey = masterEffektGroups[openRowIdKey.key];
        return effektGroups[effektGroupKey];
    }

    const onEffektSelection = useCallback((effekt: Effekt) => {
        const newJamStates = jamRowStates;
        newJamStates[openRowIdKey.rowId].buttons[openRowIdKey.key].effekt = effekt;
        setJamRowStates({ ...newJamStates });
        setOpenRowIdKey({ rowId: -1, key: -1 });
    }, [jamRowStates, openRowIdKey])

    const changeBtnHoldToActivate = useCallback((state: boolean) => {
        const newJamStates = jamRowStates;
        newJamStates[openRowIdKey.rowId].buttons[openRowIdKey.key].holdToActivate = state;
        setJamRowStates({ ...newJamStates });
    }, [jamRowStates, openRowIdKey])

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
            <Modal
                open={openRowIdKey.rowId >= 0}
                onClose={() => setOpenRowIdKey({ rowId: -1, key: -1 })}
            // aria-labelledby="modal-modal-title"
            // aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <List>
                        {getEffektsForRow().map((eff) => (
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={() => onEffektSelection(eff)}
                                    sx={{
                                        backgroundColor: jamRowStates[openRowIdKey.rowId].buttons[openRowIdKey.key].effekt.effektSystemName === eff.effektSystemName ? "rgb(2, 45, 97,0.4)" : null
                                    }}>
                                    <ListItemText primary={eff.name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <Divider style={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
                    <FormGroup sx={{
                        paddingLeft: 2,
                        paddingBottom: 1
                    }}>
                        <FormControlLabel control={<Switch onChange={(e, check) => changeBtnHoldToActivate(check)} checked={jamRowStates[openRowIdKey.rowId]?.buttons[openRowIdKey.key]?.holdToActivate} />} label="Hold to activate" />
                    </FormGroup>
                </Box>
            </Modal>
            {loading ? <>

                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "80vh"
                }}>
                    <CircularProgress size="10rem" />
                </div>
            </> : <>
                {Object.keys(jamRowStates).length > 0 && <Grid container columnSpacing={2}>
                    {strips.map((strip, i) => {
                        return (
                            <JamRow openOptionSelect={(key: number) => { openRowChooser(key, strip.index) }} effektGroups={effektGroups} index={i} jamRowState={jamRowStates[strip.index]} changeRowState={(state: JamRowState) => changeRowState(strip.index, state)} masterEffektGroups={masterEffektGroups} key={i} strip={strip} />
                        )
                    })}
                    <Grid item xs />
                    <Grid item xs={1.5} sx={{ backgroundColor: "#222222", padding: "10px" }}>
                        <JamRowMaster openMasterChooser={openMasterChooser} clearAllEffekts={() => clearAllEffekts()} strips={strips} effektGroups={effektGroups} jamRowState={jamRowStates["MASTER"]} changeRowState={(state: JamRowState) => changeRowState("MASTER", state)} masterEffektGroups={masterEffektGroups} />
                    </Grid>
                </Grid>}
            </>}
        </>
    )
}