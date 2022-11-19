import { Button, FormControlLabel, FormGroup, Grid, Switch } from "@mui/material";
import { WebSocketClient } from "../../system/WebsocketClient";

export const RandomTypeBtns = () => {
    const wsClient = WebSocketClient.getInstance();

    return (<>
        <Grid container rowSpacing={2}>
            <Grid item xs={12}>
                <Button variant="contained" fullWidth onClick={() => wsClient.makeRandomCompByType("chilled")}>Chilled</Button>
            </Grid>
            <Grid item xs={12}>
                <Button variant="contained" fullWidth onClick={() => wsClient.makeRandomCompByType("chilleddrop")}>Chilled drop</Button>
            </Grid>
            <Grid item xs={12}>
                <Button variant="contained" fullWidth onClick={() => wsClient.makeRandomCompByType("beatsdrop")}>Beats drop</Button>
            </Grid>
            <Grid item xs={12}>
                <Button variant="contained" fullWidth onClick={() => wsClient.makeRandomCompByType("beats")}>Beats</Button>
            </Grid>
            <Grid item xs={12}>
                <FormGroup>
                    <FormControlLabel control={<Switch defaultChecked onChange={(e) => {
                        wsClient.send("light.random.useLastType", e.target.checked);
                    }} />} label="Randomizer uses last type" />
                </FormGroup>
            </Grid>
        </Grid>
    </>)
}