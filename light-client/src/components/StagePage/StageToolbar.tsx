import { AppBar, Button, Divider, FormControlLabel, FormGroup, Grid, IconButton, MenuItem, Pagination, Paper, Popover, Select, Switch, Tab, Tabs, Toolbar, Typography } from "@mui/material"
import { Box } from "@mui/system"
// import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
// import StreamIcon from '@mui/icons-material/Stream';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import TuneIcon from '@mui/icons-material/Tune';
import React from "react";
import { Board } from "../../types/Board";
import PianoIcon from '@mui/icons-material/Piano';
import { getEffektSetMode, getHoldToActivate, setEffektSetMode, setHoldToActivate, setOptionKey } from "../../system/JamboardCrossHandler";
import { TouchButton } from "./Jamboard/TouchButton";
import { QuickSaveButton } from "../General/QuickSaveButton";
import { BeatBars } from "../General/BeatBars";
export type StageToolbarProps = {
    setActiveRoute: React.Dispatch<React.SetStateAction<string>>;
    availableBoards: Array<Board>;
    setActiveBoard: React.Dispatch<React.SetStateAction<Board>>;
    activeBoard: Board;
    setActiveWidget: React.Dispatch<React.SetStateAction<string | undefined>>;
    activeWidget: string | undefined;
    subRoute: string;
    setSubRoute: React.Dispatch<React.SetStateAction<string>>;
    activeJamBoardIndex: number;
    setActiveJamBoardIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const StageToolbar = ({ setSubRoute, subRoute, activeWidget, setActiveWidget, setActiveRoute, activeBoard, availableBoards, setActiveBoard, activeJamBoardIndex, setActiveJamBoardIndex }: StageToolbarProps) => {

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

            <Grid container sx={{
                paddingRight: 2
            }}>
                <Grid item xs>
                    <Toolbar style={{ paddingLeft: "0px", paddingRight: "0px" }}>
                        <Tabs onChange={(e, value) => changeWidget(value)}>
                            <Tab sx={{ paddingLeft: "8px", paddingRight: "8px", minWidth: "60px" }} value={"randomizer"} icon={<ShuffleIcon style={{ color: "rgba(255, 255, 255, 0.7)" }} />} aria-label="effekts" />
                            <Tab sx={{ paddingLeft: "8px", paddingRight: "8px", minWidth: "60px" }} value={"system"} icon={<PermDataSettingIcon style={{ color: "rgba(255, 255, 255, 0.7)" }} />} aria-label="effekts" />
                        </Tabs>

                        {subRoute === "grid" && <>
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

                            {/* <Divi /> */}
                        </>}
                        {subRoute === "jam" && <>
                            <Divi />
                            <FormGroup>
                                <FormControlLabel control={<Switch defaultChecked={getEffektSetMode() === "ADD"} onChange={(e) => setEffektSetMode(e.target.checked ? "ADD" : "SET")} />} label="Additive Mode" />
                            </FormGroup>
                            <FormGroup>
                                <FormControlLabel control={<Switch defaultChecked={getHoldToActivate()} onChange={(e) => setHoldToActivate(e.target.checked)} />} label="Hold to activate" />
                            </FormGroup>
                            <Pagination page={activeJamBoardIndex} onChange={(e, p) => setActiveJamBoardIndex(p)} count={5} />
                            <Divi />
                            <TouchButton onInteractEnd={() => setOptionKey(false)} onInteract={() => setOptionKey(true)} fullWidth={false} color="secondary" variant="outlined" title={"OPTION"} />

                        </>}
                    </Toolbar>
                </Grid>
                <Grid item >
                    <Toolbar style={{ paddingLeft: "0px", paddingRight: "0px" }}>
                        <BeatBars />
                        <QuickSaveButton />
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
                                <Button variant="contained" fullWidth onClick={() => { setSubRoute("grid"); setAnchorEl(null); }} sx={{ marginBottom: 2 }}>Open Grid</Button>
                                <Button variant="contained" fullWidth onClick={() => { setSubRoute("jam"); setAnchorEl(null) }}>Open Jamboard</Button>
                                <Divider style={{ borderColor: "rgba(255, 255, 255, 0.12)", marginTop: "20px", marginBottom: "20px" }} />
                                <Button variant="contained" fullWidth color="warning" onClick={() => setActiveRoute("home")}>Leave stage</Button>
                            </Paper>

                        </Popover>
                        <IconButton aria-label="fullscreen" component="label" onClick={(e: any) => handleSettingsClick(e)}>
                            <TuneIcon />
                        </IconButton>
                    </Toolbar>
                </Grid>
            </Grid>


        </AppBar>
    </Box>)
}