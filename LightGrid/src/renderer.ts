/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import '.';
import { Socket, Server } from "net";
import WebSocket, { WebSocketServer } from 'ws';
const port = 8080;

// Use net.createServer() in your code. This is just for illustration purpose.
// Create a new TCP server.
const server = new Server();
const wss = new WebSocketServer({ port: port });
const clients: WebSocket[] = [];
let serverStarted = false;
let allreadyConnected = false;
type LightData = {
    [key: string]: Array<Array<number>>
}

const applyData = (stripIndex: number, data: Array<Array<number>>) => {
    for (let i = 0; i < data[0].length; i++) {
        const ledID = `${stripIndex}-${i}`;
        const panel = document.getElementById(ledID);
        if (panel) {
            panel.style.backgroundColor = `rgb(${data[0][i]}, ${data[1][i]}, ${data[2][i]})`;
        }
    }
}

const processData = (data: LightData) => {
    Object.keys(data).forEach((key: string) => {
        applyData(parseInt(key), data[key]);
    })
}


const initTCP = () => {
    if (serverStarted) {
        console.warn("Server already started");
        return;
    }
    serverStarted = true;

    // The server listens to a socket for a client to make a connection request.
    // Think of a socket as an end point.
    server.listen(port, function () {
        console.log(`Server listening for connection requests on socket localhost:${port}`);
    });

    // When a client requests a connection with the server, the server creates a new
    // socket dedicated to that client.
    server.on('connection', function (socket: Socket) {
        if (allreadyConnected) {
            console.warn("Already connected");
            return;
        }
        // allreadyConnected = true;
        console.log('A new connection has been established.');
        // The server can also receive data from the client by reading from its socket.
        socket.on('data', function (chunk) {
            // console.log(`Data received from client: ${chunk.toString()}`);
            try {
                const chunkString = chunk.toString();
                // replace all }{ with },{ to make it valid JSON
                const chunkStringFixed = chunkString.replace(/}{/g, '},{');


                const data = JSON.parse(chunkStringFixed);
                const arrayData = Array.isArray(data) ? data : [data];
                arrayData.forEach((data) => {
                    applyData(parseInt(data.strip), data.frames);
                });
            } catch (error) {
                // console.warn(error)
                console.log("Error parsing data");
                // console.log(chunk.toString());
            }

        });

        // When the client requests to end the TCP connection with the server, the server
        // ends the connection.
        socket.on('end', function () {
            console.log('Closing connection with the client');
            allreadyConnected = false;
        });

        // Don't forget to catch error, for your own sake.
        socket.on('error', function (err) {
            console.log(`Error: ${err}`);
            allreadyConnected = false;
        });
    });
}

const initWsServer = () => {
    wss.on('connection', function connection(ws) {
        clients.push(ws);
        console.log("New client connected");
        ws.on('message', function message(incommingData) {
            // console.log('received-client: %s', data);
            // self.zeroMQServerOUT.sendMessage(data.toString());
            const chunkString = incommingData.toString();
            // replace all }{ with },{ to make it valid JSON
            processData(JSON.parse(chunkString));
        });
        ws.on('close', function () {
            console.log("Client disconnected");
            clients.splice(clients.indexOf(ws), 1);
        });
        ws.on('error', function (error) {
            console.log("Client error");
            clients.splice(clients.indexOf(ws), 1);
            console.log(error);
        });
    });
    console.log("Websocket server started");
}



initWsServer();
// initTCP();