import { WebsocketServer } from "./system/wsServer";
import "reflect-metadata"
const wsServer = new WebsocketServer();

wsServer.start();

// const interv = setInterval(() => {
//     console.log("Still Running....")
// },1000);