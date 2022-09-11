import { arrayMapper, expectBoolean, expectString, objectMapper } from "@daniel-faber/json-ts";

export class Effekt {
    constructor(
        public name: string,
        public effektSystemName: string,
        public description: string,
        public group: string,
        public groupColor?: string,
        public beatSensitive?: boolean,
    ){}

    public static readonly fromJSON = objectMapper(accessor => new Effekt(
        accessor.get("name", expectString),
        accessor.get("effektSystemName", expectString),
        accessor.get("description", expectString),
        accessor.get("group", expectString),
        accessor.getOptional("groupColor", expectString),
        accessor.getOptional("beatSensitive", expectBoolean)
    ));

    public static readonly fromJSONArray = arrayMapper(Effekt.fromJSON);
}