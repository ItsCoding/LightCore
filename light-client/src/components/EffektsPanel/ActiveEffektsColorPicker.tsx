import { Button, Popover } from "@mui/material";
import { GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid";
import React from "react";
import { SketchPicker } from "react-color";

export const ActiveEffektsColorPicker = (props: GridRenderEditCellParams) => {
    const { id, value, field, } = props;
    const apiRef = useGridApiContext();
    const close = () => {
        apiRef.current.commitCellChange({ id, field });
        apiRef.current.setCellMode(id, field, 'view')
    }

    const handleValueChange = (color: number[]) => {
        apiRef.current.setEditCellValue({ id, field, value: color });
    };

    const getElementRef = () => {
        return apiRef.current.getCellElement(id, field);
    }

    const clear = () => {
        apiRef.current.setEditCellValue({ id, field, value: undefined });
        apiRef.current.commitCellChange({ id, field });
        apiRef.current.setCellMode(id, field, 'view')
    }

    const getColor = () => {
        if (value && typeof value === "object") {
            return {
                r: value[0],
                g: value[1],
                b: value[2],
            }
        } else {
            return {
                r: 0,
                g: 0,
                b: 0
            }
        }
    }
    return <>
        <Popover

            sx={{
                "& .MuiPopover-paper": {
                    backgroundColor: "rgb(255, 255, 255)",
                }
                // bgcolor: "",
            }}
            id={`${id}-${field}`}
            open={props.cellMode === 'edit'}
            anchorEl={getElementRef()}
            onClose={() => close()}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
        >
            <SketchPicker
                disableAlpha
                color={getColor()} onChange={(c) => handleValueChange([c.rgb.r, c.rgb.g, c.rgb.b])} />
            <div style={{ margin: "10px" }}>
                <Button size="small" fullWidth variant="contained" onClick={() => clear()}>Clear</Button>
            </div>

        </Popover>
    </>
}