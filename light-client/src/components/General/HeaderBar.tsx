import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import { Tab, Tabs } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

type HeaderBarProps = {
    changeTab: (key: string) => void;
}

export default function HeaderBar({changeTab}: HeaderBarProps) {
    const [selectedPath, setSelectedPath] = React.useState("");
    // const navigate = useNavigate();
    const navigateTo = (path: string) => {
        console.log(path)
        setSelectedPath(path);
        changeTab(path);
    }

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }}>
                    <Tabs
                        value={selectedPath}
                        onChange={(e,value) => navigateTo(value)}
                        aria-label="icon tabs example">
                        <Tab value={"quick"} icon={<SpeedIcon />} aria-label="quick" />
                        <Tab value={"effekts"} icon={<TipsAndUpdatesIcon />} aria-label="effekts" />
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
                </AppBar>
            </Box>
        </>

    );
}
