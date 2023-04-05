
import { GeneratedConfig, GeneratedStripConfig } from "../../../light-designer/src/classes/ExportConfig";
import config from "../config.json";
import { WebSocketClient } from "./WebsocketClient";
import { LightCoreFixture } from "./classes/LightCoreFixture";
import { dmxnet } from "dmxnet";

type StripDict = {
    [key: string]: GeneratedStripConfig;
}

let loadedStrips: LightCoreFixture[] = [];
const dmxNet = new dmxnet({
    sName: "LightCore",
    lName: "LightCore integration with LightDesigner",

})
const parseStripData = (stripConfig: StripDict, wsClient: WebSocketClient) => {
    const parsedStrips: LightCoreFixture[] = []
    const doneLCIDs: number[] = []
    for (const key in stripConfig) {
        const strip = stripConfig[key];
        if (doneLCIDs.includes(parseInt(strip.lcid))) {
            continue;
        }
        let totalLeds = 0;
        for (const [keys, stripData] of Object.entries(stripConfig)) {
            const s: any = stripData;
            if (parseInt(s.lcid) === parseInt(strip.lcid)) {
                totalLeds += strip.leds;
            }
        }
        doneLCIDs.push(parseInt(strip.lcid))
        parsedStrips.push(new LightCoreFixture(parseInt(strip.lcid), strip.artnet.address, totalLeds, wsClient))
    }
    console.log("Parsed strips: ")
    console.table(parsedStrips);
    return parsedStrips;
}


const main = async () => {
    const wsClient = WebSocketClient.getInstance()
    await wsClient.connect(config.messagebroker.wsAddress)
    console.log("Connected to message broker, get stage Data");

    const stageDataHandler = wsClient.addEventHandler("return.wsapi.getKeyValue", (data) => {
        const stageData = JSON.parse(data.message.value) as GeneratedConfig
        // console.log("Stage Data: ", stageData.strips);
        // parseStripData(stageData.strips,WebSocketClient)
        loadedStrips = parseStripData(stageData.strips, wsClient);
        const receiver = dmxNet.newReceiver({
            universe: config.artnetUniverse,
        })

        receiver.on("data", (data) => {
            // console.log("Received data: ", data);
            loadedStrips.forEach((strip) => {
                strip.onDmxData(data);
            })
        });
    })

    wsClient.issueKeyGet("stageData");
    console.log("Issued get stage data");
}

main();