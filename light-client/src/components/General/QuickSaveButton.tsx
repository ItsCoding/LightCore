import { Button, Card, CardActions, CardContent, Divider, Drawer, FormControlLabel, Grid, IconButton, Switch, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { GridSaveAltIcon } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { createUUID, parseStrips } from "../../system/Utils";
import { WebSocketClient } from "../../system/WebsocketClient"
import { ActiveEffekt } from "../../types/ActiveEffekt";
import { Composition } from "../../types/Composition";
import { LedStrip } from "../../types/Strip";
import { ReturnType } from "../../types/TopicReturnType";
import { CompositionSaveDialog } from "./CompositionSaveDialog";

export type ActiveEffektHistory = {
    effekts: ActiveEffekt[],
    timestamp: number,
}

// let lastActiveEffekts: ActiveEffektHistory[] = [];
let stripConfig: LedStrip[] = [];
let pauseRecording = false;

export type QuickSaveButtonProps = {
    compositionStore?: Array<Composition>,
    setCompositionStore?: (store: Array<Composition>) => void,
}

export const QuickSaveButton = ({ compositionStore, setCompositionStore }: QuickSaveButtonProps) => {
    const wsClient = WebSocketClient.getInstance();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [saveDialogData, setSaveDialogData] = useState<ActiveEffekt[] | undefined>(undefined);
    const [lastActiveEffekts, setLastActiveEffekts] = useState<ActiveEffektHistory[]>([]);

    useEffect(() => {
        if (stripConfig.length === 0) {
            const handlerIDConfig = wsClient.addEventHandler("return.wsapi.ledconfig", topic => {
                const data = topic.message;
                const strips = parseStrips(data);
                console.log("Got Strips for Save", strips);
                stripConfig = strips;
                wsClient.removeEventHandler(handlerIDConfig);
            })
            wsClient.send("wsapi.requestConfig", {});
        } else {
            console.log("Already got strips for save", stripConfig)
        }

        const handlerID = wsClient.addEventHandler(ReturnType.DATA.ACTIVE_EFFEKTS, (topic) => {
            const incommingEffekts = ActiveEffekt.fromJSONArray(topic.message);
            // console.log("Incomming Save effects", incommingEffekts)
            if (!pauseRecording) {
                setLastActiveEffekts((prev) => {
                    return [{
                        effekts: incommingEffekts,
                        timestamp: Date.now()
                    }, ...prev]
                });
                if (lastActiveEffekts.length > 15) {
                    setLastActiveEffekts((prev) => {
                        return prev.slice(0, 15)
                    });
                }
            }
        })

        return () => {
            wsClient.removeEventHandler(handlerID)
        }
    }, [drawerOpen])

    type CompCardProps = {
        historyItem: ActiveEffektHistory,
        latest?: boolean
    }

    const recallTempComp = (activeEffekts: ActiveEffekt[]) => {
        const tempComp = new Composition(createUUID(), "Temp", [], activeEffekts);
        tempComp.activate(() => { });
    }

    const CompCard = ({ historyItem, latest }: CompCardProps) => {
        return (
            <Card>
                <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        {latest ? <b>Latest</b> : new Date(historyItem.timestamp).toLocaleString()}
                    </Typography>
                    <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
                    {historyItem.effekts.map((effekt, index) => {
                        return (
                            <Typography key={index} sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                <b>{stripConfig[effekt.stripIndex].position}</b>: {effekt.effektName}
                            </Typography>
                        )
                    })
                    }
                </CardContent>
                <CardActions>
                    <Button color="success" size="small" onClick={() => setSaveDialogData(historyItem.effekts)}>Save</Button>
                    <Button color="warning" size="small" onClick={() => recallTempComp(historyItem.effekts)}>Reacall</Button>
                </CardActions>
            </Card>
        )
    }


    return (
        <div style={{
            marginLeft: 10,
            marginRight: 10
        }}>
            {/* <Button onClick={toggleDrawer(anchor, true)}>{anchor}</Button> */}
            <IconButton aria-label="fullscreen" onClick={() => setDrawerOpen(true)} component="label" >
                <GridSaveAltIcon />
            </IconButton>
            <CompositionSaveDialog
                open={saveDialogData !== undefined}
                onClose={() => setSaveDialogData(undefined)}
                activeEffekts={saveDialogData ?? []}
                compositionStore={compositionStore}
                setCompositionStore={setCompositionStore}
            />
            <Drawer
                anchor={"bottom"}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        maxHeight: "60vh"
                    }
                }}
            >
                <div style={{
                    padding: 10
                }}>
                    <Grid container>
                        <Grid item xs={4} md={1}>
                            <FormControlLabel control={<Switch defaultChecked={pauseRecording} onChange={(e, chk) => pauseRecording = chk} />} label="Pause recording" />
                        </Grid>
                        <Grid item xs={4} md={1}>
                            <Button variant="contained" size="small" color="error" onClick={() => setLastActiveEffekts([])}>Clear</Button>
                        </Grid>
                    </Grid>
                    <Stack rowGap={2}>
                        {lastActiveEffekts.map((effekts, index) => {
                            return (
                                <CompCard latest={index === 0} historyItem={effekts} key={index} />
                            )
                        })}
                    </Stack>
                </div>
            </Drawer>
        </div>

    )

}