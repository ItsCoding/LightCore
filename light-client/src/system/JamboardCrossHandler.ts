import { Effekt } from "../types/Effekt";

let effektSetMode: "SET" | "ADD" = "ADD";
let holdToActivate = false;
let modKey = false;
let optionKey = false;

export const setEffektSetMode = (mode: "SET" | "ADD") => {
    effektSetMode = mode;
}

export const getEffektSetMode = () => {
    return effektSetMode;
}

export const setHoldToActivate = (value: boolean) => {
    holdToActivate = value;
}

export const getHoldToActivate = () => {
    return holdToActivate;
}

export const getEffektGroups = (availableEffekts: Effekt[]) => {
    const effektGroups: { [key: string]: Effekt[] } = {};
    availableEffekts.forEach((effekt) => {
        if (!effektGroups[effekt.group]) {
            effektGroups[effekt.group] = [];
        }
        effektGroups[effekt.group].push(effekt);
    });

    const allBeatEffekte = availableEffekts.filter(eff => eff.beatSensitive);
    const allFFTBased = availableEffekts.filter(eff => !eff.beatSensitive)
    const allColorEffekts = availableEffekts.filter(eff => eff.name.toLowerCase().includes("color") || eff.name.toLowerCase().includes("run") || eff.name.toLowerCase().includes("wash"))
    effektGroups["Beat-Based"] = allBeatEffekte;
    effektGroups["FFT-Based"] = allFFTBased;
    effektGroups["Color-Based"] = allColorEffekts;
    return effektGroups;
}

export const setModKey = (value: boolean) => {
    modKey = value;
}

export const getModKey = () => {
    return modKey;
}

export const setOptionKey = (value: boolean) => {
    optionKey = value;
}

export const getOptionKey = () => {
    return optionKey;
}
