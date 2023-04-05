import { dmxnet, receiver } from "dmxnet";
import { WebSocketClient } from "../WebsocketClient";
import { channelToEffekt } from "../types/Effekts";

const channelWidthPerFixture = 14;

export class LightCoreFixture {

    private lastChannels: number[] = [];
    private wsClient: WebSocketClient;
    private lastFreqRange = [0, 64]
    constructor(
        public readonly lcID: number,
        public readonly artnetAddress: number,
        // public readonly artnetUniverse: number,
        public readonly stripLength: number,
        wsClient: WebSocketClient
    ) {
        this.wsClient = wsClient;
        this.lastChannels = new Array(channelWidthPerFixture).fill(0);
    }

    public onDmxData = (data: number[]) => {
        const myChannels = data.slice(this.artnetAddress - 1, this.artnetAddress - 1 + channelWidthPerFixture);
        // console.log(this.artnetAddress)
        // get all changed channels
        const changedChannels = new Map<number, number>();
        for (let i = 0; i < myChannels.length; i++) {
            if (myChannels[i] !== this.lastChannels[i]) {
                changedChannels.set(i, myChannels[i]);
            }
        }
        if (changedChannels.size === 0) return;
        this.lastChannels = myChannels;
        console.log(`#${this.lcID} Channels changed: `, changedChannels);
        this.updateLC(changedChannels);
    }

    private updateColorPalette = () => {
        const paletteArray = []
        for (let i = 1; i <= 9; i = i + 3) {
            paletteArray.push([this.lastChannels[i], this.lastChannels[i + 1], this.lastChannels[i + 2]])
        }
        // console.log("Palette: ", paletteArray);
        this.wsClient.setColorPaletteRaw(paletteArray);
    }

    private switchEffekt = (dmxValue: number) => {
        if (dmxValue <= 240) {
            this.wsClient.lightRandomSetEnabledSpecific(this.lcID, false);
            const effekt = channelToEffekt[dmxValue];
            if (effekt === undefined) {
                // console.warn(`Effekt ${dmxValue} not found!`);
                return;
            }
            this.wsClient.lightSetEffekt(effekt, this.lcID, this.lastFreqRange, {}, 1);
            // console.log("Random disabled")
        } else {
            this.wsClient.lightRandomSetEnabledSpecific(this.lcID, true);
            // console.log("Random enabled")
        }
    }

    private switchFrequencyRange = (dmxValue: number) => {
        let range = []
        switch (dmxValue) {
            case 0:
                range = [0, 11] // low
                break;
            case 1:
                range = [12, 39] // mid
                break;
            case 2:
                range = [40, 64] // high
                break;
            default:
                range = [0, 64] // all
                break;
        }
        this.lastFreqRange = range;
        this.wsClient.changeStripFrequencyRange(this.lcID, range);
    }


    private updateLC = (changedChannels: Map<number, number>) => {
        let shouldColorUpdate = false;
        changedChannels.forEach((value, key) => {
            // console.log(`${this.lcID} - Updating Channel: `, key, " with value: ", value)
            switch (key) {
                case 0: // dimmer
                    this.wsClient.setStripBrightness(this.lcID, value);
                    break;
                case 1: // red
                case 2: // green
                case 3: // blue
                case 4: // red-2
                case 5: // green-2
                case 6: // blue-2
                case 7: // red-3
                case 8: // green-3
                case 9: // blue-3
                    shouldColorUpdate = true;
                    break;
                case 10: // effekt
                    this.switchEffekt(value);
                    break;
                case 11: // speed
                    this.wsClient.setStripSpeed(this.lcID, value);
                case 12: //intensity
                    this.wsClient.setStripIntensity(this.lcID, value);
                    break;
                case 13: // frequencyRange
                    this.switchFrequencyRange(value);
                    break;
                default:
                    console.warn("No channel mapping found for key: ", key);
                    break;
            }
        })
        if (shouldColorUpdate) {
            // console.log("Updating color palette")
            this.updateColorPalette();
        }

    }


}