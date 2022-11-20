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
import { saveJsonFile } from "../system/SaveDialogs";
import { BrowserWindow, globalShortcut } from "@electron/remote";
import { v4 } from "uuid";
import { BackgroundSettings } from "../components/Settings/BackgroundSettings";
import { MelChart } from "../components/MelChart";


export const DesignerPage = () => {
    const isMac = process.platform === "darwin";
    const [strips, setStrips] = useState<Strip[]>([]);
    const [selectedStripIndex, setSelectedStrip] = useState<number>(-1);
    const [globalScaling, setGlobalScalingState] = useState(2)
    const [enableSidebar, setEnableSidebar] = useState(0);
    const { enqueueSnackbar } = useSnackbar();
    const [mouseInViewer, setMouseInViewer] = useState(false);
    const [backgroundInfos, setBackgroundInfos] = useState({
        backgroundBase64: "",
        backgroundScaling: 1,
        width: 0,
        height: 0,
    });
    const [backgroundGreyScale, setBackgroundGreyScale] = useState(35);
    const onGlobalKeyInput = useCallback((e: KeyboardEvent) => {
        const ctrlKey = e.ctrlKey || e.metaKey;
        const shiftKey = e.shiftKey;
        console.log(e);
        switch (e.key) {
            case "Escape":
                setSelectedStrip(-1);
                break;
            // The arrow keys are used to move the selected strip, control is used to move it faster
            case "ArrowUp":
                if (selectedStripIndex !== -1 && mouseInViewer && (ctrlKey || isMac)) {
                    e.preventDefault();
                    const strip = strips[selectedStripIndex];
                    strip.move(0, !shiftKey ? -10 : -1);
                    setStrips([...strips]);

                } else {
                    console.log("No strip selected");
                }
                break;
            case "ArrowDown":
                if (selectedStripIndex !== -1 && mouseInViewer && (ctrlKey || isMac)) {
                    e.preventDefault();
                    const strip = strips[selectedStripIndex];
                    strip.move(0, !shiftKey ? 10 : 1);
                    setStrips([...strips]);

                }
                break;
            case "ArrowLeft":
                if (selectedStripIndex !== -1 && mouseInViewer && (ctrlKey || isMac)) {
                    e.preventDefault();
                    const strip = strips[selectedStripIndex];
                    strip.move(!shiftKey ? -10 : -1, 0);
                    setStrips([...strips]);

                }
                break;
            case "ArrowRight":
                if (selectedStripIndex !== -1 && mouseInViewer && (ctrlKey || isMac)) {
                    e.preventDefault();
                    const strip = strips[selectedStripIndex];
                    strip.move(!shiftKey ? 10 : 1, 0);
                    setStrips([...strips]);

                }
                break;
            case "s":
                if (ctrlKey) {
                    saveJsonFile({ strips, backgroundInfos, globalScaling });
                    e.preventDefault();
                }
                break;
            case "i":
                if (ctrlKey && e.shiftKey) {
                    const win = BrowserWindow.getFocusedWindow();
                    if (win) {
                        BrowserWindow.getFocusedWindow()?.webContents.openDevTools();
                        e.preventDefault();
                    }
                }
                break;
            // make a copy and paste of the selected strip
            case "d":
                if (ctrlKey && selectedStripIndex !== -1 && mouseInViewer) {
                    const strip = strips[selectedStripIndex];
                    const stripString = strip.toJson();
                    const copy = StraightStrip.fromJson(stripString)[0];
                    copy.id = v4();
                    copy.move(100, 10);
                    setStrips([...strips, copy]);
                    e.preventDefault();
                } else {
                    if (!mouseInViewer) {
                        enqueueSnackbar("You need to hover over the stage viewer to copy a strip", { variant: "warning" })
                    }
                    if (selectedStripIndex === -1) {
                        enqueueSnackbar("You need to select a strip to copy", { variant: "warning" })
                    }
                }
                break;
            // rotate the selected strip
            case "q":
                if (ctrlKey && selectedStripIndex !== -1 && mouseInViewer) {
                    const strip = strips[selectedStripIndex];
                    strip.rotate(strip.getStripAngle + 1);
                    setStrips([...strips]);
                    e.preventDefault();
                }
                break;
            case "e":
                if (ctrlKey && selectedStripIndex !== -1 && mouseInViewer) {
                    const strip = strips[selectedStripIndex];
                    strip.rotate(strip.getStripAngle - 2);
                    setStrips([...strips]);
                    e.preventDefault();
                }
                break;

        }

    }, [selectedStripIndex, strips, mouseInViewer]);

    const onMouseWheel = useCallback(
        (e: WheelEvent) => {
            if (e.ctrlKey && !e.shiftKey) {
                if (e.deltaY < 0) {
                    if (!(globalScaling >= 10)) setGlobalScalingState(globalScaling + (isMac ? 0.01 : 0.4));
                } else {
                    if (!(globalScaling <= 0.5)) setGlobalScalingState(globalScaling - (isMac ? 0.01 : 0.4));
                }
            } else if (e.shiftKey && e.ctrlKey) {
                if (e.deltaY < 0) {
                    if (!(globalScaling >= 10)) setGlobalScalingState(globalScaling + 0.1);
                } else {
                    if (!(globalScaling <= 0.5)) setGlobalScalingState(globalScaling - 0.1);
                }

            }
        }, [globalScaling, backgroundInfos]);

    useEffect(() => {
        document.addEventListener('keydown', onGlobalKeyInput);
        document.addEventListener("mousewheel", onMouseWheel);
        return () => {
            document.removeEventListener('keydown', onGlobalKeyInput);
            document.removeEventListener("mousewheel", onMouseWheel);
        }
    }, [selectedStripIndex, strips, globalScaling, mouseInViewer, backgroundInfos]);

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
            globalShortcut.unregisterAll();
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
        <Header globalScaling={globalScaling} setGlobalScalingState={setGlobalScalingState} setBackgroundInfos={setBackgroundInfos} backgroundInfos={backgroundInfos} strips={strips} setStrips={setStrips} enableSidebar={enableSidebar} setEnableSidebar={setEnableSidebar} />
        <Grid container sx={{
            height: "90vh",
        }}>
            {enableSidebar != 2 && <Grid
                onMouseEnter={() => setMouseInViewer(true)}
                onMouseLeave={() => setMouseInViewer(false)}
                item
                xs={gridState()}
                sx={{
                    overflow: "scroll",
                    position: "relative",
                    maxHeight: "96vh"
                }}>
                <div style={{
                    height: "100%",
                    width: "100%",
                    position: "absolute",
                    zIndex: 100,
                    transform: `scale(${globalScaling})`,
                    transformOrigin: "0% 0% 0px",
                }}>
                    <StageViewer onStripClick={(index: number, ledIndex: number) => {
                        console.log(`Strip ${index} led ${ledIndex} clicked`);
                        setSelectedStrip(index);
                    }} strips={strips} selectedStrip={selectedStripIndex} globalScaling={globalScaling} setStrips={setStrips} />
                </div>
                <img style={{
                    position: "static",
                    zIndex: -1000,
                    top: 0,
                    left: 0,
                    // apply a black filter to the background
                    filter: `brightness(${backgroundGreyScale / 100})`,
                    // backgroundImage: `url(${backgroundInfos.backgroundBase64})`,
                    // transform: `scale(${backgroundInfos.backgroundScaling})`,
                    // backgroundSize: "cover",
                    height: backgroundInfos.height * backgroundInfos.backgroundScaling * globalScaling,
                    width: backgroundInfos.width * backgroundInfos.backgroundScaling * globalScaling,
                }} src={backgroundInfos.backgroundBase64} />
            </Grid>}
            {enableSidebar != 1 &&
                <Grid item xs={sidebarState()} sx={{
                    overflow: "scroll",
                }}>
                    <GlobalSettings strips={strips} setStrips={setStrips} globalScaling={globalScaling} setGlobalScalingState={setGlobalScalingState} />
                    <StripSettings changeSelectedStrip={changeSelectedStrip} selectedStrip={selectedStripIndex >= 0 ? strips[selectedStripIndex] : null} />
                    <StripManager selectedStrip={selectedStripIndex} setSelectedStrip={(index) => setSelectedStrip(index)} strips={strips} setStrips={setStrips} />
                    <MelChart key="melchart" />
                    <BackgroundSettings backgroundGreyScale={backgroundGreyScale} setBackgroundGreyScale={setBackgroundGreyScale} backgroundInfos={backgroundInfos} setBackgroundInfos={setBackgroundInfos} />
                </Grid>}

        </Grid>

    </>);
}