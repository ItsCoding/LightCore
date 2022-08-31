import { WebsocketServer } from "./system/wsServer";

const wsServer = new WebsocketServer();

wsServer.start();

// const interv = setInterval(() => {
//     console.log("Still Running....")
// },1000);