import { arrayMapper, expectString, objectMapper } from "@daniel-faber/json-ts";
import { WebSocketClient } from "../system/WebsocketClient";
import { ActiveEffekt } from "./ActiveEffekt";

const wsClient = WebSocketClient.getInstance();

export class Composition {
    constructor(
        public compositionName: string,
        public tags: string[],
        public activeEffekts: ActiveEffekt[]
    ) { }

    public static readonly fromJSON = objectMapper(accessor => {
        return new Composition(
            accessor.get("compositionName", expectString),
            accessor.get("tags", arrayMapper(expectString)),
            accessor.get("activeEffekts", ActiveEffekt.fromJSONArray)
        );
    })

    public static readonly fromJSONArray = arrayMapper(Composition.fromJSON);

    public activate() {
        const affectedStrips = [...new Set(this.activeEffekts.map(activeEffekt => activeEffekt.stripIndex))];
        const transaction = WebSocketClient.startTransaction();
        affectedStrips.forEach(stripIndex => {
            transaction.lightClear(stripIndex);
        });
        this.activeEffekts.forEach(activeEffekt => {
            transaction.lightAddEffekt(activeEffekt.effektSystemName,
                activeEffekt.stripIndex,
                activeEffekt.frequencyRange,
                activeEffekt.instanceData,
                activeEffekt.startIndex,
                activeEffekt.endIndex);
        });
        transaction.commit(); 
    }
}