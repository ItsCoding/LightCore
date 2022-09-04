import { ServerTopic } from "../types/ServerTopic";

export type WebSocketEvent = {
    eventHandlerID: string,
    topic: string,
    handler: (topic: ServerTopic) => void
}

export class WebSocketClient {
    private static instance: WebSocketClient;

    private socket: WebSocket | undefined = undefined;
    private constructor() { }
    private eventHandlers: WebSocketEvent[] = [];

    public static getInstance(): WebSocketClient {
        if (!WebSocketClient.instance) {
            WebSocketClient.instance = new WebSocketClient();
        }
        return WebSocketClient.instance;
    }

    private handleMessage(message: string): void {
        console.log(message);
        const topic = JSON.parse(message) as ServerTopic;
        this.eventHandlers.forEach((eventHandler) => {
            if (eventHandler.topic === topic.type) {
                eventHandler.handler(topic);
            }
        })
    }

    public connect(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.socket) {
                resolve()
            }
            this.socket = new WebSocket(url);
            console.log("Connecting to WS:" + url);
            this.socket.onopen = () => {
                console.log('WebSocket connected');
                setTimeout(() => {
                    console.log("Resolving")
                    resolve();
                }, 1000);
            }
            this.socket.onmessage = (event) => {
                this.handleMessage(event.data);
            }
            this.socket.onerror = (error) => {
                console.log(error);
            }
            this.socket.onclose = (event) => {
                console.log(event);
            }
        })
    }

    public async disconnect(): Promise<void> {
        if (this.socket) {
            this.socket.close();
        }
    }

    public send(topicType: string, body?: any): void {
        try {
            let message = {
                type: topicType,
                message: body ?? {}
            } as ServerTopic;
            if (this.socket?.readyState === WebSocket.OPEN) {
                console.log("Sending message: " + JSON.stringify(message));
                this.socket.send(JSON.stringify(message))
            } else {
                console.log("Socket not ready");
            }
        } catch (error) {
            console.error("WS send error: ", error);
        }

    }

    public addEventHandler(topic: string, handler: (topic: ServerTopic) => void): string {
        const eventHandlerID = Math.random().toString(36).substring(7);
        this.eventHandlers.push({
            eventHandlerID: eventHandlerID,
            handler: handler,
            topic
        });
        return eventHandlerID
    }

    public removeEventHandler(eventHandlerID: string): void {
        this.eventHandlers = this.eventHandlers.filter((eventHandler) => {
            return eventHandler.eventHandlerID !== eventHandlerID;
        });
    }

    public async lightRandomNext(): Promise<void> {
        if (this.socket) {
            this.send("light.random.next",);
        }
    }

    public async lightRandomNextSpecific(index: number): Promise<void> {
        if (this.socket) {
            this.send("light.random.next.specific", { stripIndex: index });
        }
    }
    public async lightRandomSetEnabled(enabled: boolean): Promise<void> {
        if (this.socket) {
            this.send("light.random.setEnabled", { enabled: enabled });
        }
    }

    public async lightRandomSetEnabledSpecific(stripIndex: number, enabled: boolean): Promise<void> {
        if (this.socket) {
            this.send("light.random.setEnabled.specific", { enabled: enabled, stripIndex });
        }
    }

    public lightSetEffekt(effekt: string, stripIndex: number, frequency: number[], instanceData: object = {}): string {
        const instanceUUID = Math.random().toString(36).substring(7);
        if (this.socket) {
            this.send("light.setEffekt", {
                effektName: effekt,
                stripIndex: stripIndex,
                frequencyRange: frequency,
                instanceData: instanceData,
                instanceUUID: instanceUUID
            });
        }
        return instanceUUID;
    }

    public lightAddEffekt(effekt: string, stripIndex: number, frequency: number[], instanceData: object = {},startIndex:number, endIndex: number): string {
        const instanceUUID = Math.random().toString(36).substring(7);
        if (this.socket) {
            this.send("light.addEffekt", {
                effektName: effekt,
                stripIndex: stripIndex,
                frequencyRange: frequency,
                instanceData: instanceData,
                instanceUUID: instanceUUID,
                startIndex: startIndex,
                endIndex: endIndex
            });
        }
        return instanceUUID;
    }

    public async lightSetOff(stripIndex: number) {
        if (this.socket) {
            this.send("light.setOff", { stripIndex: stripIndex });
        }
    }

    public async lightRemoveEffekt(instanceUUID: number) {
        if (this.socket) {
            this.send("light.removeEffekt", { instanceUUID: instanceUUID });
        }
    }

    public async changeConfigProperty(property: string, value: any): Promise<void> {
        if (this.socket) {
            this.send("system.config.change", { key: property, value: value });
        }
    }

    //Data will return with the type return.wsapi.getKeyValue
    public async issueKeyGet(key: string) {
        if (this.socket) {
            this.send("wsapi.getKeyValue", { key: key });
        }
    }

    public async issueKeySet(key: string, value: any) {
        if (this.socket) {
            this.send("wsapi.setKeyValue", { key: key, value: value });
        }
    }

    public async lightReport() {
        if (this.socket) {
            this.send("light.report", {});
        }
    }
}