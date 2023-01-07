import { Checkbox, Grid, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { WebSocketClient } from "../../system/WebsocketClient";
import { Composition } from "../../types/Composition";
import { CompositionTag } from "../../types/CompositionTag";
import { ReturnType } from "../../types/TopicReturnType";

const getUsedTags = (compositionStore: Composition[]) => {
    const tags: { [key: string]: CompositionTag } = {}
    compositionStore.forEach((comp) => {
        comp.tags.forEach((tag) => {
            if (!tags[tag.id]) tags[tag.id] = tag
        })
    })

    return Object.keys(tags).map((key) => tags[key]);
}

export type RandomizerModeProps = {
    compositionsProps?: Composition[],
}

export const RandomizerMode = ({ compositionsProps }: RandomizerModeProps) => {
    const wsClient = WebSocketClient.getInstance();
    const [compositions, setCompositions] = useState<Composition[]>([])
    const [randomizerMode, setRandomizerMode] = useState(-1);
    const [tagsInUse, setTagsInUse] = useState<string[]>([])

    useEffect(() => {
        const handlerID = wsClient.addEventHandler(ReturnType.SYSTEM.RANDOMIZER_MODE, topic => {
            const data = topic.message;
            console.log("Got randomizer mode", data)
            setRandomizerMode(data);
        });
        if (!compositionsProps) {
            const compositionHandlerID = wsClient.addEventHandler(ReturnType.WSAPI.GET_KEY_VALUE, topic => {
                const data = topic.message;
                if (data.key === "compositionStore") {
                    const comps = Composition.fromJSONArray(JSON.parse(data.value));
                    setCompositions(comps);
                    wsClient.removeEventHandler(compositionHandlerID);
                }
            })
            wsClient.issueKeyGet("compositionStore");
        } else {
            setCompositions(compositionsProps);
        }

        const tagHandlerID = wsClient.addEventHandler("return.system.randomizerTags", topic => {
            const data = topic.message;
            console.log("Got randomizer tags", data)
            setTagsInUse(data);
        });
        wsClient.send("light.random.getTags", "");
        wsClient.send("light.random.getMode", "");
        return () => {
            wsClient.removeEventHandler(handlerID)
            wsClient.removeEventHandler(tagHandlerID);
        }
    }, [])

    const onRandomizerModeChange = (mode: number) => {
        setRandomizerMode(mode);
        wsClient.send("wsapi.reloadPipelineCompositions", {});
        wsClient.send("light.random.setMode", mode);
    }
    const availableTags = getUsedTags(compositions);

    const handleTagChange = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        setTagsInUse(value as string[])
        wsClient.send("light.random.setTags", value);
    };


    return (
        <div>
            <Grid container columnSpacing={2}>
                <Grid item xs={12} md={6}>
                    <Select
                        fullWidth
                        value={randomizerMode}
                        label="Randomizer Mode"
                        onChange={(e) => onRandomizerModeChange(e.target.value as number)}
                    >
                        <MenuItem value={-1} disabled>Randomizer Mode</MenuItem>
                        <MenuItem value={0}>Auto</MenuItem>
                        <MenuItem value={1}>By Compositions</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Select
                        fullWidth
                        multiple
                        renderValue={(selected) => selected.join(', ')}
                        value={tagsInUse}
                        input={<OutlinedInput label="Use Tags" />}
                        onChange={handleTagChange}
                    >
                        {availableTags.map((tag) => (
                            <MenuItem key={tag.id} value={tag.id}>
                                <Checkbox checked={tagsInUse.indexOf(tag.name) > -1} />
                                <ListItemText primary={tag.name} />

                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>

        </div>
    )

}