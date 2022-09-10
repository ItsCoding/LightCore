import { useEffect, useRef } from "react"
import { WebSocketClient } from "../../system/WebsocketClient"
import { ReturnType } from "../../types/TopicReturnType"


type FrameDict = { [key: number]: Array<Array<number>> }

export const PreviewCanvas = () => {
    const wsClient = WebSocketClient.getInstance()
    const imageRef = useRef<HTMLImageElement>(null)
    useEffect(() => {
        const handlerID = wsClient.addEventHandler(ReturnType.PREVIEW.FRAME_DICT, (topic) => {
            const frameDict: FrameDict = topic.message;
            const realDict: FrameDict = {}
            Object.keys(frameDict).forEach((key) => {
                const realIndex = (parseInt(key) * -1) - 5;
                realDict[realIndex] = frameDict[parseInt(key)];
            });
            drawFrame(realDict);
        })
        return () => {
            wsClient.removeEventHandler(handlerID)
        }
    })

    const drawTopLED = (frameDict: FrameDict, stripIndex: number, from: number, to: number, ctx: CanvasRenderingContext2D) => {
        const y = 0;
        for (let x = from; x < to; x++) {

            if (ctx) {
                const r = frameDict[stripIndex][0][x] ?? 255;
                const g = frameDict[stripIndex][1][x] ?? 255;
                const b = frameDict[stripIndex][2][x] ?? 255;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x - 120, y, 1, 1);
            }

        }
    }

    const drawLeftTriangleLED = (frameDict: FrameDict, stripIndex: number, from: number, to: number, ctx: CanvasRenderingContext2D) => {
        for (let x = from; x < to; x++) {
            const yPos = (x * 1 * 86 / 100);
            const xPos = (x * 1 * 50 / 100) + 60;

            if (ctx) {
                const r = frameDict[stripIndex][0][to - 1 - x] ?? 255;
                const g = frameDict[stripIndex][1][to - 1 - x] ?? 255;
                const b = frameDict[stripIndex][2][to - 1 - x] ?? 255;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(xPos, yPos, 1, 1);
            }
        }

    }

    const drawRightTriangleLED = (frameDict: FrameDict, stripIndex: number, from: number, to: number, ctx: CanvasRenderingContext2D) => {
        for (let x = from; x < to; x++) {
            const yPos = (x * 1 * 86 / 100) - 310;
            const xPos = 240 - (x * 1 * 50 / 100) + 180;

            if (ctx) {
                const r = frameDict[stripIndex][0][x] ?? 255;
                const g = frameDict[stripIndex][1][x] ?? 255;
                const b = frameDict[stripIndex][2][x] ?? 255;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(xPos, yPos, 1, 1);
                // if(x === 400)  console.log(xPos,yPos)
            }

        }
    }

    const drawMiddleLED = (frameDict: FrameDict, stripIndex: number, from: number, to: number, ctx: CanvasRenderingContext2D) => {
        const y = (60 * 86 / 100);
        for (let x = from; x < to; x++) {
            if (ctx) {
                const r = frameDict[stripIndex][0][x] ?? 255;
                const g = frameDict[stripIndex][1][x] ?? 255;
                const b = frameDict[stripIndex][2][x] ?? 255;
                // console.log(r,g,b)
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                // const color = `rgb(255,255,255)`;
                // ctx.fillStyle = color;
                // console.log(y)
                ctx.fillRect(x, y, 1, 1);
            }

        }
    }


    const drawFrame = (frameDict: FrameDict) => {
        // console.log(frameDict)
        const canvas = document.createElement('canvas');
        // canvas.width = 500;
        // canvas.height = 500;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.canvas.width = 300;
            ctx.canvas.height = 160;
        }
        if (1 in frameDict && ctx) {
            // console.log("Drawing frame 1");
            drawTopLED(frameDict, 1, 180, 360, ctx);
            drawLeftTriangleLED(frameDict, 1, 0, 180, ctx);
            drawRightTriangleLED(frameDict, 1, 360, 540, ctx);
        }
        if (0 in frameDict && ctx) {
            // console.log("Drawing frame 0");
            drawMiddleLED(frameDict, 0, 0, 300, ctx);
        }
        const imgBox = imageRef.current;
        if (imgBox) {
            imgBox.setAttribute("src",canvas.toDataURL())
        }
    }

    return (
        <img ref={imageRef} style={{
            objectFit: "contain",
            width: "100%"
        }} alt="Preview" />
    )

}