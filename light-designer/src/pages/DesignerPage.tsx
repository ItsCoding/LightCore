import { useState, useEffect, useCallback } from "react";
import { StraightStrip } from "../classes/Strips/StraightStrip";
import { Point } from "../classes/Point";
import { Strip } from "../classes/Strips/Strip";
import { StageViewer } from "../components/StageViewer";
import { Grid } from "@mui/material";
import { StripSettings } from "../components/Settings/StripSettings";
import { StripManager } from "../components/Settings/StripManager";
import { Header } from "../components/System/Header";
import { GlobalSettings } from "../components/Settings/GlobalSettings";
import { useSnackbar } from "notistack";
import { WebSocketClient } from "../../../light-client/src/system/WebsocketClient";

export const DesignerPage = () => {
    const [strips, setStrips] = useState<Strip[]>([]);
    const [selectedStripIndex, setSelectedStrip] = useState<number>(-1);
    const [globalScaling, setGlobalScalingState] = useState(2)
    const [enableSidebar, setEnableSidebar] = useState(0);
    const { enqueueSnackbar } = useSnackbar();

    const onGlobalKeyInput = useCallback((e: KeyboardEvent) => {
        const ctrlKey = e.ctrlKey;
        const shiftKey = e.shiftKey;
        switch (e.key) {
            case "Escape":
                setSelectedStrip(-1);
                break;
            // The arrow keys are used to move the selected strip, control is used to move it faster
            case "ArrowUp":
                if (selectedStripIndex !== -1 && ctrlKey) {
                    const strip = strips[selectedStripIndex];
                    strip.move(0, !shiftKey ? -10 : -1);
                    setStrips([...strips]);
                }else{
                    console.log("No strip selected");
                }
                break;
            case "ArrowDown":
                if (selectedStripIndex !== -1 && ctrlKey) {
                    const strip = strips[selectedStripIndex];
                    strip.move(0, !shiftKey ? 10 : 1);
                    setStrips([...strips]);
                }
                break;
            case "ArrowLeft":
                if (selectedStripIndex !== -1 && ctrlKey) {
                    const strip = strips[selectedStripIndex];
                    strip.move(!shiftKey ? -10 : -1, 0);
                    setStrips([...strips]);
                }
                break;
            case "ArrowRight":
                if (selectedStripIndex !== -1 && ctrlKey) {
                    const strip = strips[selectedStripIndex];
                    strip.move(!shiftKey ? 10 : 1, 0);
                    setStrips([...strips]);
                }
                break;
        }

    }, [selectedStripIndex, strips]);
    useEffect(() => {
        window.onkeydown = onGlobalKeyInput;
        return () => {
            window.onkeydown = null;
        }
    }, [selectedStripIndex, strips]);

    useEffect(() => {
        const startPoint = new Point(0, 0);
        const startPoint2 = new Point(0, 100);
        const strip = new StraightStrip("0", startPoint, 100, 500);
        strip.scaleFactor = 2;

        const strip2 = new StraightStrip("1", startPoint2, 300, 500);
        strip2.scaleFactor = 2;
        strip2.rotate(40);

        console.log(strip.getPhysicalLedSize());
        console.table(strip.getPhysicalPositions());
        setStrips([strip, strip2]);

       


        const wsClient = WebSocketClient.getInstance()
        wsClient.connect("ws://localhost:8000").then(() => {
            console.log("Connected to websocket server")
        }).catch((err) => {
            enqueueSnackbar("Could not connect to websocket server", { variant: "error" })
            console.log(err)
        });

        return () => {
            window.onkeydown = null;
        };
    }, [])

    const changeSelectedStrip = (newStrip: Strip) => {
        const newStrips = [...strips];
        newStrips[selectedStripIndex] = newStrip;
        setStrips(newStrips);
    }

    const gridState = () => {
        if (enableSidebar === 0) {
            return 9;
        } else if (enableSidebar === 1) {
            return 12;
        } else {
            return 0;
        }
    }

    const sidebarState = () => {
        if (enableSidebar === 0) {
            return 3;
        } else if (enableSidebar === 1) {
            return 0;
        } else {
            return 12;
        }
    }
    return (<>
        <Header strips={strips} setStrips={setStrips} enableSidebar={enableSidebar} setEnableSidebar={setEnableSidebar} />
        <Grid container sx={{
            minHeight: "95vh",
        }}>
            {enableSidebar != 2 && <Grid item xs={gridState()} sx={{
                overflow: "auto",
            }}>
                <div style={{
                    transform: `scale(${globalScaling})`,
                    transformOrigin: "0% 0% 0px"
                }}>
                    <StageViewer onStripClick={(index: number, ledIndex: number) => {
                        console.log(`Strip ${index} led ${ledIndex} clicked`);
                        setSelectedStrip(index);
                    }} strips={strips} selectedStrip={selectedStripIndex} globalScaling={globalScaling} setStrips={setStrips} />
                </div>
            </Grid>}
            {enableSidebar != 1 &&
                <Grid item xs={sidebarState()}>
                    <GlobalSettings strips={strips} setStrips={setStrips} globalScaling={globalScaling} setGlobalScalingState={setGlobalScalingState} />
                    <StripSettings changeSelectedStrip={changeSelectedStrip} selectedStrip={selectedStripIndex >= 0 ? strips[selectedStripIndex] : null} />
                    <StripManager selectedStrip={selectedStripIndex} setSelectedStrip={(index) => setSelectedStrip(index)} strips={strips} setStrips={setStrips} />
                    {/* {enableSidebar === 2 && <PipelineSettings />} */}
                </Grid>}

        </Grid>

    </>);
}