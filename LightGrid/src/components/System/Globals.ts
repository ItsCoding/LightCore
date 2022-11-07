let globalScaling = 2;
let globalMaxStripDensity = 60;


export const setGlobalScaling = (value: number) => {
    globalScaling = value;
}

export const getGlobalScaling = () => {
    return globalScaling;
}

export const setGlobalMaxStripDensity = (value: number) => {
    globalMaxStripDensity = value;
}

export const getGlobalMaxStripDensity = () => {
    return globalMaxStripDensity;
}
