import { AppBar, Button, Drawer, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import * as fs from 'fs';
import { StraightStrip } from "../../classes/Strips/StraightStrip";
import { Strip } from "../../classes/Strips/Strip";
import * as remote from '@electron/remote';
import MenuIcon from '@mui/icons-material/Menu';
import React from "react";
import { Exporter } from "./Exporter";
const dialog = remote.dialog;
const openJsonFile = async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'LightCore-Mapping', extensions: ['lcm'] }
        ]
    });
    if (result.canceled) {
        return;
    }
    const data = fs.readFileSync(result.filePaths[0], 'utf8');
    return data;
}

const saveJsonFile = async (data: any) => {
    const result = await dialog.showSaveDialog({
        properties: ['createDirectory', 'showOverwriteConfirmation'],
        filters: [
            { name: 'LightCore-Mapping', extensions: ['lcm'] }
        ]
    });
    if (result.canceled) {
        return;
    }
    fs.writeFileSync(result.filePath, JSON.stringify(data));
}
export type HeaderProps = {
    strips: Strip[];
    setStrips: (newStrips: Strip[]) => void;
    enableSidebar: number;
    setEnableSidebar: (newState: number) => void;
}

export const Header = ({ strips, setStrips, enableSidebar, setEnableSidebar }: HeaderProps) => {
    const [openExportDialog, setOpenExportDialog] = React.useState(true);
    const incrementSidebar = () => {
        setEnableSidebar((enableSidebar + 1) % 3);
    }

    return (<Box sx={{ flexGrow: 1 }} >

        <Drawer
            anchor={"right"}
            open={openExportDialog}
            onClose={() => setOpenExportDialog(false)}
        >
            <div style={{width: "98vw"}}>
                <Exporter strips={strips}/>
            </div>
        </Drawer>
        <AppBar position="static" >
            <Toolbar >
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Light-Designer
                </Typography>
                <Button color="inherit" onClick={async () => {
                    const data = await openJsonFile();
                    if (data) {
                        setStrips(StraightStrip.fromJson(data));
                    }
                }}>Load</Button>
                <Button color="secondary" onClick={() => saveJsonFile(strips)}>Save</Button>
                <Button color="info" onClick={() => setOpenExportDialog(true)}>Export to Pipeline</Button>
                <Button color="inherit" onClick={() => incrementSidebar()}>
                    <MenuIcon />
                </Button>

            </Toolbar>
        </AppBar>
    </Box>)
}