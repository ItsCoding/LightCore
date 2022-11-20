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

export const addToHistory = (newData: { low: number, mid: number, high: number }) => {
    if (melHistory.low.length > 200) {
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
}

export const clearHistory = () => {
    melHistory.high = [];
    melHistory.mid = [];
    melHistory.low = [];
}

export const getHistory = () => {
    return melHistory;
}