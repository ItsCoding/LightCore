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