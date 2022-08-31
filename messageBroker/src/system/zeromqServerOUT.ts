import {Socket} from 'zeromq';

export class ZeroMQServerOUT {

    private server = new Socket('push');
    constructor() { }

    public start(): void {
        this.server.bindSync('tcp://127.0.0.1:7123');
        console.log('ZeroMQ-OUT queue bound to port 7123');
    }

    public sendMessage(message: string | Object | Array<any>): void {
        let messageString: string = ""
        if(typeof message === "object"){
            messageString = JSON.stringify(message);
        }else{
            messageString = message;
        }
        this.server.send(messageString);
    }
}