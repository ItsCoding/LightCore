import { Point } from "../Point";
import { TransportProtocol } from "../TransportProtocol";

export class StripBase {
    public stripIP: string;
    public stripMac: string;
    public stripSymbol: string;
    public stripControllerStart?: number;
    public stripControllerEnd?: number;
    public computingGroup: number;
    public frameDivider: number;
    public mirrorGroup: number;
    public stripInverted: boolean;
    public ledType: "WS2811" | "WS2813"
    public uiMarks: number;
    public transportProtocol = TransportProtocol.LCP;
    public artnetAddress: number;
    // public artnetUniverse: number;

    public getExportConfig() {
        return {
            stripIP: this.stripIP,
            stripMac: this.stripMac,
            stripSymbol: this.stripSymbol,
            stripControllerStart: this.stripControllerStart,
            stripCotrollerEnd: this.stripControllerEnd,
            computingGroup: this.computingGroup,
            frameDivider: this.frameDivider,
            mirrorGroup: this.mirrorGroup,
            ledType: this.ledType,
            stripInverted: this.stripInverted,
            uiMarks: this.uiMarks,
            transportProtocol: this.transportProtocol,
            artnet: {
                address: this.artnetAddress,
                // universe: this.artnetUniverse
            }
        };
    }
}