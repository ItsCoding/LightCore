import { GeneratedConfig } from "../../../light-designer/src/classes/ExportConfig";
import { DataAPI } from "./DataAPI";
import find from 'local-devices'

let stageData: GeneratedConfig = {
    strips: {},
    ledPositions: {},
    canvasSize: {
        width: 0,
        height: 0,
        smallestX: 0,
        smallestY: 0
    }
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
    const allDevices = await find({
        skipNameResolution: true
    });
    allDevices.forEach(device => {
        if (macs.includes(device.mac.toLowerCase())) {
            ipsByMac[device.mac.toLowerCase()] = device.ip;
            const strips = Object.values(stageData.strips).filter(strip => strip.stripMac?.toLowerCase() === device.mac.toLowerCase());
            strips.forEach(strip => {
                if (strip && (!strip.stripIP || strip.stripIP === "")) {
                    strip.stripIP = device.ip;
                    console.log("✨ Set IP for strip", strip.name, "to", device.ip);
                }
            })
        }
    });

    Object.keys(stageData.strips).forEach(stripKey => {
        if(!stageData.strips[stripKey].stripIP || stageData.strips[stripKey].stripIP === ""){
            console.log(`[${stageData.strips[stripKey].name}] Strip not found in Network, setting to localhost`)
            stageData.strips[stripKey].stripIP = "127.0.0.1"
        }
    })

    console.log("🖥  All Devices in Network");
    console.table(allDevices);
    return ipsByMac;
}

export const initializeStageData = async (dbApi: DataAPI) => {
    dataAPI = dbApi;
    const dbConfig = await dataAPI.getKeyValue("stageData");
    if (dbConfig) {
        stageData = JSON.parse(dbConfig) as GeneratedConfig;
        if(stageData.hasOwnProperty("ledPositions")){
            console.log("POITIONAL-DATA Loaded");
        }
        if(stageData.hasOwnProperty("strips")){
            console.log("STRIP-DATA Loaded");
        }
        if(stageData.hasOwnProperty("canvasSize")){
            console.log("CANVAS-DATA Loaded");
        }
        console.log("🏗  Stage data loaded from database");
    }else{
        console.log("⚠ No stage data found in database");
    }
}