import { arrayMapper, expectString, objectMapper } from "@daniel-faber/json-ts";

export class Effekt {
    constructor(
        public name: string,
        public effektSystemName: string,
        public description: string,
        public group: string,
        public groupColor?: string
    ){}

    public static readonly fromJSON = objectMapper(accessor => new Effekt(
        accessor.get("name", expectString),
        accessor.get("effektSystemName", expectString),
        accessor.get("description", expectString),
        accessor.get("group", expectString),
        accessor.getOptional("groupColor", expectString)
    ));

    public static readonly fromJSONArray = arrayMapper(Effekt.fromJSON);
}