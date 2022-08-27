import { Button, Card, CardContent, CardHeader, Grid } from "@mui/material";
import { Effekt } from "../types/Effekt";

type EffektsPanelProps = {
    availableEffekts: Array<Effekt>;
}

export const EffektsPanel = ({ availableEffekts }: EffektsPanelProps) => {
    return (<Card>
        <CardHeader title="Effekts"/>
            
        <CardContent>
            <Grid container>
                {availableEffekts.map(effekt => {
                    return (
                        <Grid item xs={6} md={4} key={effekt.effektSystemName}>
                            <Button>{effekt.name}</Button>
                        </Grid>)
                })}
            </Grid>
        </CardContent>
    </Card>)
}