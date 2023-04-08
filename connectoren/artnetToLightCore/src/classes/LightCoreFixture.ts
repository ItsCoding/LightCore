import { dmxnet, receiver } from "dmxnet";
import { WebSocketClient } from "../WebsocketClient";
import { channelToEffekt } from "../types/Effekts";
import config from "../../config.json"
import { ServerTopic } from "../../../../light-client/src/types/ServerTopic";
import { randomUUID } from "crypto";
const channelWidthPerFixture = 14;

export type ActiveEffekt = {
    instanceUUID: string,
    effekt: string,
    channel: "A" | "B",
    confirmed: boolean
}

export class LightCoreFixture {

    private lastChannels: number[] = [];
    private wsClient: WebSocketClient;
    private lastFreqRange = [0, 64]
    private activeEffekts: ActiveEffekt[] = [];
    private randomizerOnByColor = false;
    constructor(
        public readonly lcID: number,
        public readonly artnetAddress: number,
        // public readonly artnetUniverse: number,
        public readonly stripLength: number,
        wsClient: WebSocketClient
    ) {
        this.wsClient = wsClient;
        this.wsClient.addEventHandler("return.data.activeEffekts", this.onEffektChange);
        this.lastChannels = new Array(channelWidthPerFixture).fill(0);
    }

    public onEffektChange = (data: ServerTopic) => {
        const parsedData = []
        data.message.forEach((serverEffekt: any) => {
            if (serverEffekt.stripIndex !== this.lcID) return;
            parsedData.push({
                instanceUUID: serverEffekt.id,
                effekt: serverEffekt.effektSystemName
            })
        })
        this.activeEffekts = this.activeEffekts.filter((effekt) => {
            if(!effekt.confirmed) return true;
            return parsedData.find((parsedEffekt) => {
                return parsedEffekt.instanceUUID === effekt.instanceUUID
            })
        })

        this.activeEffekts.forEach((effekt) => {
            if (!effekt.confirmed) {
                const found = parsedData.find((parsedEffekt) => {
                    return parsedEffekt.instanceUUID === effekt.instanceUUID
                })
                if (found) {
                    // console.log("Found effekt", found.instanceUUID, found.effekt)
                    effekt.confirmed = true;
                }
            }
        })

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
        // console.log(`#${this.lcID} Channels changed: `, changedChannels);
        this.updateLC(changedChannels);
    }

    private updateColorPalette = () => {
        const paletteArray = []
        for (let i = 1; i <= 9; i = i + 3) {
            paletteArray.push([this.lastChannels[i], this.lastChannels[i + 1], this.lastChannels[i + 2]])
        }
        if (config.onlyUseFirstStripForColor) {
            if (this.lcID !== 0) return;
            this.wsClient.setColorPaletteRaw(paletteArray);
        } else {
            this.wsClient.setStripColorPalette(this.lcID, paletteArray);
        }
        // console.log("Palette: ", paletteArray);

    }

    private removeEffekt = (instanceUUID: string | undefined) => {
        if (!instanceUUID) return;
        this.wsClient.lightRemoveEffekt(instanceUUID);
        this.activeEffekts = this.activeEffekts.filter((effekt) => {
            return effekt.instanceUUID !== instanceUUID
        })
    }

    private commitEffekt = async (inRandomizerMode: boolean) => {
        const channelAEffekt = channelToEffekt[this.lastChannels[10]];
        const channelBEffekt = channelToEffekt[this.lastChannels[11]];

        if ((channelAEffekt === undefined && !inRandomizerMode) || channelBEffekt === undefined) {
            console.warn(`Effekt ${this.lastChannels[10]},${this.lastChannels[11]} not found!`);
            return;
        }


        const isAActive = this.activeEffekts.find((effekt) => {
            // console.log("Check",effekt.effekt, channelAEffekt)
            return effekt.channel === "A"
        })

        const isBActive = this.activeEffekts.find((effekt) => {
            return effekt.channel === "B"
        })

        if (channelAEffekt === "none" && isAActive !== undefined && !inRandomizerMode) {
            this.removeEffekt(isAActive.instanceUUID);
        }

        if (isBActive !== undefined && channelBEffekt === "none") {
            // console.log(`${this.lcID}: Removing effekt`, isBActive.instanceUUID)
            this.removeEffekt(isBActive.instanceUUID);
        } 
        

        if (channelAEffekt === "none" && channelBEffekt === "none" && !inRandomizerMode) {
            this.activeEffekts = [];
            this.wsClient.lightSetOff(this.lcID);
        }

        const shouldSetEffekts = (isAActive === undefined && isBActive === undefined) || (channelBEffekt === "none");
        // if (this.lcID === 0) console.log("Should set effekts", shouldSetEffekts, isAActive, isBActive)
        if (shouldSetEffekts) {
            // if (this.lcID === 0) console.log("Setting effekts", channelAEffekt, channelBEffekt, this.activeEffekts)
            let channelAWasSet = false;
            if (channelAEffekt !== "none" && !inRandomizerMode) {
                channelAWasSet = true;
                const iID = this.wsClient.lightSetEffekt(channelAEffekt, this.lcID, this.lastFreqRange, {}, 1);
                this.activeEffekts.push({
                    instanceUUID: iID,
                    effekt: channelAEffekt,
                    channel: "A",
                    confirmed: false
                })
            }
            if (channelBEffekt !== "none") {
                let iID = "";
                if (channelAWasSet || inRandomizerMode) {
                    iID = this.wsClient.lightAddEffekt(channelBEffekt, this.lcID, this.lastFreqRange, {}, 0, this.stripLength, randomUUID(), 2);
                } else {
                    iID = this.wsClient.lightSetEffekt(channelBEffekt, this.lcID, this.lastFreqRange, {}, 2);
                }
                this.activeEffekts.push({
                    instanceUUID: iID,
                    effekt: channelAEffekt,
                    channel: "B",
                    confirmed: false
                })
            }
        } else {
            // if (this.lcID === 0) console.log("Updating effekts", channelAEffekt, channelBEffekt)
            if (isAActive?.effekt !== channelAEffekt && channelAEffekt !== "none" && !inRandomizerMode) {
                // if (this.lcID === 0)console.log("Updating A", isAActive?.effekt, channelAEffekt)
                this.removeEffekt(isAActive?.instanceUUID);
                const iID = this.wsClient.lightAddEffekt(channelAEffekt, this.lcID, this.lastFreqRange, {}, 0, this.stripLength, randomUUID(), 1);
                this.activeEffekts.push({
                    instanceUUID: iID,
                    effekt: channelAEffekt,
                    channel: "A",
                    confirmed: false
                })
            }
            if (isBActive?.effekt !== channelBEffekt && channelBEffekt !== "none") {
                if (isBActive && isBActive.instanceUUID) {
                    this.removeEffekt(isBActive.instanceUUID);
                }
                const iID = this.wsClient.lightAddEffekt(channelBEffekt, this.lcID, this.lastFreqRange, {}, 0, this.stripLength, randomUUID(), 2);
                this.activeEffekts.push({
                    instanceUUID: iID,
                    effekt: channelAEffekt,
                    channel: "B",
                    confirmed: false
                })
            }
        }
    }

    private switchEffekt = async () => {
        const channelA = this.lastChannels[10];
        if (channelA <= 240) {
            // console.log("Switching effekt", channelA)
            this.wsClient.lightRandomSetEnabledSpecific(this.lcID, false);
            this.commitEffekt(false);
            this.randomizerOnByColor = false;
        } else {
            await this.wsClient.lightRandomSetEnabledSpecific(this.lcID, true);
            if (channelA === 245) {
                this.randomizerOnByColor = false;
                await this.wsClient.send("light.random.useLastType", false)
            } else if (channelA === 246) {
                if (!this.randomizerOnByColor) {
                    this.randomizerOnByColor = true;
                    await this.wsClient.send("light.random.useLastType", true)
                    await this.wsClient.makeRandomCompByType("color")
                }
            }
            this.commitEffekt(true);
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
        let effektChanged = false;
        changedChannels.forEach((value, key) => {
            // console.log(`${this.lcID} - Updating Channel: `, key, " with value: ", value)
            switch (key) {
                case 0: // dimmer
                    const scaledBrightness = Math.floor((value / 255) * 100)
                    // console.log("Brightness: ", scaledBrightness)
                    this.wsClient.setStripBrightness(this.lcID, scaledBrightness);
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
                case 10: // effekt-a
                case 11: // effekt-b
                    effektChanged = true;
                    break;
                case 12: // speed
                    this.wsClient.setStripSpeed(this.lcID, value);
                    break;
                case 13: //intensity
                    this.wsClient.setStripIntensity(this.lcID, value);
                    break;
                case 14: // frequencyRange
                    this.switchFrequencyRange(value);
                    break;
                default:
                    console.warn("No channel mapping found for key: ", key);
                    break;
            }
        })
        if (shouldColorUpdate) {
            this.updateColorPalette();
        }
        if (effektChanged) {
            this.switchEffekt();
        }

    }


}