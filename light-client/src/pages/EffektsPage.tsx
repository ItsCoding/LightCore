import { Alert, AlertTitle, Autocomplete, Button, Card, CardActions, CardContent, CardHeader, Chip, Grid, Tab, Tabs, TextField } from "@mui/material"
import React, { useEffect } from "react"
import { ColorResult } from "react-color"
import { EffektsPanel } from "../components/EffektsPanel"
import { ActiveEffekts } from "../components/EffektsPanel/ActiveEffekts"
import { EffektColor } from "../components/EffektsPanel/EffektColor"
import { EditComposition } from "../components/General/Compositions/EditComposition"
import { strips } from "../system/StripConfig"
import { createUUID, getFontColorByBgColor, randomColor } from "../system/Utils"
import { WebSocketClient } from "../system/WebsocketClient"
import { ActiveEffekt } from "../types/ActiveEffekt"
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


export const EffektsPage = ({ availableEffekts, isRandomizerActive, setRandomizerActive, compositionStore, setCompositionStore }: EffektsPageProps) => {
    const wsClient = WebSocketClient.getInstance()
    const [activeColorPanel, setActiveColorPanel] = React.useState<number>(0)
    const [colorDict, setColorDict] = React.useState<ColorDict>({})
    const [activeEffekts, setActiveEffekts] = React.useState<Array<ActiveEffekt>>([]);
    const [selectedTags, setSelectedTags] = React.useState<Array<CompositionTag>>([]);
    const [newComposition, setNewCompositionName] = React.useState<Composition | null>(null);
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
            setNewCompositionName(nComp)
        } else if (stuff !== null) {
            setNewCompositionName(stuff)
        }
    }

    const saveComposition = () => {
        if (newComposition !== null) {
            const newComp = new Composition(newComposition.id, newComposition.compositionName, selectedTags, activeEffekts);
            const newStore = [...compositionStore, newComp]
            console.log(newStore)
            setCompositionStore(newStore)
            setNewCompositionName(null)
            setSelectedTags([])
        } else {
            console.log("New Composition is null", newComposition)
        }
    }


    useEffect(() => {
        const eventID = wsClient.addEventHandler(ReturnType.DATA.ACTIVE_EFFEKTS, (topic => {
            console.log("EFFEKT_ACTIVE", topic)
            const incommingEffekts = ActiveEffekt.fromJSONArray(topic.message);
            console.log("IncommingActives: ", incommingEffekts)
            setActiveEffekts(incommingEffekts);
        }))
        return () => {
            wsClient.removeEventHandler(eventID)
        }
    }, [])

    return (
        <div>
            <EditComposition onSave={() => { }} open={false} onClose={() => { }} activeEffekts={activeEffekts} />
            {isRandomizerActive ?
                <Alert severity="warning">
                    <AlertTitle>Warning</AlertTitle>
                    <strong>Randomizer</strong> is active. <Button onClick={() => {
                        setRandomizerActive(false);
                        wsClient.lightRandomSetEnabled(false);
                    }}>Disable</Button>
                </Alert> : null}
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
            <Grid container spacing={2}>
                {stripConfig.map(strip => {
                    return (
                        <Grid item xs={12} md={6}>
                            <EffektsPanel key={strip.index} colorDict={colorDict} availableEffekts={availableEffekts} strip={strip} />
                        </Grid>
                    )
                })}

            </Grid>
            <div style={{
                marginTop: 20
            }}>
                <Card>
                    <CardHeader title={"Create composition"} />
                    <CardContent>
                        <ActiveEffekts activeEffekts={activeEffekts} />
                    </CardContent>
                    <CardActions style={{
                        margin: 10
                    }}>
                        <Autocomplete
                            style={{
                                width: "20vw",
                                paddingRight: 10,
                            }}
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
                        <Autocomplete
                            style={{
                                width: "20vw",
                                paddingRight: 10,
                            }}
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
                        <Button color="success" variant="contained" onClick={() => { saveComposition() }}>Save</Button>
                    </CardActions>
                </Card>
                {/* <ActiveEffekts activeEffekts={activeEffekts} /> */}
            </div>

        </div>
    )
}