import { ActiveEffekt } from "../../types/ActiveEffekt"
import { DataGrid, GridColDef, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { strips } from "../../system/StripConfig";
import { WebSocketClient } from "../../system/WebsocketClient";
import { Button } from "@mui/material";
import { useEffect } from "react";
type ActiveEffektsProps = {
    activeEffekts: Array<ActiveEffekt>,
}

export const ActiveEffekts = ({ activeEffekts }: ActiveEffektsProps) => {
    const wsClient = WebSocketClient.getInstance();
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID' },
        { field: 'effektName', headerName: 'Name', width: 200 },
        {
            field: 'stripIndex', headerName: 'Part',
            width: 100,
            valueGetter: (params: GridValueGetterParams) =>
                `${strips.find(s => s.index === params.row.stripIndex)?.position || ''}`,
        },
        {
            field: 'frequencyRange',
            headerName: 'Frequency Range',
            valueGetter: (params: GridValueGetterParams) =>
                `${params.row.frequencyRange[0]}-${params.row.frequencyRange[1]}`,
            width: 200,
        },
        { field: 'startIndex', headerName: 'Startindex' },
        { field: 'endIndex', headerName: 'Endindex' },
        {
            field: 'xID', headerName: '#',
            renderCell: (params: GridRenderCellParams) =>
                <>
                    <Button variant="outlined" style={{color:"#d4d4d4", borderColor: "#d4d4d4"}} onClick={() => {
                        wsClient.lightRemoveEffekt(params.row.id);
                    }}>Remove</Button>
                </>,
        },
    ];
    useEffect(() => {
        wsClient.lightReport();
    }, [])

    return (<div>
        <DataGrid
            style={{ height: 400, width: '100%' }}
            rows={activeEffekts}
            columns={columns}
            pageSize={100}
            autoHeight
            disableColumnMenu
            rowsPerPageOptions={[100]}
            disableSelectionOnClick
            hideFooter

        />
    </div>)
}