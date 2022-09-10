import { arrayMapper, expectString, objectMapper } from "@daniel-faber/json-ts";
import { WebSocketClient } from "../system/WebsocketClient";
import { ActiveEffekt } from "./ActiveEffekt";
import { CompositionTag, expectCompositionTag } from "./CompositionTag";
import { ReturnType } from "./TopicReturnType";

const wsClient = WebSocketClient.getInstance();

export class Composition {
    private activeUUIDs: (string | number)[] = [];
    private eventHandlerID: string | undefined = undefined;
    private deactivateHandler: (() => void) | undefined = undefined;
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

    private callDeactivateHandler() {
        if (this.deactivateHandler) {
            this.deactivateHandler();
            this.deactivateHandler = undefined;
        }
    }

    public activate(onDeactivate: () => void, preview?: boolean) {
        const affectedStrips = this.getAffectedStrips();
        const transaction = WebSocketClient.startTransaction();
        const activeUUIDs: (string | number)[] = [];
        this.deactivateHandler = onDeactivate;

        affectedStrips.forEach(stripIndex => {
            transaction.lightClear(preview ? (stripIndex + 5) * -1 : stripIndex);
        });
        this.activeEffekts.forEach(activeEffekt => {
            activeUUIDs.push(transaction.lightAddEffekt(activeEffekt.effektSystemName,
                preview ? (activeEffekt.stripIndex + 5) * -1 : activeEffekt.stripIndex,
                activeEffekt.frequencyRange,
                activeEffekt.instanceData,
                activeEffekt.startIndex,
                activeEffekt.endIndex));
        });
        setTimeout(() => {
            this.eventHandlerID = wsClient.addEventHandler(ReturnType.DATA.ACTIVE_EFFEKTS, topic => {
                if (topic.message === null) return;
                const activeEffekts = ActiveEffekt.fromJSONArray(topic.message);
                const activeUUIDs = activeEffekts.filter(activeEffekt => this.activeUUIDs.includes(activeEffekt.id));
                if (activeUUIDs.length === 0) {
                    this.activeUUIDs = [];
                    this.callDeactivateHandler();
                    wsClient.removeEventHandler(this.eventHandlerID!);
                } else {
                    this.activeUUIDs = activeUUIDs.map(activeEffekt => activeEffekt.id);
                }
            })
        }, 500)
        transaction.commit();
        this.activeUUIDs = activeUUIDs;
    }

    public deactivate() {
        if (this.activeUUIDs.length === 0) return;
        const transaction = WebSocketClient.startTransaction();
        this.activeUUIDs.forEach(uuid => {
            transaction.lightRemoveEffekt(uuid);
        });
        transaction.commit();
        this.activeUUIDs = [];
        this.callDeactivateHandler();
    }

    public toggle(onDeactivate: () => void) {
        if (this.activeUUIDs.length > 0) {
            this.deactivate();
        } else {
            this.activate(onDeactivate);
        }
    }

    public get isActive() {
        return this.activeUUIDs.length > 0;
    }

    public get activeIds() {
        return this.activeUUIDs;
    }
}