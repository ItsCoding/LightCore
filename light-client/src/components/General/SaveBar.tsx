import { Autocomplete, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material"
import React from "react";
import { ModalTransition } from "../../system/Utils";

export type SaveBarProps = {
    onSave: () => void;
    autocompleteOptions: any[];
    onAutocompleteChange: (event: React.ChangeEvent<{}>, value: any) => void;
    getOptionLabel: (option: any) => string;
    selectedExists: boolean;
    placeholder: string;
    label: string;
    confirmDict: ConfirmDictType;
}

export type ConfirmOption = {
    title: string,
    text: JSX.Element,
    confirm: (exit: () => void) => void,
    confirmText: string
}

export type ConfirmDictType = {
    [key in 1 | 2 | 3]: ConfirmOption;
}

const zeroConfirm: ConfirmOption = {
    title: "",
    text: <></>,
    confirm: () => { },
    confirmText: ""
}

export const SaveBar = ({ onSave, autocompleteOptions, getOptionLabel, onAutocompleteChange, selectedExists, label, placeholder, confirmDict }: SaveBarProps) => {
    const [confirmDialogOptions, setConfirmDialogOptions] = React.useState<0 | 1 | 2 | 3>(0);

    const confirmSave = () => {
        if (selectedExists) {
            setConfirmDialogOptions(1);
        } else {
            onSave();
        }
    }

    const getOptionFromDict = (option: 0 | 1 | 2 | 3) => {
        if (option === 0) {
            return zeroConfirm;
        }
        return confirmDict[option];
    }

    return (
        <>
            <Dialog
                open={confirmDialogOptions > 0}
                TransitionComponent={ModalTransition}
                keepMounted
                onClose={() => setConfirmDialogOptions(0)}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{getOptionFromDict(confirmDialogOptions).title}</DialogTitle>
                <DialogContent>
                    {getOptionFromDict(confirmDialogOptions).text}
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" style={{ color: "#d4d4d4", borderColor: "#d4d4d4" }} onClick={() => setConfirmDialogOptions(0)}>Abort</Button>
                    <Button variant="contained" onClick={() => {
                        getOptionFromDict(confirmDialogOptions).confirm(() => setConfirmDialogOptions(0));
                    }}>{getOptionFromDict(confirmDialogOptions).confirmText}</Button>
                </DialogActions>
            </Dialog>
            <Grid container columnSpacing={2}>
                <Grid item xs={6}>
                    <Autocomplete
                        fullWidth
                        size="small"
                        id="names-standard"
                        options={autocompleteOptions}
                        freeSolo
                        onChange={onAutocompleteChange}
                        getOptionLabel={getOptionLabel}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label={label}
                                placeholder={placeholder}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Grid container justifyContent={"center"} spacing={4}>
                        <Grid item xs={4} md={4}>
                            <Button fullWidth color="success" variant="contained" onClick={() => { confirmSave() }}>Save</Button>
                        </Grid>
                        <Grid item xs={4} md={4}>
                            <Button fullWidth color="primary" variant="contained" disabled={!selectedExists} onClick={() => { setConfirmDialogOptions(3) }}>Load</Button>
                        </Grid>
                        <Grid item xs={4} md={4}>
                            <Button fullWidth color="error" variant="contained" disabled={!selectedExists} onClick={() => { setConfirmDialogOptions(2) }}>Delete</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>

    )
}