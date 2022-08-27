import { EffektsPanel } from "../components/EffektsPanel"
import { Effekt } from "../types/Effekt"
import { LedStrip } from "../types/Strip"

const stripConfig: LedStrip[] = [
    {
        position: "Middle",
        index: 0,
        length: 100
    }, {
        position: "Triangle",
        index: 1,
        length: 180
    }]

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