import WebSocket, { WebSocketServer } from 'ws';
import { DataAPI } from './DataAPI';
import { ZeroMQServerIN } from './zeromqServerIN';
import { ZeroMQServerOUT } from './zeromqServerOUT';

export class WebsocketServer {

    private wss = new WebSocketServer({ port: 8000 });
    private clients: WebSocket[] = [];
    private dataAPI: DataAPI;
    private zeroMQServerOUT: ZeroMQServerOUT = new ZeroMQServerOUT();
    private zeroMQServerIN: ZeroMQServerIN;
    constructor() {
        const self = this;
        this.zeroMQServerIN = new ZeroMQServerIN((message: string) => {
            self.sendMessage(message);
        });
        this.dataAPI = new DataAPI();
    }

    public start(): void {
        const self = this; 
        this.zeroMQServerIN.start();
        this.zeroMQServerOUT.start();
        this.wss.on('connection', function connection(ws) {
            self.clients.push(ws);
            ws.on('message', function message(data) {
                // console.log('received-client: %s', data);
                // self.zeroMQServerOUT.sendMessage(data.toString());
                self.messageHandler(data.toString());
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

    public sendMessage(message: string ): void {
        this.clients.forEach(client => {
            client.send(message);
        });
    }


    public messageHandler(message: string): void {
        let messageObject: {type: string, message: any} = JSON.parse(message);
        if(messageObject.type.startsWith("wsapi")){
            switch(messageObject.type){
                case "wsapi.getKeyValue":
                    let gkey = messageObject.message.key;
                    let gvalue = this.dataAPI.getKeyValue(gkey);
                    this.zeroMQServerOUT.sendMessage({type: "return.wsapi.getKeyValue", message: {value:gvalue,key:gkey}});
                    return;
                case "wsapi.setKeyValue":
                    let key = messageObject.message.key;
                    let value = messageObject.message.value;
                    this.dataAPI.setKeyValue(key, value);
                    break;
            }
        }else{
            this.zeroMQServerOUT.sendMessage(message);
        }
    }
}
