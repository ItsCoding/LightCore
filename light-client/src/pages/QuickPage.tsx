import { Grid } from "@mui/material"
import { QuickRandomControlls } from "../components/QuickPage/QuickRandomControlls"
import { QuickSystemControlls } from "../components/QuickPage/QuickSystemControlls"
import { LightCoreConfig } from "../types/LightCoreConfig"


type QuickPageProps = {
    randomEnabled: boolean,
    randomSpecific: { [key: number]: boolean },
    lightConfig: LightCoreConfig,
    setRandomEnabled: (enabled: boolean) => void,
    setRandomSpecific: (specific: { [key: number]: boolean }) => void,
    setLCConfig: (config: LightCoreConfig) => void,
}

export const QuickPage = ({ randomEnabled, randomSpecific, lightConfig, setRandomEnabled, setRandomSpecific, setLCConfig }: QuickPageProps) => {
    return (<>
        <Grid container spacing={2} rowSpacing={2} columnSpacing={2}>
            <Grid item xs={12} md={6}>
                <QuickSystemControlls
                    lightConfig={lightConfig}
                    setLCConfig={setLCConfig}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <QuickRandomControlls
                    randomEnabled={randomEnabled}
                    randomSpecific={randomSpecific}
                    lightConfig={lightConfig}
                    setRandomEnabled={setRandomEnabled}
                    setRandomSpecific={setRandomSpecific}
                    setLCConfig={setLCConfig}
                />
            </Grid>
        </Grid>
    </>)
}