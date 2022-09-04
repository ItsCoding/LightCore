import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import { Divider, FormControlLabel, FormGroup, Switch, Tab, Tabs, Toolbar } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ColorLensIcon from '@mui/icons-material/ColorLens';
type HeaderBarProps = {
    changeTab: (key: string) => void;
    setTouchCapable: (capable: boolean) => void;
}

export default function HeaderBar({ changeTab, setTouchCapable }: HeaderBarProps) {
    const [selectedPath, setSelectedPath] = React.useState("");
    // const navigate = useNavigate();
    const navigateTo = (path: string) => {
        console.log(path)
        setSelectedPath(path);
        changeTab(path);
    }

    React.useEffect(() => {
        console.log("Toggled!")
    },[window.touchToggle])

    const onTouchChanged = (state: boolean) => {
        window.touchToggle = state;
        console.log(window.touchToggle);
        setTouchCapable(state);
    }

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }}>
                    <Toolbar>
                        <Tabs
                            centered
                            value={selectedPath}
                            onChange={(e, value) => navigateTo(value)}
                            style={{
                                width: "100%"
                            }}
                            aria-label="icon tabs example">
                            <Tab value={"quick"} icon={<SpeedIcon />} aria-label="quick" />
                            <Tab value={"effekts"} icon={<TipsAndUpdatesIcon />} aria-label="effekts" />
                            {/* <Tab value={"colors"} icon={<ColorLensIcon />} aria-label="colors" /> */}
                            {/* <Tab icon={<PersonPinIcon />} aria-label="person" /> */}
                        </Tabs>
                        {/* <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={() => setDrawerOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {title}
                        </Typography>
                    </Toolbar> */}
                        <FormGroup aria-controls="menu-appbar" style={{
                            position: "absolute",
                            right: "4vh",
                            // top: "2vh"
                        }}>
                            <FormControlLabel control={<Switch defaultChecked />} label="Touch" checked={window.touchToggle ? true : false} onChange={(e,state) => onTouchChanged(state)} />
                        </FormGroup>
                    </Toolbar>

                </AppBar>
            </Box>
        </>

    );
}
