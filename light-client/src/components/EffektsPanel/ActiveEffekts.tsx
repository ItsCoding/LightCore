import { ActiveEffekt } from "../../types/ActiveEffekt"
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarContainer, GridValueGetterParams } from '@mui/x-data-grid';
import { strips } from "../../system/StripConfig";
import { WebSocketClient } from "../../system/WebsocketClient";
import { Button, IconButton } from "@mui/material";
import ReplayIcon from '@mui/icons-material/Replay';
import { getBackgroundColor, getHoverBackgroundColor } from "../../system/Utils";
import { Effekt } from "../../types/Effekt";
import { useSnackbar } from "notistack";
import { ActiveEffektsColorPicker } from "./ActiveEffektsColorPicker";
type ActiveEffektsProps = {
    activeEffekts: Array<ActiveEffekt>,
    availableEffekts: Array<Effekt>,

}



export const ActiveEffekts = ({ activeEffekts, availableEffekts }: ActiveEffektsProps) => {
    const wsClient = WebSocketClient.getInstance();
    const { enqueueSnackbar } = useSnackbar();
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
            editable: true
        },
        { field: 'startIndex', headerName: 'Startindex', editable: true, type: 'number', },
        { field: 'endIndex', headerName: 'Endindex', editable: true, type: 'number', },
        {
            field: 'yColor', headerName: 'Static color',
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
            editable: true,
            renderEditCell: ActiveEffektsColorPicker
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

    const checkStripIndex = (value: number,id:string | number) => {
        const rowData = activeEffekts.find(ae => ae.id === id);
        if (rowData) {
            const strip = strips.find(s => s.index === rowData.stripIndex);
            if (!strip) return false;
            if (value < 0 || value > strip.length) {
                enqueueSnackbar(`Startindex must be between 0 and ${strip.length}`, { variant: "error" });
                return false;
            }
            return true;
        }
        return false;
    }

    const changeKeyInActiveEffekt = (id: string | number, key: string, value: any) => {
        const activeEffekt = activeEffekts.find(ae => ae.id === id);
        console.log("Got change", id, key, value);
        if (activeEffekt) {
            switch (key) {
                case "effektName":
                    activeEffekt.effektSystemName = value;
                    break;
                case "stripIndex":
                    activeEffekt.stripIndex = value;
                    break;
                case "startIndex":
                    if(activeEffekt.endIndex < value){
                        enqueueSnackbar(`Startindex must be smaller than endindex`, { variant: "error" });
                    }else if(checkStripIndex(value,id)){
                        activeEffekt.startIndex = value;
                    }
                    break;
                case "endIndex":
                    if(activeEffekt.startIndex > value){
                        enqueueSnackbar(`Endindex must be greater than startindex`, { variant: "error" });
                    }else if(checkStripIndex(value,id)){
                        activeEffekt.endIndex = value;
                    }
                    break;
                case "frequencyRange":
                    let range: number[] = []
                    if (typeof value === "string") {
                        range = value.split("-").map(r => parseInt(r));
                    }
                    if (range.length === 2 && range[0] < range[1] && range[0] >= 0 && range[1] <= 64) {
                        activeEffekt.frequencyRange = range;
                    } else {
                        enqueueSnackbar(`There is an error with your Frequencyrange. It should be like "[START]-[END] and only be in range between 0 and 64!"`, { variant: 'error', anchorOrigin: { vertical: "top", horizontal: "right" } });
                    }
                    break;
                case "yColor":
                    console.log("Got color", value);
                    if (value && value.length === 3) {
                        activeEffekt.instanceData["color"] = value;
                    } else {
                        delete activeEffekt.instanceData["color"];
                        break;
                    }
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
            // experimentalFeatures={{ newEditingApi: true }}
            hideFooter
            getRowClassName={(params) => params.row.effektSystemName === "visualize_OFF" ? "offColor" : ""}
            components={{
                Toolbar: CustomToolbar,
            }}
        />
    </div>)
}