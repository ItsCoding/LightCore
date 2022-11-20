export type Datapoint = {
    timestamp: number,
    value: number
}

export type MelHistory = {
    low: Datapoint[],
    mid: Datapoint[],
    high: Datapoint[]
    [key: string]: Datapoint[]
}

const melHistory: MelHistory = {
    low: [],
    mid: [],
    high: []
};

const activeMelHistory: MelHistory = {
    low: [],
    mid: [],
    high: []
};


const beatHistory: Datapoint[] = []
let activeBeatHistory: Datapoint[] = []

export const addToHistory = (newData: { low: number, mid: number, high: number }) => {
    if (melHistory.low.length > 300) {
        melHistory.low.shift();
        melHistory.mid.shift();
        melHistory.high.shift();
    }
    melHistory.high.push({
        timestamp: Date.now(),
        value: newData.high
    });
    melHistory.mid.push({
        timestamp: Date.now(),
        value: newData.mid
    });
    melHistory.low.push({
        timestamp: Date.now(),
        value: newData.low
    });
    activeMelHistory.high.push({
        timestamp: Date.now(),
        value: newData.high
    });
    activeMelHistory.mid.push({
        timestamp: Date.now(),
        value: newData.mid
    });
    activeMelHistory.low.push({
        timestamp: Date.now(),
        value: newData.low
    });
}

export const addBeatHistory = () => {
    if (beatHistory.length > 300) {
        beatHistory.shift();
        beatHistory.shift();
        beatHistory.shift();
    }
    beatHistory.push({
        timestamp: Date.now() - 50,
        value: 0
    });
    activeBeatHistory.push({
        timestamp: Date.now() - 50,
        value: 0
    });
    beatHistory.push({
        timestamp: Date.now(),
        value: 1
    });
    activeBeatHistory.push({
        timestamp: Date.now(),
        value: 1
    });
    beatHistory.push({
        timestamp: Date.now() + 50,
        value: 0
    });
    activeBeatHistory.push({
        timestamp: Date.now() + 50,
        value: 0
    });
}

export const clearHistory = () => {
    activeMelHistory.high = [];
    activeMelHistory.mid = [];
    activeMelHistory.low = [];
}

export const getHistory = () => {
    return activeMelHistory;
}

export const getFullHistory = () => {
    return melHistory;
}

export const getBeatHistory = () => {
    return activeBeatHistory;
}

export const getFullBeatHistory = () => {
    return beatHistory;
}

export const clearBeatHistory = () => {
    activeBeatHistory = [];
}