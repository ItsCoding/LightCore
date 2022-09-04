import { arrayMapper, expectNumber, expectString, JsonMappingError, JsonValue, mapObjectMapper, objectMapper } from "@daniel-faber/json-ts";

export function expectStringOrNumberOrBool(jsonValue: JsonValue): string | number | boolean {
    if (typeof jsonValue !== 'string' && typeof jsonValue !== 'number' && typeof jsonValue !== 'boolean') {
        throw new JsonMappingError('string expected');
    }
    return jsonValue;
}

export function expectStringOrNumber(jsonValue: JsonValue): string | number  {
    if (typeof jsonValue !== 'string' && typeof jsonValue !== 'number') {
        throw new JsonMappingError('string expected');
    }
    return jsonValue;
}

export class ActiveEffekt {
    constructor(
        public id: string | number,
        public effektName: string,
        public stripIndex: number,
        public frequencyRange: number[],
        public instanceData: object,
        public startIndex: number,
        public endIndex: number,
        public effektSystemName: string
    ){}

    public static readonly fromJSON = objectMapper(accessor => {
        return new ActiveEffekt(
            accessor.get("id", expectStringOrNumber),
            accessor.get("effektName", expectString),
            accessor.get("stripIndex", expectNumber),
            accessor.get("frequencyRange", arrayMapper(expectNumber)),
            accessor.get("instanceData", mapObjectMapper(expectStringOrNumberOrBool)),
            accessor.get("ledStartIndex", expectNumber),
            accessor.get("ledEndIndex", expectNumber),
            accessor.get("effektSystemName", expectString)
        );
    })

    public static readonly fromJSONArray = arrayMapper(ActiveEffekt.fromJSON);
}