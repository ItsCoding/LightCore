import { Point } from "../Point";
import { StripBase } from "./StripBase";
import { v4 } from "uuid"
import { extend } from "lodash";
import { GeneratedStripConfig } from "../ExportConfig";
import { TransportProtocol } from "../TransportProtocol";
export class StraightStrip extends StripBase {
    private end: Point;
    public id: string;
    public offset = 0;
    constructor(public lcid: string, private start: Point, private leds: number, private physicalLength: number) {
        super();
        this.end = new Point(start.x + physicalLength, start.y);
        this.id = v4();
    }
    public smallestDensity = 30;
    public scaleFactor = 1;
    public maxStripDensity = 30;
    public stripName = "Straight Strip";
    public zIndex = 1;
    get startPoint(): Point {
        return this.start;
    }

    get endPoint(): Point {
        return this.end;
    }

    public setEndPoint(x: number, y: number) {
        this.end.x = x;
        this.end.y = y;
    }

    get ledCount(): number {
        return this.leds;
    }

    set ledCount(count: number) {
        this.leds = count;
    }

    get stripLength(): number {
        return Math.sqrt(Math.pow(this.end.x - this.start.x, 2) + Math.pow(this.end.y - this.start.y, 2));
    }

    // make a function to rotate the strip by a given angle in degrees
    public rotate(angle: number) {
        const angleRad = angle * Math.PI / 180;
        this.end.x = this.start.x + this.physicalLength * Math.cos(angleRad);
        this.end.y = this.start.y + this.physicalLength * Math.sin(angleRad);
    }

    public move(x: number, y: number) {
        this.start.x += x;
        this.start.y += y;
        this.end.x += x;
        this.end.y += y;
    }

    public setPosition(x: number, y: number) {
        const dx = x - this.start.x;
        const dy = y - this.start.y;
        this.move(dx, dy);
    }

    get getStripAngle(): number {
        //return value in degrees
        return Math.ceil(Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x) * 180 / Math.PI);
    }
    get getStripAngleExact(): number {
        //return value in degrees
        return Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x) * 180 / Math.PI;
    }

    get getPhysicalLength(): number {
        return this.physicalLength;
    }

    public setPhysicalLength(length: number) {
        this.physicalLength = length;
    }

    public getPhysicalLedSize(): number {
        return (this.physicalLength / this.leds) * this.scaleFactor;
    }

    public getPositionAt(index: number): Point[] {
        const angle = this.getStripAngle;
        const ledSize = this.maxStripDensity / (this.ledCount / (this.physicalLength / 100))
        const points: Point[] = []
        for (let i = 0; i < ledSize; i++) {
            const ledPosition = new Point(this.start.x, this.start.y);
            ledPosition.x += ((ledSize * index) + i) * Math.cos(angle * Math.PI / 180);
            ledPosition.y += ((ledSize * index) + i) * Math.sin(angle * Math.PI / 180);
            points.push(ledPosition);
        }
        return points;
    }



    // get the physical positions of the leds with a scale of 1cm = 20px
    public getPhysicalPositions(): Point[] {
        const positions: Point[] = [];
        const ledSize = this.getPhysicalLedSize();
        const angle = this.getStripAngle;
        for (let i = 0; i < this.leds; i++) {
            const x = this.start.x + (i * ledSize * Math.cos(angle * Math.PI / 180));
            const y = this.start.y + (i * ledSize * Math.sin(angle * Math.PI / 180));
            positions.push(new Point(x, y));
        }
        return positions;
    }

    public getExportSize(smallestDensity: number): number {
        return (smallestDensity / (this.ledCount / (this.physicalLength / 100)))
    }

    public getExportLEDs(smallestDensity: number): Point[][] {
        //return the position for each led in the strip, scale the density down to the smallest led size
        const positions: Point[][] = [];
        const ledSize = this.getExportSize(smallestDensity)
        const angle = this.getStripAngle;
        // console.log("LC-" + this.lcid, ledSize, smallestDensity, this.ledCount, this.physicalLength)
        for (let i = 0; i < this.leds; i++) {
            const points: Point[] = []
            const ledPosition = new Point(this.start.x * ledSize, this.start.y * ledSize);
            ledPosition.x += (((ledSize * i)) * Math.cos(angle * Math.PI / 180)) ;
            ledPosition.y += (((ledSize * i)) * Math.sin(angle * Math.PI / 180)) ;
            for (let j = 0; j < ledSize; j++) {
                positions.push([ledPosition]);
            }
            // positions.push(points);
        }
        return positions;
    }

    public getExportConfig() {
        return extend(super.getExportConfig(), {
            start: this.start,
            end: this.end,
            leds: this.leds,
            physicalLength: this.physicalLength,
            lcid: this.lcid,
            offset: this.offset,
            name: this.stripName,
        } as GeneratedStripConfig);
    }

    public toJson(): string {
        return JSON.stringify(this);
    }

    public static fromJson(json: string): StraightStrip[] {
        const parsedData = JSON.parse(json);
        const stripData = Array.isArray(parsedData) ? parsedData : [parsedData];
        const initializedStrips: StraightStrip[] = []
        stripData.forEach((obj) => {
            const nStrip = new StraightStrip(obj.lcid, new Point(obj.start.x, obj.start.y), obj.leds, obj.physicalLength);
            nStrip.offset = obj.offset;
            nStrip.id = obj.id;
            nStrip.stripName = obj.stripName;
            nStrip.setEndPoint(obj.end.x, obj.end.y);
            nStrip.stripControllerEnd = obj.stripControllerEnd;
            nStrip.stripControllerStart = obj.stripControllerStart;
            nStrip.stripIP = obj.stripIP;
            nStrip.stripMac = obj.stripMac;
            nStrip.stripSymbol = obj.stripSymbol;
            nStrip.zIndex = obj.zIndex;
            nStrip.computingGroup = obj.computingGroup;
            nStrip.mirrorGroup = obj.mirrorGroup;
            nStrip.ledType = obj.ledType;
            nStrip.uiMarks = obj.uiMarks;
            nStrip.transportProtocol = obj.transportProtocol as TransportProtocol || TransportProtocol.LCP;
            initializedStrips.push(nStrip);
        });
        return initializedStrips;
    }

    public get density(): number {
        return this.maxStripDensity / (this.ledCount / (this.physicalLength / 100));
    }


}