import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/system"
import { SnackbarProvider } from "notistack"
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