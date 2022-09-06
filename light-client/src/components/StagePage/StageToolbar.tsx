import { AppBar, IconButton, Tab, Tabs, Toolbar } from "@mui/material"
import { Box } from "@mui/system"
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import StreamIcon from '@mui/icons-material/Stream';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import React from "react";



export const StageToolbar = () => {

    // const [isFullscreen, setIsFullscreen] = React.useState(false);

    // const toggleFullScreen = () => {
    //     if (!document.fullscreenElement) {
    //         document.documentElement.requestFullscreen();
    //         setIsFullscreen(true);
    //     } else if (document.exitFullscreen) {
    //         document.exitFullscreen();
    //         setIsFullscreen(false);
    //     }
    // }

    return (<Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }}>
            <Toolbar>
                <Tabs
                    // centered
                    style={{
                        width: "100%"
                    }}
                    aria-label="icon tabs example">
                    <Tab value={"effekts"} icon={<TipsAndUpdatesIcon />} aria-label="effekts" />
                    <Tab value={"stage"} icon={<StreamIcon />} aria-label="stage" />
                    {/* <Tab value={"colors"} icon={<ColorLensIcon />} aria-label="colors" /> */}
                    {/* <Tab icon={<PersonPinIcon />} aria-label="person" /> */}
                </Tabs>
                {/* <IconButton aria-label="fullscreen" component="label" onClick={() => {
                    toggleFullScreen()
                }}>
                    {!isFullscreen ? <FullscreenIcon /> : <FullscreenExitIcon />}
                    
                </IconButton> */}
            </Toolbar>
        </AppBar>
    </Box>)
}