import { ServerTopic } from "../types/ServerTopic";

export type WebSocketEvent = {
    eventHandlerID: string,
    topic: string,
    handler: (topic: ServerTopic) => void
}

export enum ClientMode {
    STAGE = 0,
    EDITOR = 1,
}

export class WebSocketClient {
    private static instance: WebSocketClient;
    private transactionLog: ServerTopic[] = [];
    private socket: WebSocket | undefined = undefined;
    public mode:ClientMode = ClientMode.EDITOR;
    public connected: boolean = false;

    private constructor(
        public inTransaction?: boolean
    ) { }
    private eventHandlers: WebSocketEvent[] = [];

    public static getInstance(): WebSocketClient {
        if (!WebSocketClient.instance) {
            WebSocketClient.instance = new WebSocketClient();
        }
        return WebSocketClient.instance;
    }

    public static startTransaction(): WebSocketClient {
        return new WebSocketClient(true);
    }

    private handleMessage(message: string): void {
        const topic = JSON.parse(message) as ServerTopic;
        // console.log("Received message: ", topic);
        if (topic.message === null) return;
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
                this.connected = true;
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
                setTimeout(() => {
                    console.log("Trying to reconnect...");
                    this.connect(url);
                })
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

    public commit(): void {
        if (this.inTransaction) {
            const trueWsClient = WebSocketClient.getInstance();
            trueWsClient.sendBatch(this.transactionLog);
        } else {
            console.warn("Cannot commit when not in transaction");
        }
    }

    public getTransactions(): ServerTopic[] {
        if (!this.inTransaction) {
            console.warn("Getting transactions outside of transaction is not allowed");
            return [];
        }
        return this.transactionLog;
    }

    public send(topicType: string, body?: any): void {
        if (this.inTransaction) {
            this.transactionLog.push({
                type: topicType,
                message: body
            });
            return;
        }
        try {
            let message = {
                type: topicType,
                message: body ?? {}
            } as ServerTopic;
            if (this.socket?.readyState === WebSocket.OPEN) {
                console.log("Sending message: ", message);
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

    public unsubscribeAll() {
        this.eventHandlers = [];
    }

    public async lightRandomNext(): Promise<void> {
        if (this.socket || this.inTransaction) {
            this.send("light.random.next",);
        }
    }

    public async lightRandomNextSpecific(index: number): Promise<void> {
        if (this.socket || this.inTransaction) {
            this.send("light.random.next.specific", { stripIndex: index });
        }
    }
    public async lightRandomSetEnabled(enabled: boolean): Promise<void> {
        if (this.socket || this.inTransaction) {
            this.send("light.random.setEnabled", { enabled: enabled });
        }
    }

    public async lightRandomSetEnabledSpecific(stripIndex: number, enabled: boolean): Promise<void> {
        if (this.socket || this.inTransaction) {
            this.send("light.random.setEnabled.specific", { enabled: enabled, stripIndex });
        }
    }

    public lightSetEffekt(effekt: string, stripIndex: number, frequency: number[], instanceData: object = {},zIndex:number = 0): string {
        const instanceUUID = Math.random().toString(36).substring(7);
        if (this.socket || this.inTransaction) {
            this.send("light.setEffekt", {
                effektName: effekt,
                stripIndex: stripIndex,
                frequencyRange: frequency,
                instanceData: instanceData,
                instanceUUID: instanceUUID,
                zIndex: zIndex
            });
        }
        return instanceUUID;
    }

    public lightAddEffekt(effekt: string, stripIndex: number, frequency: number[], instanceData: object = {}, startIndex: number, endIndex: number, instanceUUID?: string | number,zIndex: number = 0): string | number {
        if (!instanceUUID) instanceUUID = Math.random().toString(36).substring(7);
        if (this.socket || this.inTransaction) {
            this.send("light.addEffekt", {
                effektName: effekt,
                stripIndex: stripIndex,
                frequencyRange: frequency,
                instanceData: instanceData,
                instanceUUID: instanceUUID,
                startIndex: startIndex,
                endIndex: endIndex,
                zIndex: zIndex
            });
        }
        return instanceUUID;
    }

    public async lightSetOff(stripIndex: number) {
        if (this.socket || this.inTransaction) {
            this.send("light.setOff", { stripIndex: stripIndex });
        }
    }

    public async lightRemoveEffekt(instanceUUID: string | number) {
        if (this.socket || this.inTransaction) {
            this.send("light.removeEffekt", { instanceUUID: instanceUUID });
        }
    }

    public async changeConfigProperty(property: string, value: any): Promise<void> {
        if (this.socket || this.inTransaction) {
            this.send("system.config.change", { key: property, value: value });
        }
    }

    //Data will return with the type return.wsapi.getKeyValue
    public async issueKeyGet(key: string) {
        if (this.socket || this.inTransaction) {
            this.send("wsapi.getKeyValue", { key: key });
        }
    }

    public async issueKeySet(key: string, value: string) {
        if (this.socket || this.inTransaction) {
            this.send("wsapi.setKeyValue", { key: key, value: value });
        }
    }

    public async lightReport() {
        if (this.socket || this.inTransaction) {
            this.send("light.report", {});
        }
    }

    public async lightClear(stripIndex: number) {
        if (this.socket || this.inTransaction) {
            this.send("light.clearStrip", { stripIndex: stripIndex });
        }
    }

    public async sendBatch(batch: ServerTopic[]) {
        if (this.socket || this.inTransaction) {
            this.send("wsapi.pipeline.batch", { batch: batch });
        }
    }

    public async beatTap(){
        if (this.socket || this.inTransaction) {
            this.send("beat.tap", {});
        }
    }

    public async getSystemStatus(){
        if (this.socket || this.inTransaction) {
            this.send("system.status.get", {});
        }
    }
}