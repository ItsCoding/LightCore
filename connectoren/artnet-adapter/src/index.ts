import WebSocket from 'ws';
const options = {
    host: '10.40.0.13'
}

const artnet = require('artnet')(options);
const runningOnWindows = process.platform === 'win32';

let pingPong = false
const processMessage = async (message: string) => {
    const data = JSON.parse(message)
    switch (data.type) {
        case "return.beat.detected":
            if (data.message.type === "all") {
                if (pingPong) {
                    artnet.set(1, [255]);
                    pingPong = false
                    process.stdout.write("\rBeat: |")
                } else {
                    artnet.set(1, [0]);
                    process.stdout.write("\rBeat: -")
                    pingPong = true
                }
            }
            break;
        case "return.trigger.randomizer.next":
            process.stdout.write("\rRandomizer next\n")
            artnet.set(2, [255]);
            setTimeout(() => {
                artnet.set(1, [0]);
            }, 100)
            break;
    }
}

const main = async () => {
    //get url from cli args
    const url = process.argv[2]
    console.log("Starting LC Artnet Connector")
    console.log("Connecting to: ", url)
    let ws = new WebSocket(`ws://${url}:8000`);
    console.log(`Sending signals to: ${options.host}`)
    ws.on('open', function open() {
        console.log("Connected to LC-MessageBroker")
    });

    ws.on('message', async (data) => {
        await processMessage(`${data}`)
    });

    // if connection is closed, try to reconnect
    ws.on('close', () => {
        console.log("Connection closed, trying to reconnect...")
        ws = new WebSocket(`ws://${url}:8000`);
    });
}

main();