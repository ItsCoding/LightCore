import * as artnet from "artnet";
import { ipcRenderer } from "electron";
import { BSFixture } from "./BeatsaberHandler";


const connection = artnet.default({
    host: "127.0.0.1"
});

//Type to channel
const lastMidiKeyMap = new Map<number, number>()


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

export const sendToMidi = (channel: number, value: number, fixure: BSFixture) => {
    ipcRenderer.send('sendToMidi', { channel, value })
    if(value > 4){
        value = value - 4
    }
    const noteToSend = (channel * 10) + value
    if (lastMidiKeyMap.has(channel)) {
        const lastNote = lastMidiKeyMap.get(channel)
        if(lastNote === noteToSend){
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
       
        console.log("sendToMidi", channel, value, noteToSend)
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