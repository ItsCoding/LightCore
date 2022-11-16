import { Divider, Paper, Typography } from "@mui/material"

export const PipelineSettings = () => {
    return (
        <div style={{
            marginTop: 10,
        }}>
            <Paper sx={{ 
                width: "100%",
                height: "100%",
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingBottom: "20px"
            }}>
                <Typography variant="h6">
                    Pipeline Settings
                </Typography>
                <Divider />
            </Paper>
        </div>
    )
}