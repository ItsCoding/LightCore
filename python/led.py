from __future__ import print_function
from __future__ import division

import numpy as np
import config
import json
import socket

# ESP8266 uses WiFi communication
if config.DEVICE == "virtual" or config.DEVICE == "espv":
    _vsock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_address = ("127.0.0.1", 8080)
    _vsock.connect(server_address)

if config.DEVICE == "esp" or config.DEVICE == "espv":
    _sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

_gamma = np.load(config.GAMMA_TABLE_PATH)
"""Gamma lookup table used for nonlinear brightness correction"""
# _prev_pixels = {}
# _prev_pixels = np.tile(253, (3, config.N_PIXELS))
"""Pixel values that were most recently displayed on the LED strip"""

pixels = np.tile(1, (3, config.STRIP_LED_COUNTS[0]))
"""Pixel values for the LED strip"""
lastEspError = None


def _update_virtual(composing):

    global pixels, _prev_pixels, _vsock
    frameDict = {}
    # sumPixels = np.array([[],[],[]])
    for key in composing:
        frame = composing[key].getLEDS()
        frame = np.clip(frame, 0, 255).astype(int)
        # frame = _gamma[frame] if config.SOFTWARE_GAMMA_CORRECTION else
        frame = np.copy(frame)
        # sumPixels += frame
        frameString = ""
        frameDict[key] = frame.tolist()

    # Truncate values and cast to integer

    # Optional gamma correction
    # _prev_pixels = np.copy(sumPixels)
    # print(p)
    # print("===========================")
    _vsock.send(json.dumps(frameDict).encode())
    # strip.show()


def _update_esp8266(composing):
    """Sends TCP packets to c# virtualizer"""
    # global pixels, _prev_pixels
    global lastEspError
    for compIndex in composing:
        pixelsComp = composing[compIndex].getLEDS()
        # Truncate values and cast to integer
        pixelsComp = np.clip(pixelsComp, 0, 255).astype(int)
        # Optionally apply gamma correc tio
        p = (
            _gamma[pixelsComp]
            if config.SOFTWARE_GAMMA_CORRECTION
            else np.copy(pixelsComp)
        )
        MAX_PIXELS_PER_PACKET = 270
        # Pixel indices
        idx = range(pixelsComp.shape[1])
        # print("Sending: ", len(idx))
        # idx = [i for i in idx if not np.array_equal(p[:, i], _prev_pixels[:, i])]
        n_packets = len(idx) // MAX_PIXELS_PER_PACKET + 1
        # print(len(idx),len(idx[0]))
        if config.UDP_IPS[compIndex] != "GROUP":
            idx = np.array_split(idx, n_packets)
            for packet_indices in idx:
                m = []
                for i in packet_indices:
                    offset = i // 256
                    newI = i % 256
                    m.append(offset)
                    m.append(newI)  # Index of pixel to change
                    m.append(p[0][i])  # Pixel red value
                    m.append(p[1][i])  # Pixel green value
                    m.append(p[2][i])  # Pixel blue value
                # print(len(m))
                try:
                    mx = bytearray(m)
                    _sock.sendto(mx, (config.UDP_IPS[compIndex], config.UDP_PORT))
                except Exception as e:
                    if e != lastEspError:
                        lastEspError = str(e)
                        print(e)
                        print("There is something with the ESP connection....")
        # _prev_pixels = np.copy(p)
        else:
            for grp in config.UDP_GROUPS[compIndex]:
                m = []
                # print(idx)
                idxPart = range(grp["from"] , grp["to"])
                # print(idxPart)
                for i in idxPart:
                    newI = i
                        # print(i)
                    if "offset" in grp:
                        newI = newI - grp["offset"]
                    offset = newI // 256
                    newI = newI % 256
                   
                    m.append(offset)
                    m.append(newI)  # Index of pixel to change
                    # print(offset,newI)
                    m.append(p[0][i])  # Pixel red value
                    m.append(p[1][i])  # Pixel green value
                    m.append(p[2][i])  # Pixel blue value
                # print(len(m))
                try:
                    # if grp["from"] == 270:
                        # print(m)
                    mx = bytearray(m)
                    _sock.sendto(mx, (grp["IP"], config.UDP_PORT))
                except Exception as e:
                    if e != lastEspError:
                        lastEspError = str(e)
                        print(e)
                        print("There is something with the ESP connection....")


def _updateClient(composing, queue2Parent):
    global pixels, _prev_pixels, _vsock
    frameDict = {}
    # sumPixels = np.array([[],[],[]])
    for key in composing:
        frame = composing[key].getLEDS()
        frame = np.clip(frame, 0, 255).astype(int)
        frame = np.copy(frame)
        frameDict[key] = frame.tolist()
    queue2Parent.put(
        json.dumps({"type": "return.preview.frameDict", "message": frameDict})
    )


def update(composing, queue2Parent):

    positiveComp = {}
    negativeComp = {}
    for key in composing:
        if key >= 0:
            positiveComp[key] = composing[key]
        else:
            negativeComp[key] = composing[key]

    if len(negativeComp) > 0:
        _updateClient(negativeComp, queue2Parent)

    """Updates the LED strip values"""
    if config.DEVICE == "virtual":
        _update_virtual(positiveComp)
    elif config.DEVICE == "esp":
        # _update_virtual(composing)
        _update_esp8266(positiveComp)
    elif config.DEVICE == "espv":
        _update_virtual(positiveComp)
        _update_esp8266(positiveComp)
    else:
        raise ValueError("Invalid device selected")


# Execute this file to run a LED strand test
# If everything is working, you should see a red, green, and blue pixel scroll
# across the LED strip continuously
if __name__ == "__main__":
    import time

    # Turn all pixels off
    # pixels *= 0
    # pixels[0, 0] = 255  # Set 1st pixel red
    # pixels[1, 1] = 255  # Set 2nd pixel green
    # pixels[2, 2] = 255  # Set 3rd pixel blue
    print("Starting LED strand test")
    while True:
        pixels = np.roll(pixels, 1, axis=1)
        update()
        time.sleep(0.1)
