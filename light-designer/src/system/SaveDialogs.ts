import * as remote from '@electron/remote';
import * as fs from 'fs';
const dialog = remote.dialog;

export const openJsonFile = async () => {
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

export const saveJsonFile = async (data: any) => {
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