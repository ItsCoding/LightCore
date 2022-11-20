export type MelHistory = {
    low: number[],
    mid: number[],
    high: number[]
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
    melHistory.high.push(newData.high);
    melHistory.mid.push(newData.mid);
    melHistory.low.push(newData.low);
}

export const getHistory = () => {
    return melHistory;
}