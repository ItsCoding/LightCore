import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { createUUID, ModalTransition } from "../../system/Utils";
import { WebSocketClient } from "../../system/WebsocketClient";
import { Board, Board2JSON } from "../../types/Board";

export type BoardSaveDialogProps = {
    board: Board;
    setBoard: React.Dispatch<React.SetStateAction<Board>>;
    availableBoards: Array<Board>;
    setAvailableBoards: React.Dispatch<React.SetStateAction<Array<Board>>>;
}

type ConfirmDictType = {
    [index: number]: {
        title: string,
        text: JSX.Element,
        confirm: () => void,
        confirmText: string
    }
}


export const BoardSaveDialog = ({ availableBoards, board, setAvailableBoards, setBoard }: BoardSaveDialogProps) => {
    const [boardDescription, setBoardDescription] = useState<string>("")
    const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
    const [confirmDialog, setConfirmDialog] = useState<number>(0)
    const wsClient = WebSocketClient.getInstance();

    const { enqueueSnackbar } = useSnackbar();
    const onSaveBoard = () => {
        if ((!board.name || board.name.length === 0) && !selectedBoard) {
            enqueueSnackbar(`Board needs a name!`, { variant: 'error', anchorOrigin: { vertical: "top", horizontal: "right" } });
            return
        }
        let newAavailableBoards = []
        let newBoard: Board = {elements: {}}
        if (selectedBoard) {
            newBoard = { ...selectedBoard, elements: board.elements, description: boardDescription }
            newAavailableBoards = availableBoards.map(b => b.id === selectedBoard.id ? newBoard : b)
        } else {
            newBoard = { ...board, id: createUUID(), description: boardDescription }
            console.log("NEW BOARD ", newBoard)
            newAavailableBoards = [...availableBoards, newBoard]
        }
        enqueueSnackbar(`Board saved!`, { variant: 'success', anchorOrigin: { vertical: "top", horizontal: "right" } });
        console.log("BOARDS", newAavailableBoards)
        wsClient.issueKeySet("boards", JSON.stringify(newAavailableBoards.map(b => Board2JSON(b))))
        setConfirmDialog(0)
        setBoard(newBoard)
        setSelectedBoard(newBoard)
        setAvailableBoards(newAavailableBoards)
    }

    const confirmSave = () => {
        if (!selectedBoard) {
            onSaveBoard()
        } else {
            setConfirmDialog(1)
        }
    }

    const onAutocompleteChange = (e: any, v: Board | string | null) => {
        if (typeof v === "string") {
            setSelectedBoard(null)
            board.name = v;
            setBoard(board)
        } else if (v) {
            setSelectedBoard(v)
            if (v && v.description) {
                setBoardDescription(v.description)
            }
        }

    }

    const confirmDict: ConfirmDictType = {
        0: {
            title: "",
            text: <></>,
            confirm: () => { },
            confirmText: ""
        },
        1: {
            title: "Overwrite existing composition?",
            text: (
                <DialogContentText id="alert-dialog-slide-description">
                    If you confirm <b>{selectedBoard?.name}</b> will be overridden with the current board.
                </DialogContentText>
            ),
            confirm: onSaveBoard,
            confirmText: "Save"
        },
        2: {
            title: "Delete composition?",
            text: (
                <DialogContentText id="alert-dialog-slide-description">
                    If you confirm <b>{selectedBoard?.name}</b> will be deleted.
                </DialogContentText>
            ),
            confirm: () => {
                setAvailableBoards(availableBoards.filter(b => b.id !== selectedBoard?.id))
                enqueueSnackbar(`Deleted board: ${selectedBoard?.name}!`, { variant: 'success', anchorOrigin: { vertical: "top", horizontal: "right" } });
                setConfirmDialog(0)
            },
            confirmText: "Delete"
        },
        3: {
            title: "Load composition?",
            text: (
                <DialogContentText id="alert-dialog-slide-description">
                    If you confirm <b>{selectedBoard?.name}</b> will be loaded.
                </DialogContentText>
            ),
            confirm: () => {
                if (selectedBoard) {
                    setBoard(selectedBoard)
                    enqueueSnackbar(`Loaded board: ${selectedBoard?.name}!`, { variant: 'success', anchorOrigin: { vertical: "top", horizontal: "right" } });
                    setConfirmDialog(0)
                }
            },
            confirmText: "Load"
        }
    }

    return (<Box sx={{
        paddingTop: "10px",
        width: "100%",
    }}>
        <Dialog
            open={confirmDialog > 0}
            TransitionComponent={ModalTransition}
            keepMounted
            onClose={() => setConfirmDialog(0)}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>{confirmDict[confirmDialog].title}</DialogTitle>
            <DialogContent>
                {confirmDict[confirmDialog].text}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" style={{ color: "#d4d4d4", borderColor: "#d4d4d4" }} onClick={() => setConfirmDialog(0)}>Abort</Button>
                <Button variant="contained" onClick={confirmDict[confirmDialog].confirm}>{confirmDict[confirmDialog].confirmText}</Button>
            </DialogActions>
        </Dialog>
        <Autocomplete
            sx={{
                paddingTop: "10px",
            }}
            fullWidth
            disablePortal
            // size="small"
            value={selectedBoard}
            onChange={(e, v) => {
                onAutocompleteChange(e, v)
            }}
            id="combo-box-demo"
            freeSolo={true}
            options={availableBoards}
            getOptionLabel={(option) => typeof option === "string" ? option : (option.name ?? "")}
            renderOption={(props, option) => <Typography {...props} variant="body1">{option.name}<small> {option.description}</small></Typography>}
            renderInput={(params) => <TextField {...params} variant="standard" label="Board" />}
        />
        <TextField
            sx={{
                paddingTop: "10px",
            }}
            value={boardDescription}
            onChange={(e) => setBoardDescription(e.target.value)}
            id="standard-basic"
            label="Description"
            variant="standard"
            fullWidth
        />

        <Grid container columnSpacing={2} sx={{
            paddingTop: "10px",
        }}>
            <Grid item xs={4}>
                <Button variant="contained" color="success" fullWidth onClick={() => confirmSave()}>Save</Button>
            </Grid>
            <Grid item xs={4}>
                <Button variant="contained" fullWidth disabled={!selectedBoard} onClick={() => setConfirmDialog(3)}>Load</Button>
            </Grid>
            <Grid item xs={4}>
                <Button fullWidth color="error" variant="contained" onClick={() => { setConfirmDialog(2) }} disabled={!selectedBoard}>Delete</Button>
            </Grid>
        </Grid>
    </Box>)
}