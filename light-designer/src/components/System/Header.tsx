import { AppBar, Button, Drawer, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";

import { StraightStrip } from "../../classes/Strips/StraightStrip";
import { Strip } from "../../classes/Strips/Strip";

import MenuIcon from '@mui/icons-material/Menu';
import React from "react";
import { Exporter } from "./Exporter";
import { openJsonFile, saveJsonFile } from "../../system/SaveDialogs";
import { AirlineSeatLegroomNormalOutlined, Downloading, FileUpload, FolderOpen, Save } from "@mui/icons-material";
import { WebSocketClient } from "../../../../light-client/src/system/WebsocketClient";
import { useSnackbar } from "notistack";


export type HeaderProps = {
    strips: Strip[];
    setStrips: (newStrips: Strip[]) => void;
    enableSidebar: number;
    setEnableSidebar: (newState: number) => void;
    backgroundInfos: {
        backgroundBase64: string,
        backgroundScaling: number,
        width: number,
        height: number,
    },
    setBackgroundInfos: (newBackgroundInfos: {
        backgroundBase64: string,
        backgroundScaling: number,
        width: number,
        height: number,
    }) => void;
    globalScaling: number;
    setGlobalScalingState: (newGlobalScaling: number) => void;
}

export const Header = ({ strips, setStrips, enableSidebar, setEnableSidebar, backgroundInfos, setBackgroundInfos, globalScaling, setGlobalScalingState }: HeaderProps) => {
    const [openExportDialog, setOpenExportDialog] = React.useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const wsClient = WebSocketClient.getInstance();
    const incrementSidebar = () => {
        setEnableSidebar((enableSidebar + 1) % 3);
    }


    const retriveFromPipeline = async () => {
        const handlerID = wsClient.addEventHandler("return.wsapi.getKeyValue", (data) => {
            const message = data.message;
            const projectData = JSON.parse(message.value);
            if (Array.isArray(projectData)) {
                //legacy project
                setStrips(StraightStrip.fromJson(message.value));
                setBackgroundInfos({
                    backgroundBase64: "",
                    backgroundScaling: 1,
                    width: 0,
                    height: 0,
                })
            } else {
                const stripData = projectData.strips;
                if (stripData) {
                    setStrips(StraightStrip.fromJson(JSON.stringify(stripData)));
                }
                if (projectData.globalScaling) {
                    setGlobalScalingState(projectData.globalScaling);
                }
                if (projectData.backgroundInfos) {
                    setBackgroundInfos(projectData.backgroundInfos);
                } else {
                    setBackgroundInfos({
                        backgroundBase64: "",
                        backgroundScaling: 1,
                        width: 0,
                        height: 0,
                    })
                }
                enqueueSnackbar("Project loaded from pipeline", { variant: "success" });
            }
            wsClient.removeEventHandler(handlerID);
        })
        await wsClient.issueKeyGet("designer.project");
    }

    return (<Box sx={{ flexGrow: 1 }} >

        <Drawer
            anchor={"right"}
            open={openExportDialog}
            onClose={() => setOpenExportDialog(false)}
        >
            <div style={{ width: "98vw" }}>
                <Exporter globalScaling={globalScaling} backgroundInfos={backgroundInfos} closeModal={() => setOpenExportDialog(false)} strips={strips} />
            </div>
        </Drawer>
        <AppBar position="static" >
            <Toolbar >
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Light-Designer
                </Typography>
                <Button color="inherit" onClick={async () => {
                    const data = await openJsonFile();
                    const projectData = JSON.parse(data);
                    if (Array.isArray(projectData)) {
                        //legacy project
                        setStrips(StraightStrip.fromJson(data));
                        setBackgroundInfos({
                            backgroundBase64: "",
                            backgroundScaling: 1,
                            width: 0,
                            height: 0,
                        })
                    } else {
                        const stripData = projectData.strips;
                        if (stripData) {
                            setStrips(StraightStrip.fromJson(JSON.stringify(stripData)));
                        }
                        if (projectData.globalScaling) {
                            setGlobalScalingState(projectData.globalScaling);
                        }
                        if (projectData.backgroundInfos) {
                            setBackgroundInfos(projectData.backgroundInfos);
                        } else {
                            setBackgroundInfos({
                                backgroundBase64: "",
                                backgroundScaling: 1,
                                width: 0,
                                height: 0,
                            })
                        }
                    }

                }}>
                    <FolderOpen />
                </Button>
                <Button color="inherit" onClick={() => saveJsonFile({ strips, backgroundInfos, globalScaling })}>
                    <Save />
                </Button>
                <Button color="info" onClick={() => setOpenExportDialog(true)}>
                    <FileUpload />
                </Button>
                <Button color="info" onClick={() => retriveFromPipeline()}>
                    <Downloading />
                </Button>
                <Button color="inherit" onClick={() => incrementSidebar()}>
                    <MenuIcon />
                </Button>

            </Toolbar>
        </AppBar>
    </Box>)
}