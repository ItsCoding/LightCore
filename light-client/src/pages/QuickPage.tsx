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

export const QuickPage = ({ randomEnabled, randomSpecific,lightConfig, setRandomEnabled, setRandomSpecific,setLCConfig }: QuickPageProps) => {
    return (<>
        <QuickRandomControlls
            randomEnabled={randomEnabled}
            randomSpecific={randomSpecific}
            lightConfig={lightConfig}
            setRandomEnabled={setRandomEnabled}
            setRandomSpecific={setRandomSpecific}
            setLCConfig={setLCConfig}
        />
        <div style={{
            paddingTop: "20px"
        }}>
            <QuickSystemControlls
                lightConfig={lightConfig}
                setLCConfig={setLCConfig}
            />
        </div>
    </>)
}