import { Grid, Card, CardHeader, CardContent } from "@mui/material"
import { CirclePicker, HuePicker, SketchPicker } from "react-color"

export const ColorsPage = () => {
    return (<>
        <Grid container columnSpacing={2}>
            <Grid item xs={12} md={12}>
                <Card>
                    <CardHeader title="Colors" />
                    <CardContent>
                        <HuePicker />
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={12}>
                <Card>
                    <CardHeader title="Colors" />
                    <CardContent>
                        <SketchPicker disableAlpha />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </>)
}