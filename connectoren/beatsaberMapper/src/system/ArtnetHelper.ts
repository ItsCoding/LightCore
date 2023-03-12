import * as artnet from "artnet";

const connection = artnet.default({
    host: "10.40.0.156"
});

let state = false;

setInterval(() => {
    state = !state;
    sendToArtnet(100, state ? 255 : 0);
}, 1000);

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