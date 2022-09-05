import { JsonMappingError, JsonValue } from "@daniel-faber/json-ts";

export type CompositionTag = {
    id: string,
    name: string,
    color: string,
}

export function expectCompositionTag(jsonValue: JsonValue): CompositionTag {
    if (typeof jsonValue !== 'object' && Object.keys(jsonValue).length !== 3) {
        throw new JsonMappingError('Object like expected');
    }
    return jsonValue as CompositionTag;
}