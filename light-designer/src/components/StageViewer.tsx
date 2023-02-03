import { Strip } from "../classes/Strips/Strip";

export type StageViewerProps = {
    strips: Strip[];
    onStripClick?: (index: number, ledIndex: number) => void;
    selectedStrip?: number;
    globalScaling?: number;
    setStrips?: (strips: Strip[]) => void;
}

export const StageViewer = ({ strips, onStripClick, selectedStrip, globalScaling, setStrips }: StageViewerProps) => {

    //Render the strips and make a div for each pixel

    const isLCIDUnique = (lcid: string) => {
        const stripsWithLCID = strips.filter(strip => strip.lcid === lcid);
        // console.log("Strip with LCID: ", stripsWithLCID, "isUnique:", stripsWithLCID.length === 1)
        return stripsWithLCID.length === 1;
    }

    let smallestDensity = Number.MAX_VALUE;
    let largestDensity = 0;
    strips.forEach(strip => {
        const density = strip.ledCount / (strip.getPhysicalLength / 100)
        if (smallestDensity > density) {
            smallestDensity = density;
        }
        if (largestDensity < density) {
            largestDensity = density;
        }
    })



    return (
        <div style={{
            position: "relative",
        }}>
            {strips.map((strip, stripIndex) => {
                const ledSize = {
                    width: strip.getExportSize(smallestDensity),
                    height: strip.getExportSize(smallestDensity)
                }
                const angle = strip.getStripAngleExact;
                const offset = strip.offset;
                return (
                    <div key={stripIndex}>
                        {strip.getExportLEDs(smallestDensity).map((vPixel, index) => {
                            return vPixel.map((ledPosition) => {
                                const pixelID = `${strip.lcid}-${index + (isLCIDUnique(strip.lcid) ? 0 : offset)}`;
                                return (
                                    <div key={pixelID} id={pixelID}
                                        style={{
                                            position: "absolute",
                                            top: ledPosition.y,
                                            left: ledPosition.x,
                                            width: ledSize.width,
                                            height: ledSize.height,
                                            backgroundColor: "red",
                                            transform: `rotate(${angle}deg)`,
                                            ...(globalScaling >= 1 && selectedStrip === stripIndex && {
                                                borderWidth: 1,
                                                borderStyle: "solid",
                                                borderColor: selectedStrip === stripIndex ? "rgba(9, 13, 220, 0.52)" : "black",
                                            }),
                                            zIndex: strip.zIndex
                                        }}
                                        onClick={() => {
                                            if (onStripClick) {
                                                onStripClick(stripIndex, index);
                                            }
                                        }}></div>
                                )
                            })
                        })}
                    </div>
                )
            })}
        </div>
    )
}
