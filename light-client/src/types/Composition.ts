import { arrayMapper, expectString, objectMapper } from "@daniel-faber/json-ts";
import { WebSocketClient } from "../system/WebsocketClient";
import { ActiveEffekt } from "./ActiveEffekt";
import { CompositionTag, expectCompositionTag } from "./CompositionTag";

const wsClient = WebSocketClient.getInstance();

export class Composition {
    constructor(
        public id: string,
        public compositionName: string,
        public tags: CompositionTag[],
        public activeEffekts: ActiveEffekt[]
    ) { }

    public static readonly fromJSON = objectMapper(accessor => {
        return new Composition(
            accessor.get("id", expectString),
            accessor.get("compositionName", expectString),
            accessor.get("tags", arrayMapper(expectCompositionTag)),
            accessor.get("activeEffekts", ActiveEffekt.fromJSONArray)
        );
    })

    public static readonly fromJSONArray = arrayMapper(Composition.fromJSON);

    public toJSON() {
        return {
            id: this.id,
            compositionName: this.compositionName,
            tags: this.tags,
            activeEffekts: this.activeEffekts.map(activeEffekt => activeEffekt.toJSON())
        }
    }

    public getAffectedStrips() {
        return [...new Set(this.activeEffekts.map(activeEffekt => activeEffekt.stripIndex))];
    }

    public activate() {
        const affectedStrips = this.getAffectedStrips();
        const transaction = WebSocketClient.startTransaction();
        const activeUUIDs: (string | number)[] = [];
        affectedStrips.forEach(stripIndex => {
            transaction.lightClear(stripIndex);
        });
        this.activeEffekts.forEach(activeEffekt => {
            activeUUIDs.push(transaction.lightAddEffekt(activeEffekt.effektSystemName,
                activeEffekt.stripIndex,
                activeEffekt.frequencyRange,
                activeEffekt.instanceData,
                activeEffekt.startIndex,
                activeEffekt.endIndex));
        });
        transaction.commit();
        return activeUUIDs;
    }
}