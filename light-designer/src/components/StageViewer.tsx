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
    console.log("Rendering strips");
    return (
        <div style={{
            position: "relative",
        }}>
            {strips.map((strip, stripIndex) => {
                const ledSize = {
                    width: strip.getPhysicalLedSize(),
                    height: strip.getPhysicalLedSize()
                }
                const angle = strip.getStripAngleExact;
                const offset = strip.offset;
                return (
                    <div key={stripIndex}>
                        {strip.getPhysicalPositions().map((ledPosition, index) => {
                            const pixelID = `${strip.lcid}-${index + offset}`;
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
                                    // onDragStart={(e) => {
                                    //     console.log("START", e);
                                    // }}
                                    // onDragEnd={(e) => {
                                    //     console.log("END", e);
                                    // }}
                                    // onDrag={(e) => {
                                    //     // move the strip
                                    //     // console.log(ledPosition.x - e.pageX, ledPosition.y - e.pageY);
                                    //     console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                                    //     const newStrips = [...strips];
                                    //     const newStrip = newStrips[stripIndex];
                                    //     newStrip.move(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                                    //     newStrips[stripIndex] = newStrip;
                                    //     strips = newStrips;
                                    //     setStrips(newStrips);
                                    // }}
                                    // draggable
                                    onClick={() => {
                                        if (onStripClick) {
                                            onStripClick(stripIndex, index);
                                        }
                                    }}></div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}
