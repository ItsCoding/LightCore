import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { useNavigate } from 'react-router-dom';


export default function HeaderBar() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [title, setTitle] = React.useState("LightCore");
    const navigate = useNavigate();
    const navigateTo = (path: string, t: string) => {
        setTitle(t);
        navigate(path);
    }

    return (
        <>
            <Drawer
                anchor={'left'}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigateTo("quick","QuickControlls")}>
                            <ListItemIcon>
                                <SpeedIcon />
                            </ListItemIcon>
                            <ListItemText primary="QuickControlls" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigateTo("effekts","Effekts")}>
                            <ListItemIcon>
                                <TipsAndUpdatesIcon />
                            </ListItemIcon>
                            <ListItemText primary="Effekts" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
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
                    </Toolbar>
                </AppBar>
            </Box>
        </>

    );
}
