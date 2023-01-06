import { Autocomplete, Button, Chip, Grid, Modal, TextField, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useSnackbar } from "notistack"
import { useEffect, useState } from "react"
import { createUUID, getFontColorByBgColor, randomColor } from "../../system/Utils"
import { WebSocketClient } from "../../system/WebsocketClient"
import { ActiveEffekt } from "../../types/ActiveEffekt"
import { Composition } from "../../types/Composition"
import { CompositionTag } from "../../types/CompositionTag"
import { ReturnType, WSApiKey } from "../../types/TopicReturnType"
import { MyDivider } from "./MyDivider"

export type CompositionSaveDialogProps = {
    activeEffekts: ActiveEffekt[],
    compositionStore?: Composition[],
    setCompositionStore?: (compositions: Composition[]) => void,
    onClose: () => void,
    open: boolean
}

const boxStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export const CompositionSaveDialog = ({ activeEffekts, onClose, compositionStore, setCompositionStore, open }: CompositionSaveDialogProps) => {
    const wsClient = WebSocketClient.getInstance()
    const [localCompositionStore, setLocalCompositionStore] = useState<Composition[]>(compositionStore || [])
    const [selectedTags, setSelectedTags] = useState<CompositionTag[]>([])
    const [name, setName] = useState<string>("")
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (!compositionStore && localCompositionStore.length === 0) {
            const handlerID = wsClient.addEventHandler(ReturnType.WSAPI.GET_KEY_VALUE, topic => {
                if (topic.message === null) return;
                const msg: WSApiKey = topic.message;
                if (msg.key === "compositionStore" && msg.value) {
                    const comps = Composition.fromJSONArray(JSON.parse(msg.value));
                    setLocalCompositionStore(comps)
                    wsClient.removeEventHandler(handlerID);
                }
            })
            wsClient.issueKeyGet("compositionStore");
        }
    }, [])


    const changeSelectedTags = (stuff: (string | CompositionTag)[]) => {
        let selectedTags: CompositionTag[] = []
        stuff.forEach((tag) => {
            if (typeof tag === "string") {
                selectedTags.push({ id: tag, name: tag, color: randomColor() })
            } else {
                selectedTags.push(tag)
            }
        });
        setSelectedTags(selectedTags)
    }


    const getUsedTags = () => {
        const tags: { [key: string]: CompositionTag } = {}
        localCompositionStore.forEach((comp) => {
            comp.tags.forEach((tag) => {
                if (!tags[tag.id]) tags[tag.id] = tag
            })
        })
        return Object.keys(tags).map((key) => tags[key]);
    }

    //check if name is already used
    const nameExists = (): boolean => {
        return localCompositionStore.some((comp) => comp.compositionName.toLocaleLowerCase() === name.toLocaleLowerCase())
    }

    const saveNewComposition = () => {
        const newComposition = new Composition(createUUID(), name, selectedTags, activeEffekts)
        console.log([...localCompositionStore, newComposition])
        if (setCompositionStore) {
            console.log("Saving using the local method")
            setCompositionStore([...localCompositionStore, newComposition])
        } else {
            console.log("Saving using the websocket method")
            setLocalCompositionStore([...localCompositionStore, newComposition])
            const compJSON = [...localCompositionStore, newComposition].map((comp) => comp.toJSON());
            wsClient.issueKeySet("compositionStore", JSON.stringify(compJSON));
        }
        enqueueSnackbar("Composition saved", { variant: "success" })
        onClose();
    }


    return (

        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={boxStyle}>
                <Typography variant="h5">Save Composition</Typography>
                <MyDivider />
                <Grid container rowSpacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            error={nameExists()}
                            helperText={nameExists() ? "Name already exists" : ""}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            label="Name"
                            variant="standard" />
                    </Grid>
                    <Grid item xs={12}>
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
                </Grid>
                <Grid container columnSpacing={2} sx={{ marginTop: 2 }} justifyContent={"flex-end"}>
                    <Grid item>
                        <Button variant="contained" color="success" onClick={() => saveNewComposition()}>Save</Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" onClick={onClose}>Cancel</Button>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    )
}