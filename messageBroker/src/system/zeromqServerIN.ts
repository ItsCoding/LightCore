import {Socket} from 'zeromq';

export class ZeroMQServerIN {

    private server = new Socket('pull');
    private onMessageHandler: (message: string) => void;

    constructor(callback: (message: string) => void) {
        this.onMessageHandler = callback;
     }

    public start(): void {
        const self = this;
        this.server.bindSync('tcp://127.0.0.1:7321');
        this.server.on('message', function (msg) {
            if (self.onMessageHandler) {
                // console.log("ZEROMQ received: " + msg.toString().length);
                self.onMessageHandler(msg.toString());
            }
        });
        console.log('⬅  ZeroMQ-IN queue bound to port 7321');
    }
}