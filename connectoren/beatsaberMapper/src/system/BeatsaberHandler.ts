import { objectMapper, enumMapperByValue, JsonValue, expectNumber } from "@daniel-faber/json-ts";

export type BSFixture = {
    id: number,
    name: string,
    type: "light" | "effekt",
}

export const existingFixures: (BSFixture)[] = [
    {
        id: 0,
        name: "Back Lasers",
        type: "light"
    },
    {
        id: 1,
        name: "Ring Lights",
        type: "light"
    },
    {
        id: 2,
        name: "Left Lasers",
        type: "light"
    },
    {
        id: 3,
        name: "Right Lasers",
        type: "light"
    },
    {
        id: 4,
        name: "Road Lights",
        type: "light"
    },
    {
        id: 5,
        name: "Boost Lights",
        type: "light"
    },
    {
        id: 6,
        name: "Custom Light 2",
        type: "light"
    },
    {
        id: 7,
        name: "Custom Light 3",
        type: "light"
    },
    {
        id: 8,
        name: "Rings Rotate",
        type: "effekt"
    },
    {
        id: 9,
        name: "Rings Zoom",
        type: "effekt"
    },
    {
        id: 10,
        name: "Custom Light 4",
        type: "light"
    },
    {
        id: 11,
        name: "Custom Light 5",
        type: "light"
    },
    {
        id: 12,
        name: "Left Lasers Speed",
        type: "effekt"
    },
    {
        id: 13,
        name: "Right Lasers Speed",
        type: "effekt"
    },
    {
        id: 14,
        name: "Early Rotation",
        type: "effekt"
    },
    {
        id: 15,
        name: "Late Rotation",
        type: "effekt"
    },
    {
        id: 16,
        name: "Custom Event 1",
        type: "effekt"
    },
    {
        id: 17,
        name: "Custom Event 2",
        type: "effekt"
    },
]

export enum BSEventType {
    HELLO = "hello",
    SONG_START = "songStart",
    FINISHED = "finished",
    SOFT_FAILED = "softFailed",
    FAILED = "failed",
    MENU = "menu",
    PAUSE = "pause",
    RESUME = "resume",
    NOTE_SPAWNED = "noteSpawned",
    NOTE_CUT = "noteCut",
    NOT_FULLY_CUT = "noteFullyCut",
    NOTE_MISSED = "noteMissed",
    BOMB_CUT = "bombCut",
    BOMB_MISSED = "bombMissed",
    OBSTACLE_ENTER = "obstacleEnter",
    OBSTACLE_EXIT = "obstacleExit",
    SCORE_CHANGED = "scoreChanged",
    BEATMAP_EVENT = "beatmapEvent",
}

type BSEventHandler = (event: BSMessage) => void | Promise<void>

export type EventSubscription = {
    eventHandlerID: string,
    type: BSEventType,
    handler: BSEventHandler
}

export const expectAny = (jsonValue: JsonValue): any => {
    return jsonValue;
}

export type BeatMapEvent = {
    type: number,
    value?: number,
    time: number,
    bpm?: number,
}


export class BSMessage {
    constructor(
        public event: BSEventType,
        public time: number,
        public status?: any,
        public beatmapEvent?: BeatMapEvent
    ) { }

    public static fromJSON = objectMapper(accessor => new BSMessage(
        accessor.get("event", enumMapperByValue(BSEventType)),
        accessor.get("time", expectNumber),
        accessor.getOptional("status", expectAny),
        accessor.getOptional("beatmapEvent", expectAny),
    ));
}


export class BeatsaberHandler {

    private isConnected = false;
    private websocket: WebSocket;
    private eventHandlers: EventSubscription[] = [];

    private onBSMessage = (e: MessageEvent) => {
        try {

            const event: BSMessage = BSMessage.fromJSON(JSON.parse(e.data));
            if (event.event === BSEventType.BEATMAP_EVENT) {
                // console.log("RAW", JSON.parse(e.data).status)
            }
            // console.log("BS Message", event);
            this.eventHandlers.forEach((eventHandler) => {
                if (eventHandler.type === event.event) {
                    eventHandler.handler(event);
                }
            })
        } catch (error) {
            console.warn("Error parsing beatsaber message", error, JSON.parse(e.data));
        }
    }

    public on(type: BSEventType, handler: BSEventHandler): string {
        const eventHandlerID = Math.random().toString(36).substring(7);
        this.eventHandlers.push({
            eventHandlerID: eventHandlerID,
            handler: handler,
            type
        });
        return eventHandlerID
    }

    public off(eventHandlerID: string): void {
        this.eventHandlers = this.eventHandlers.filter((eventHandler) => {
            return eventHandler.eventHandlerID !== eventHandlerID;
        });
    }

    public unsubscribeAll() {
        this.eventHandlers = [];
    }

    public async connect() {
        if (this.isConnected) {
            return;
        }
        this.websocket = new WebSocket("ws://localhost:6557/socket");
        try {
            await new Promise((resolve, reject) => {
                this.websocket.onopen = () => {
                    resolve("Connected to beatsaber websocket");
                };
                this.websocket.onerror = (error) => {
                    reject(error);
                };
            });
            this.isConnected = true;
            this.websocket.onmessage = this.onBSMessage;
        } catch (error) {
            console.error("Failed to connect to beatsaber websocket", error);
            console.log("Retrying in 5 seconds");
            this.isConnected = false;
            return new Promise((resolve) => {
                setTimeout(() => {
                    this.connect().then(resolve);
                }, 5000);
            });
        }

    }

    private constructor() {
        this.connect();
    }


    private static instance: BeatsaberHandler;
    public static getInstance(): BeatsaberHandler {
        if (!BeatsaberHandler.instance) {
            BeatsaberHandler.instance = new BeatsaberHandler();
        }
        return BeatsaberHandler.instance;
    }
}