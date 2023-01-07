import { Grid } from "@mui/material"
import { ColorCalibration } from "../components/QuickPage/ColorCalibration"
import { QuickRandomControlls } from "../components/QuickPage/QuickRandomControlls"
import { QuickSystemControlls } from "../components/QuickPage/QuickSystemControlls"
import { RandomizerBlacklist } from "../components/QuickPage/RandomizerBlacklist"
import { Effekt } from "../types/Effekt"
import { LightCoreConfig } from "../types/LightCoreConfig"
import { ColorsCard } from "../components/General/ColorsCard"
import { LedStrip } from "../types/Strip"
import { Composition } from "../types/Composition"


type QuickPageProps = {
    randomEnabled: boolean,
    randomSpecific: { [key: number]: boolean },
    lightConfig: LightCoreConfig,
    setRandomEnabled: (enabled: boolean) => void,
    setRandomSpecific: (specific: { [key: number]: boolean }) => void,
    setLCConfig: (config: LightCoreConfig) => void,
    availableEffekts: Effekt[],
    strips: Array<LedStrip>;
    compositions: Array<Composition>;
}

export const QuickPage = ({ randomEnabled, randomSpecific, lightConfig, setRandomEnabled, setRandomSpecific, setLCConfig, availableEffekts, strips, compositions }: QuickPageProps) => {
    const isPhone = window.innerWidth < 800;
    return (<>
        <Grid container spacing={2} rowSpacing={2} columnSpacing={2}>
            <Grid item xs={12} md={12}>
                <QuickRandomControlls
                    compositions={compositions}
                    strips={strips}
                    randomEnabled={randomEnabled}
                    randomSpecific={randomSpecific}
                    lightConfig={lightConfig}
                    setRandomEnabled={setRandomEnabled}
                    setRandomSpecific={setRandomSpecific}
                    setLCConfig={setLCConfig}
                    key="quickRandomControlls"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <QuickSystemControlls
                    strips={strips}
                    lightConfig={lightConfig}
                    setLCConfig={setLCConfig}
                    key="system"
                />
            </Grid>
            {!isPhone && <>

                <Grid item xs={12} md={6}>
                    <ColorCalibration
                        lightConfig={lightConfig}
                        setLCConfig={setLCConfig}
                        key="colorCalibration"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <RandomizerBlacklist
                        strips={strips}
                        availableEffekts={availableEffekts}
                        lightConfig={lightConfig}
                        setLCConfig={setLCConfig}
                        key="randomizerBlacklist"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <ColorsCard key="colorsCard" />
                </Grid></>}
        </Grid>
    </>)
}