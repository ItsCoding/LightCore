import { AppBar, Button, Divider, IconButton, MenuItem, Paper, Popover, Select, Tab, Tabs, Toolbar, Typography } from "@mui/material"
import { Box } from "@mui/system"
// import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
// import StreamIcon from '@mui/icons-material/Stream';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import TuneIcon from '@mui/icons-material/Tune';
import React from "react";
import { Board } from "../../types/Board";
export type StageToolbarProps = {
    setActiveRoute: React.Dispatch<React.SetStateAction<string>>;
    availableBoards: Array<Board>;
    setActiveBoard: React.Dispatch<React.SetStateAction<Board>>;
    activeBoard: Board;
    setActiveWidget: React.Dispatch<React.SetStateAction<string | undefined>>;
    activeWidget: string | undefined;
}

export const StageToolbar = ({ activeWidget, setActiveWidget, setActiveRoute, activeBoard, availableBoards, setActiveBoard }: StageToolbarProps) => {

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const changeWidget = (widget: string) => {
        if (activeWidget === widget) {
            setActiveWidget(undefined);
        } else {
            setActiveWidget(widget);
        }
    }

    const Divi = () => <Divider orientation="vertical" variant="middle" sx={{ borderColor: "#7C7C7C", marginLeft: "20px", marginRight: "20px", }} flexItem />

    return (<Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }}>
            <Toolbar style={{ paddingLeft: "0px", paddingRight: "0px" }}>
                <Tabs onChange={(e, value) => changeWidget(value)}>
                    <Tab sx={{ paddingLeft: "8px", paddingRight: "8px", minWidth: "60px" }} value={"randomizer"} icon={<ShuffleIcon style={{ color: "rgba(255, 255, 255, 0.7)" }} />} aria-label="effekts" />
                    <Tab sx={{ paddingLeft: "8px", paddingRight: "8px", minWidth: "60px" }} value={"system"} icon={<PermDataSettingIcon style={{ color: "rgba(255, 255, 255, 0.7)" }} />} aria-label="effekts" />
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