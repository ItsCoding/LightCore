import { GeneratedConfig } from "../../../light-designer/src/classes/ExportConfig";
import { DataAPI } from "./DataAPI";
import find from 'local-devices'

let stageData: GeneratedConfig = {
    strips: {}
}

let dataAPI: DataAPI = undefined
const ipsByMac: { [key: string]: string } = {}

export const getStageData = () => {
    return stageData;
}

export const setStageData = (data: GeneratedConfig) => {
    stageData = data;
}

export const getLastIP = (mac: string) => {
    return ipsByMac[mac] || undefined;
}

export const findIPsByMac = async () => {
    let macs: string[] = [];

    Object.keys(stageData.strips).forEach(key => {
        let mac = stageData.strips[key].stripMac;
        if (mac && !macs.includes(mac.toLowerCase())) {
            macs.push(mac.toLowerCase());
        }
    })
    const allDevices = await find();
    allDevices.forEach(device => {
        if (macs.includes(device.mac.toLowerCase())) {
            ipsByMac[device.mac.toLowerCase()] = device.ip;
            const strip = Object.values(stageData.strips).find(strip => strip.stripMac?.toLowerCase() === device.mac.toLowerCase());
            if (strip && (!strip.stripIP || strip.stripIP === "")) {
                strip.stripIP = device.ip;
                console.log("✨ Set IP for strip", strip.name, "to", device.ip);
            }
        }
    });
    console.log("🖥  All Devices in Network");
    console.table(allDevices);
    return ipsByMac;
}

export const initializeStageData = async (dbApi: DataAPI) => {
    dataAPI = dbApi;
    const dbConfig = await dataAPI.getKeyValue("stageData");
    if (dbConfig) {
        stageData = JSON.parse(dbConfig) as GeneratedConfig;
        console.log("🏗  Stage data loaded from database");
    }else{
        console.log("⚠ No stage data found in database");
    }
}