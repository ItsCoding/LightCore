import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import * as fs from 'fs';
import { StraightStrip } from "../../classes/Strips/StraightStrip";
import { Strip } from "../../classes/Strips/Strip";
import * as remote from '@electron/remote';
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
}

export const Header = ({ strips, setStrips }: HeaderProps) => (<Box sx={{ flexGrow: 1 }} >
    <AppBar position="static" >
        <Toolbar >
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                LightGrid
            </Typography>
            <Button color="inherit" onClick={async () => {
                const data = await openJsonFile();
                if (data) {
                    setStrips(StraightStrip.fromJson(data));
                }
            }}>Load</Button>
            <Button color="secondary" onClick={() => saveJsonFile(strips)}>Save</Button>
        </Toolbar>
    </AppBar>
</Box>)