import { Button, Divider, Paper, Typography } from "@mui/material";
import { DataGrid, GridCellEditCommitParams, GridColDef } from "@mui/x-data-grid";
import { Strip } from "../../classes/Strips/Strip";
import { useSnackbar } from "notistack";
import { StraightStrip } from "../../classes/Strips/StraightStrip";
import { Point } from "../../classes/Point";
import { useState } from "react";


export type StripManagerProps = {
    strips: Strip[];
    setStrips: (newStrips: Strip[]) => void;
    setSelectedStrip: (index: number) => void;
    selectedStrip: number;
}

const columns: GridColDef[] = [
    { field: 'lcid', headerName: 'LC-ID', width: 60, editable: true, type: "number", },
    {
        field: 'stripName',
        headerName: 'Name',
        width: 150,
        type: "text",
        editable: true,
    },
    {
        field: "stripSymbol",
        headerName: "Symbol",
        width: 100,
        editable: true,
        type: "string",
    },
    {
        field: 'ledCount',
        headerName: 'LED Count',
        width: 100,
        type: "number",
        editable: true,
    },
    {
        field: 'uiMarks',
        headerName: 'UI Marks',
        width: 100,
        type: "number",
        editable: true,
    },
    {
        field: 'getPhysicalLength',
        headerName: 'Physical Length',
        width: 130,
        editable: true,
        type: "number",
        valueFormatter: (params) =>
            `${params.value} cm`,
    }, {
        field: 'offset',
        headerName: 'LED Offset',
        width: 100,
        editable: true,
        type: "number",
    },
    {
        field: "stripInverted",
        headerName: "Invertiert",
        width: 100,
        editable: true,
        type: "boolean",
    },
    {
        field: 'zIndex',
        headerName: 'zIndex',
        width: 100,
        editable: true,
        type: "number",
    },
    {
        field: "mirrorGroup",
        headerName: "Mirror Group",
        width: 100,
        editable: true,
        type: "number",
    },
    {
        field: "ledType",
        headerName: "LED Type",
        width: 100,
        editable: true,
        type: "singleSelect",
        valueOptions: ["WS2811", "WS2813"],
    },
    {
        field: 'stripIP',
        headerName: 'IP',
        width: 150,
        editable: true,
        type: "string",
    },
    {
        field: 'stripMac',
        headerName: 'MAC',
        width: 150,
        editable: true,
        type: "string",
    },
    {
        field: "stripControllerStart",
        headerName: "V-Start",
        width: 100,
        editable: true,
        type: "number",
    },
    {
        field: "stripControllerEnd",
        headerName: "V-End",
        width: 100,
        editable: true,
        type: "number",
    },
    {
        field: "frameDivider",
        headerName: "Frame Divider",
        width: 100,
        editable: true,
        type: "number",
    },
];

const colGroup = [
    {
        groupId: "General",
        children: [{ field: "lcid" }, { field: "uiMarks" }, { field: "stripName" }, { field: "stripSymbol" }, { field: "ledCount" }, { field: "getPhysicalLength" }, { field: "offset" }, { field: "stripInverted" }],
    },
    {
        groupId: "Rendering",
        children: [{ field: "zIndex" }, { field: "mirrorGroup" }],
    },
    {
        groupId: "Controller",
        children: [{ field: "ledType" }, { field: "stripIP" }, { field: "stripMac" }, { field: "stripControllerStart" }, { field: "stripControllerEnd" }, { field: "frameDivider" }],
    }
]


export const StripManager = ({ strips, setStrips, setSelectedStrip, selectedStrip }: StripManagerProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const addNewStrip = () => {
        const newStrips = [...strips];

        //find highest lcid
        let highestLcid = 0;
        newStrips.forEach(strip => {
            if (parseInt(strip.lcid) > highestLcid) {
                highestLcid = parseInt(strip.lcid);
            }
        })

        newStrips.push(new StraightStrip(`${highestLcid + 1}`, new Point(0, 0), 100, 100));
        setStrips(newStrips);
        enqueueSnackbar(`New Strip Added with ID ${strips.length}`, { variant: "success" });
    }

    const removeSelectedStrips = () => {
        if (selectedStrip < 0) {
            enqueueSnackbar("No Strip Selected", { variant: "warning" });
            return;
        }
        const newStrips = [...strips];
        newStrips.splice(selectedStrip, 1);
        setStrips(newStrips);
        setSelectedStrip(-1);
        enqueueSnackbar(`Strips Removed`, { variant: "success" });
    }

    const cellEditCommit = (params: GridCellEditCommitParams) => {
        //Get index of the strip that was edited
        const index = strips.findIndex(strip => strip.id === params.id);
        const newStrips = [...strips];
        const strip = newStrips[index];
        if (params.field === "ledCount") {
            strip.ledCount = parseInt(params.value as string);
        }
        else if (params.field === "getPhysicalLength") {
            strip.setPhysicalLength(parseInt(params.value as string));
        }
        else if (params.field === "lcid") {
            strip.lcid = params.value as string;
        }
        else if (params.field === "offset") {
            strip.offset = params.value as number;
        }
        else if (params.field === "stripName") {
            strip.stripName = params.value as string;
        }
        else if (params.field === "zIndex") {
            strip.zIndex = params.value as number;
        }
        else if (params.field === "stripIP") {
            strip.stripIP = params.value as string;
        }
        else if (params.field === "stripMac") {
            strip.stripMac = params.value as string;
        }
        else if (params.field === "stripSymbol") {
            strip.stripSymbol = params.value as string;
        }
        else if (params.field === "stripControllerStart") {
            strip.stripControllerStart = params.value as number;
        }
        else if (params.field === "stripControllerEnd") {
            strip.stripControllerEnd = params.value as number;
        }
        else if (params.field === "computingGroup") {
            strip.computingGroup = params.value as number;
        }
        else if (params.field === "mirrorGroup") {
            strip.mirrorGroup = params.value as number;
        }
        else if (params.field === "ledType") {
            if (params.value === "WS2811" || params.value === "WS2813") {
                strip.ledType = params.value;
            }
        }
        else if (params.field === "frameDivider") {
            strip.frameDivider = params.value as number;
        }
        else if (params.field === "stripInverted") {
            strip.stripInverted = params.value as boolean;
        }
        else if (params.field === "uiMarks") {
            strip.uiMarks = params.value as number;
        }

        setStrips(newStrips);
    }


    return (<>

        <Paper sx={{
            width: "100%",
            paddingLeft: "10px",
            paddingRight: "10px",
            paddingBottom: "10px",
            marginTop: "10px"
        }}>
            <Typography variant="h6">
                Strips
            </Typography>
            <Divider />
            <DataGrid
                style={{ minHeight: 400, width: '100%' }}
                onRowClick={(e) => {
                    const index = strips.findIndex((strip) => strip.id === e.row.id);
                    if (index !== -1) {
                        setSelectedStrip(index);
                    }
                }}
                columnGroupingModel={colGroup}
                experimentalFeatures={{ columnGrouping: true }}
                rows={strips}
                // rows={[]}
                columns={columns}
                pageSize={10}
                disableSelectionOnClick
                getRowClassName={(params) => {
                    if (params.row.id === strips[selectedStrip]?.id) {
                        return "selected-row";
                    }
                }}
                onProcessRowUpdateError={(params) => console.log(params)}
                onCellEditCommit={cellEditCommit}
            />
            <div style={{
                paddingTop: "10px",
            }}>
                <Button onClick={addNewStrip}>New</Button>
                <Button color="error" onClick={removeSelectedStrips}>Delete</Button>
            </div>
        </Paper>
    </>)
}