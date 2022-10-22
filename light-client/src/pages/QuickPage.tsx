import { Grid } from "@mui/material"
import { ColorCalibration } from "../components/QuickPage/ColorCalibration"
import { QuickRandomControlls } from "../components/QuickPage/QuickRandomControlls"
import { QuickSystemControlls } from "../components/QuickPage/QuickSystemControlls"
import { RandomizerBlacklist } from "../components/QuickPage/RandomizerBlacklist"
import { Effekt } from "../types/Effekt"
import { LightCoreConfig } from "../types/LightCoreConfig"
import { ColorsCard } from "../components/General/ColorsCard"


type QuickPageProps = {
    randomEnabled: boolean,
    randomSpecific: { [key: number]: boolean },
    lightConfig: LightCoreConfig,
    setRandomEnabled: (enabled: boolean) => void,
    setRandomSpecific: (specific: { [key: number]: boolean }) => void,
    setLCConfig: (config: LightCoreConfig) => void,
    availableEffekts: Effekt[],
}

export const QuickPage = ({ randomEnabled, randomSpecific, lightConfig, setRandomEnabled, setRandomSpecific, setLCConfig, availableEffekts }: QuickPageProps) => {
    return (<>
        <Grid container spacing={2} rowSpacing={2} columnSpacing={2}>

            <Grid item xs={12} md={12}>
                <QuickRandomControlls
                    randomEnabled={randomEnabled}
                    randomSpecific={randomSpecific}
                    lightConfig={lightConfig}
                    setRandomEnabled={setRandomEnabled}
                    setRandomSpecific={setRandomSpecific}
                    setLCConfig={setLCConfig}
                />
            </Grid>


            <Grid item xs={12} md={6}>
                <QuickSystemControlls
                    lightConfig={lightConfig}
                    setLCConfig={setLCConfig}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <ColorCalibration
                    lightConfig={lightConfig}
                    setLCConfig={setLCConfig}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <RandomizerBlacklist
                    availableEffekts={availableEffekts}
                    lightConfig={lightConfig}
                    setLCConfig={setLCConfig}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <ColorsCard />
            </Grid>
        </Grid>
    </>)
}