import { ActiveEffekt } from "../../types/ActiveEffekt"
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarContainer, GridValueGetterParams } from '@mui/x-data-grid';
import { strips } from "../../system/StripConfig";
import { WebSocketClient } from "../../system/WebsocketClient";
import { Button, IconButton } from "@mui/material";
import ReplayIcon from '@mui/icons-material/Replay';
import { borderRadius } from "@mui/system";
import { getBackgroundColor, getHoverBackgroundColor } from "../../system/Utils";
import { Effekt } from "../../types/Effekt";
type ActiveEffektsProps = {
    activeEffekts: Array<ActiveEffekt>,
    availableEffekts: Array<Effekt>,

}



export const ActiveEffekts = ({ activeEffekts, availableEffekts }: ActiveEffektsProps) => {
    const wsClient = WebSocketClient.getInstance();

    const getAvailableStrips = () => {
        return strips.map(strip => {
            return { value: strip.index, label: strip.position }
        })
    }

    const getAvailableEffekts = () => {
        return availableEffekts.map(effekt => {
            return { value: effekt.effektSystemName, label: effekt.name }
        })
    }

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID' },
        { field: 'effektName', headerName: 'Name', width: 200, type: "singleSelect", valueOptions: getAvailableEffekts(), editable: true, },
        {
            field: 'stripIndex', headerName: 'Part',
            width: 100,
            editable: true,
            type: "singleSelect", valueOptions: getAvailableStrips(),
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
        { field: 'startIndex', headerName: 'Startindex', editable: true, type: 'number', },
        { field: 'endIndex', headerName: 'Endindex', editable: true, type: 'number', },
        {
            field: 'yID', headerName: 'Static color',
            renderCell: (params: GridRenderCellParams) =>
                <>
                    {params.row.instanceData.hasOwnProperty("color") ?
                        <div style={{
                            backgroundColor: `rgb(${params.row.instanceData.color[0]},${params.row.instanceData.color[1]},${params.row.instanceData.color[2]})`,
                            width: "3vh",
                            height: "3vh",
                            borderRadius: "50%",
                        }}></div>
                        : " - "}
                </>,
        },
        {
            field: 'xID', headerName: '#',
            renderCell: (params: GridRenderCellParams) =>
                <>
                    <Button variant="outlined" style={{ color: "#d4d4d4", borderColor: "#d4d4d4" }} onClick={() => {
                        wsClient.lightRemoveEffekt(params.row.id);
                    }}>Remove</Button>
                </>,
        },
    ];

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <IconButton color="default" aria-label="reload" component="label" onClick={() => wsClient.lightReport()}>
                    <ReplayIcon />
                </IconButton>
            </GridToolbarContainer>
        );
    }

    const changeKeyInActiveEffekt = (id: string | number, key: string, value: any) => {
        const activeEffekt = activeEffekts.find(ae => ae.id === id);
        if (activeEffekt) {
            switch (key) {
                case "effektName":
                    activeEffekt.effektSystemName = value;
                    break;
                case "stripIndex":
                    activeEffekt.stripIndex = value;
                    break;
                case "startIndex":
                    activeEffekt.startIndex = value;
                    break;
                case "endIndex":
                    activeEffekt.endIndex = value;
                    break;
            }
            const transaction = WebSocketClient.startTransaction();
            transaction.lightRemoveEffekt(id);
            transaction.lightAddEffekt(activeEffekt.effektSystemName,
                activeEffekt.stripIndex,
                activeEffekt.frequencyRange,
                activeEffekt.instanceData,
                activeEffekt.startIndex,
                activeEffekt.endIndex,
                activeEffekt.id);
            transaction.lightReport();
            transaction.commit();
        }
    }

    return (<div>
        <DataGrid
            style={{ width: '100%' }}
            rows={activeEffekts}
            columns={columns}
            sx={{
                '& .offColor': {
                    bgcolor: (theme) =>
                        getBackgroundColor(theme.palette.error.main, theme.palette.mode),
                    '&:hover': {
                        bgcolor: (theme) =>
                            getHoverBackgroundColor(theme.palette.error.main, theme.palette.mode),
                    },
                },
            }}
            pageSize={100}
            autoHeight
            disableColumnMenu
            rowsPerPageOptions={[100]}
            disableSelectionOnClick
            onCellEditCommit={(params) => {
                changeKeyInActiveEffekt(params.id, params.field, params.value);
            }}
            hideFooter
            getRowClassName={(params) => params.row.effektSystemName === "visualize_OFF" ? "offColor" : ""}
            components={{
                Toolbar: CustomToolbar,
            }}
        />
    </div>)
}