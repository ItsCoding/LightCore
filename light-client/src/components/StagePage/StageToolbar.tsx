import { AppBar, Autocomplete, Button, Divider, IconButton, MenuItem, Paper, Popover, Select, Tab, Tabs, TextField, Toolbar, Typography } from "@mui/material"
import { Box } from "@mui/system"
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import StreamIcon from '@mui/icons-material/Stream';
import TuneIcon from '@mui/icons-material/Tune';
import React from "react";
import { Board } from "../../types/Board";

export type StageToolbarProps = {
    setActiveRoute: React.Dispatch<React.SetStateAction<string>>;
    availableBoards: Array<Board>;
    setActiveBoard: React.Dispatch<React.SetStateAction<Board>>;
    activeBoard: Board;
}

export const StageToolbar = ({ setActiveRoute, activeBoard, availableBoards, setActiveBoard }: StageToolbarProps) => {

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const Divi = () => <Divider orientation="vertical" variant="middle" sx={{ borderColor: "#7C7C7C", marginLeft: "20px",marginRight: "20px", }} flexItem />

    return (<Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }}>
            <Toolbar>

                <Tabs
                    // centered

                    aria-label="icon tabs example">
                    <Tab value={"effekts"} icon={<TipsAndUpdatesIcon />} aria-label="effekts" />
                    <Tab value={"stage"} icon={<StreamIcon />} aria-label="stage" />
                    {/* <Tab value={"colors"} icon={<ColorLensIcon />} aria-label="colors" /> */}
                    {/* <Tab icon={<PersonPinIcon />} aria-label="person" /> */}
                </Tabs>
                <Divi />
                <Select
                    sx={{
                        // paddingTop: "10px",
                        width: "20vw"
                    }}
                    // disablePortal
                    // clearIcon={null}
                    size="small"
                    value={activeBoard.id}
                    variant="standard"
                    onChange={(e, v) => {
                        const boardID = e.target.value as string;
                        const lookupBoard = availableBoards.find(b => b.id === boardID);
                        if (lookupBoard) { setActiveBoard(lookupBoard) } else { setActiveBoard({ elements: {} }) }
                    }}
                    id="combo-box-demo"

                // options={availableBoards}
                // getOptionLabel={(option) => typeof option === "string" ? option : (option.name ?? "")}
                // renderOption={(props, option) => }
                // renderInput={(params) => <TextField {...params} variant="standard" label="Board" />}
                >
                    {availableBoards.map(board => (
                        <MenuItem value={board.id}>
                            <Typography variant="body1">{board.name}<small> {board.description}</small></Typography>
                        </MenuItem>
                    ))}
                </Select>
                <Divi />
                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <Paper variant="outlined" sx={{
                        width: "300px",
                        padding: "10px"
                    }}>
                        <Button variant="contained" fullWidth color="warning" onClick={() => setActiveRoute("home")}>Leave stage</Button>
                    </Paper>

                </Popover>
                <IconButton aria-label="fullscreen" component="label" onClick={(e: any) => handleSettingsClick(e)}>
                    <TuneIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    </Box>)
}