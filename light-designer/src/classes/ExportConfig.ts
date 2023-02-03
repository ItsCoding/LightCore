import { PointDict } from "src/components/System/Exporter";
import { Point } from "./Point";

export type GeneratedStripConfig = {
    stripIP: string;
    stripMac: string;
    stripSymbol: string;
    stripControllerStart: number;
    stripCotrollerEnd: number;
    computingGroup: number;
    start: Point;
    end: Point;
    leds: number;
    physicalLength: number;
    lcid: string;
    offset: number;
    name: string;
    [key: string]: string | number | Point;
}


export type GeneratedConfig = {
    strips: { [key: string]: GeneratedStripConfig }
    ledPositions: PointDict
    canvasSize: {
        width: number;
        height: number;
        smallestX: number;
        smallestY: number;
    }
}