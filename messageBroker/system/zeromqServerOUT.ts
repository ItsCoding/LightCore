import {Socket} from 'zeromq';

export class ZeroMQServerOUT {

    private server = new Socket('push');
    private onMessageHandler: (message: string) => void;

    constructor() { }

    public start(): void {
        this.server.bindSync('tcp://127.0.0.1:7123');
        console.log('ZeroMQ-OUT queue bound to port 7123');
    }

    public sendMessage(message: string): void {
        this.server.send(message);
    }
}