import WebSocket, { WebSocketServer } from 'ws';
import { ZeroMQServerIN } from './zeromqServerIN';
import { ZeroMQServerOUT } from './zeromqServerOUT';

export class WebsocketServer {

    private wss = new WebSocketServer({ port: 8000 });
    private clients: WebSocket[] = [];
    private zeroMQServerOUT: ZeroMQServerOUT = new ZeroMQServerOUT();
    private zeroMQServerIN: ZeroMQServerIN = new ZeroMQServerIN();
    constructor() { }

    public start(): void {
        const self = this;

        this.zeroMQServerIN.onMessage((message: string) => {
            // console.log("Got Message from MQ: " + message);
            self.sendMessage(message);
        });
        this.zeroMQServerIN.start();
        this.zeroMQServerOUT.start();
        this.wss.on('connection', function connection(ws) {
            self.clients.push(ws);
            ws.on('message', function message(data) {
                // console.log('received-client: %s', data);
                self.zeroMQServerOUT.sendMessage(data.toString());
            });
            ws.on('close', function () {
                self.clients.splice(self.clients.indexOf(ws), 1);
            });
            ws.on('error', function (error) {
                self.clients.splice(self.clients.indexOf(ws), 1);
                console.log(error);
            });
        });
        console.log("Websocket server bound to port 8000");
    }

    public sendMessage(message: string): void {
        this.clients.forEach(client => {
            client.send(message);
        });
    }
}
