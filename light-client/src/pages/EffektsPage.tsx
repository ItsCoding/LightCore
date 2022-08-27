import { EffektsPanel } from "../components/EffektsPanel"
import { strips } from "../system/StripConfig"
import { Effekt } from "../types/Effekt"
import { LedStrip } from "../types/Strip"

const stripConfig = strips

type EffektsPageProps = {
    availableEffekts: Array<Effekt>,
}

export const EffektsPage = ({availableEffekts}: EffektsPageProps) => {
    return (
        <div>
            {stripConfig.map(strip => {
                return <EffektsPanel key={strip.index} availableEffekts={availableEffekts} strip={strip} />
            })}
        </div>
    )
}