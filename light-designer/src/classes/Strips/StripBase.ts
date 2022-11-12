import { Point } from "../Point";

export class StripBase {
    public stripIP: string;
    public stripMac: string;
    public stripSymbol: string;
    public stripControllerStart?: number;
    public stripCotrollerEnd?: number;
    public computingGroup: number;

    public getExportConfig() {
        return {
            stripIP: this.stripIP,
            stripMac: this.stripMac,
            stripSymbol: this.stripSymbol,
            stripControllerStart: this.stripControllerStart,
            stripCotrollerEnd: this.stripCotrollerEnd,
            computingGroup: this.computingGroup
        };
    }
}