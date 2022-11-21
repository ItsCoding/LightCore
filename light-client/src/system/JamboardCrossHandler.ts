import { Effekt } from "../types/Effekt";

let effektSetMode: "SET" | "ADD" = "ADD";
let holdToActivate = false;
let modKey = false;

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
    return effektGroups;
}

export const setModKey = (value: boolean) => {
    modKey = value;
}

export const getModKey = () => {
    return modKey;
}
