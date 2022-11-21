import { Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Slider, SxProps, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react";
import { LedStrip } from "../../../types/Strip"
import { FrequencyRange } from "../../../types/FrequencyRanges"
import { Effekt } from "../../../types/Effekt";
import { getEffektGroups, getEffektSetMode, getHoldToActivate, getModKey, setModKey } from "../../../system/JamboardCrossHandler";
import * as _ from "lodash"
import { WebSocketClient } from "../../../system/WebsocketClient";
import { createUUID } from "../../../system/Utils";
import { Theme } from "@mui/system";


type ButtonState = {
    holdToActivate: boolean;
    effekt: Effekt;
    activeEffektId: string | number;
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
type TouchButtonProps = {
    onInteract?: () => void;
    onInteractEnd?: () => void;
    title: string;
    sx?: SxProps<Theme>
}

const TouchButton = ({ onInteract, onInteractEnd, title, sx }: TouchButtonProps) => {
    const isTouchCapable = window.touchToggle;
    if (isTouchCapable) {
        return <Button variant="contained" fullWidth onTouchStart={onInteract} onTouchEnd={onInteractEnd}>{title}</Button>
    } else {
        return <Button variant="contained" fullWidth sx={sx} onMouseDown={onInteract} onMouseUp={onInteractEnd}>{title}</Button>
    }

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
                wsTransaction.lightRemoveEffekt(jamRowState.buttons[key].activeEffektId);
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
        // const holdToActivateGlobal = getHoldToActivate();
        switch (true) {
            case modKey:
                const newButtons = jamRowState.buttons;
                const effektGroup = effektGroups[masterEffektGroups[key]]
                newButtons[key].effekt = _.sample(effektGroup)!;
                changeRowState({ ...jamRowState, buttons: newButtons })
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
                    wsClient.lightRemoveEffekt(jamRowState.buttons[key].activeEffektId);
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
    }

    const isButtonActive = (key: number) => {
        return jamRowState.buttons[key].activeEffektId.toString().length > 0;
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
                        backgroundColor: isButtonActive(i) ? "#5e0000" : null,
                        "&:hover": {
                            backgroundColor: isButtonActive(i) ? "#780000" : null
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
}

const JamRowMaster = ({ changeRowState, jamRowState, masterEffektGroups, effektGroups }: JamRowMasterProps) => {
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

    return (
        <>
            <Typography variant="h5" color="text.secondary">
                Master
            </Typography>
            {Array(countOfEffektGroups).fill(0).map((_, i) =>
                <TouchButton sx={{ height: "6vh", marginBottom: 2, fontSize: 9.5 }} title={jamRowState.buttons[i].effekt.name} />
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
                    <Button variant="contained" color="error" fullWidth >OFF</Button>
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
    const changeRowState = (stripPosition: number | string, newState: JamRowState) => {
        setJamRowStates({ ...jamRowStates, [stripPosition]: newState })
    }
    const effektGroups = getEffektGroups(availableEffekts)

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

    return (
        <>
            {Object.keys(jamRowStates).length > 0 && <Grid container columnSpacing={2}>
                {strips.map((strip, i) => {
                    return (
                        <JamRow effektGroups={effektGroups} index={i} jamRowState={jamRowStates[strip.index]} changeRowState={(state: JamRowState) => changeRowState(strip.index, state)} masterEffektGroups={masterEffektGroups} key={i} strip={strip} />
                    )
                })}
                <Grid item xs />
                <Grid item xs={1.5} sx={{ backgroundColor: "#222222", padding: "10px" }}>
                    <JamRowMaster effektGroups={effektGroups} jamRowState={jamRowStates["MASTER"]} changeRowState={(state: JamRowState) => changeRowState("MASTER", state)} masterEffektGroups={masterEffektGroups} />
                </Grid>
            </Grid>}
        </>
    )
}