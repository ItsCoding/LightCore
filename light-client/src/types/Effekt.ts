import { arrayMapper, expectString, objectMapper } from "@daniel-faber/json-ts";

export class Effekt {
    constructor(
        public name: string,
        public effektSystemName: string,
        public description: string
    ){}

    public static readonly fromJSON = objectMapper(accessor => new Effekt(
        accessor.get("name", expectString),
        accessor.get("effektSystemName", expectString),
        accessor.get("description", expectString),
    ));

    public static readonly fromJSONArray = arrayMapper(Effekt.fromJSON);
}