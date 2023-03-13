import * as artnet from "artnet";
import { ipcRenderer } from "electron";
import { BSFixture } from "./BeatsaberHandler";


const connection = artnet.default({
    host: "127.0.0.1"
});

//Type to channel
const lastMidiKeyMap = new Map<number, number>()
const lastColorKeyMap = new Map<number, number>()

export const sendToArtnet = (channel: number, value: number) => {
    return new Promise((resolve, reject) => {
        connection.set(channel, value, (err: any, res: any) => {
            if (err) {
                console.warn("Failed to send to artnet", err);
                reject(err);
            } else {
                // console.log("Sent to artnet", channel, value)
                resolve(res);
            }
        });
    })
}

export const sendKnobToMidi = (channel: number, value: number) => {

    ipcRenderer.send('sendToMidi', {
        command: "cc",
        data: {
            controller: channel,
            value: Math.floor((value / 10) * 127),
            channel: 0
        }
    })
}

export const sendToMidi = (channel: number, value: number, fixure: BSFixture) => {
    const wantedColor = value > 4 ? 1 : 0

    if (lastColorKeyMap.has(channel)) {
        const lastColor = lastColorKeyMap.get(channel)
        if (lastColor !== wantedColor) {
            const colorToNote = lastColor === 0 ? 5 : 6
            ipcRenderer.send('sendToMidi', {
                command: "noteoff",
                data: {
                    note: (channel * 10) + colorToNote,
                    channel: 1,
                    velocity: 127,
                }
            });
            lastColorKeyMap.set(channel, wantedColor)
            ipcRenderer.send('sendToMidi', {
                command: "noteon",
                data: {
                    note: (channel * 10) + (wantedColor === 0 ? 5 : 6),
                    channel: 1,
                    velocity: 127,
                }
            });
            // console.log("Change color", wantedColor, channel)
        }
    }else{
        lastColorKeyMap.set(channel, wantedColor)
        ipcRenderer.send('sendToMidi', {
            command: "noteon",
            data: {
                note: (channel * 10) + (wantedColor === 0 ? 5 : 6),
                channel: 1,
                velocity: 127,
            }
        });
        // console.log("Change color", wantedColor, channel)
    }
    // console.log("Wanting Color", wantedColor, "command", value, "to", value > 4 ? value - 4 : value)
    value = value > 4 ? value - 4 : value

    const noteToSend = (channel * 10) + value
    if (lastMidiKeyMap.has(channel)) {
        const lastNote = lastMidiKeyMap.get(channel)
        if (lastNote === noteToSend) {
            return
        }
        //send a note off
        ipcRenderer.send('sendToMidi', {
            command: "noteoff",
            data: {
                note: lastNote,
                channel: 1,
                velocity: 127,
            }
        })
    }
    if (fixure.type === "light") {
        //send a note on

        // console.log("sendToMidi", channel, value, noteToSend)
        lastMidiKeyMap.set(channel, noteToSend)
        ipcRenderer.send('sendToMidi', {
            command: "noteon",
            data: {
                note: noteToSend,
                channel: 1,
                velocity: 127,
            }
        })
        if (value === 3 || value === 7) {
            setTimeout(() => {
                ipcRenderer.send('sendToMidi', {
                    command: "noteoff",
                    data: {
                        note: noteToSend,
                        channel: 1,
                        velocity: 127,
                    }
                })
                lastMidiKeyMap.delete(channel)
            }, 300);
        }
    }


}

// export const sendToMidi = (channel:number,value:number) => {
//     if(lastMidiKeyMap.has(channel)){
//         const lastNote = lastMidiKeyMap.get(channel)
//         //send a note off
//         virtualOutput.sendMessage([0x80 + channel, lastNote, 127])
//     }

//     //send a note on
//     virtualOutput.sendMessage([0x90 + channel, value, 127])
// }