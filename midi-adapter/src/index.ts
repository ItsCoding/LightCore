import WebSocket from 'ws';
import { Output } from 'easymidi';

const runningOnWindows = process.platform === 'win32';

const virtualOutput = new Output('LC-Midi', !runningOnWindows);
let pingPong = false
const processMessage = async (message: string) => {
    const data = JSON.parse(message)
    switch (data.type) {
        case "return.beat.detected":
            if (pingPong) {
                virtualOutput.send('noteon', {
                    note: 60,
                    velocity: 127,
                    channel: 0
                });
                pingPong = false
                process.stdout.write("\rBeat: |")
            } else {
                virtualOutput.send('noteoff', {
                    note: 60,
                    velocity: 127,
                    channel: 0
                });
                process.stdout.write("\rBeat: -")
                pingPong = true
            }
            virtualOutput.send('clock')
            break;
        case "return.trigger.randomizer.next":
            process.stdout.write("\rRandomizer next\n")
            virtualOutput.send('start')
            break;
    }
}

const main = async () => {
    //get url from cli args
    const url = process.argv[2]
    console.log("Connecting to: ", url)
    let ws = new WebSocket(`ws://${url}:8000`);

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