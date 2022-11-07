import { Button, Card, CardActions, CardContent, CardHeader, CssBaseline, Typography } from "@mui/material"
import { ThemeProvider } from "@mui/system"
import { SnackbarProvider } from "notistack"
import { StageViewer } from "./components/StageViewer"
import { Header } from "./components/System/Header"
import { DesignerPage } from "./pages/DesignerPage"
import { Theme } from "./system/Theme"

export const App = () => {
    return (
        <div>
            <SnackbarProvider anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
            }} maxSnack={10}>
                <ThemeProvider theme={Theme}>
                    <CssBaseline />
                    <DesignerPage />
                </ThemeProvider>
            </SnackbarProvider>

        </div>
    )
}