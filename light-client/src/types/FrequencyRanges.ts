export class FrequencyRange{
    public static readonly LOW = [0,11];
    public static readonly midL = [12,28];
    public static readonly midH = [29,39];
    public static readonly MID = [FrequencyRange.midL[0],FrequencyRange.midH[1]];
    public static readonly HIGH = [40,64];
    public static readonly midHigh = [FrequencyRange.MID[0],FrequencyRange.HIGH[1]]
    public static readonly ALL = [0,64];

    public static readonly allRanges = [
        {
            name: "LOW",
            range: FrequencyRange.LOW
        },
        {
            name: "MidLow",
            range: FrequencyRange.midL
        },
        {
            name: "MidHIgh",
            range: FrequencyRange.midH
        }
        ,{
            name: "MID",
            range: FrequencyRange.MID
        }
        ,{
            name: "HIGH",
            range: FrequencyRange.HIGH
        }
        ,{
            name: "MID-HIGH",
            range: FrequencyRange.midHigh
        }
        ,{
            name: "ALL",
            range: FrequencyRange.ALL
        }

    ];
}