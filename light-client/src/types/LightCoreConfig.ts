import { expectNumber, expectString, objectMapper } from "@daniel-faber/json-ts";

export class LightCoreConfig {
    constructor(
        public device: string,
        public brightness: number,
        public minFrequency: number,
        public maxFrequency: number,
        public frequencyBins: number,
        public randomMaxWait: number,
        public randomMinWait: number,
        public dropRandomMaxWait: number,
        public dropRandomMinWait: number,
        public globalSpeed: number,
        public globalIntensity: number
    ) { }

    public static readonly fromJSON = objectMapper(accessor => new LightCoreConfig(
        accessor.get("device", expectString),
        accessor.get("brightness", expectNumber),
        accessor.get("minFrequency", expectNumber),
        accessor.get("maxFrequency", expectNumber),
        accessor.get("frequencyBins", expectNumber),
        accessor.get("randomMaxWait", expectNumber),
        accessor.get("randomMinWait", expectNumber),
        accessor.get("dropRandomMaxWait", expectNumber),
        accessor.get("dropRandomMinWait", expectNumber),
        accessor.get("globalSpeed", expectNumber),
        accessor.get("globalIntensity", expectNumber)
    ));
}