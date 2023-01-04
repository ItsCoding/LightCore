from __future__ import print_function
from __future__ import division

import numpy as np
import config
import json
import socket
from websocket import create_connection
import random
import time 
import esp.ackHandler as AckHandler
# ESP8266 uses WiFi communication
if config.DEVICE == "virtual" or config.DEVICE == "espv":
    ws = create_connection("ws://127.0.0.1:8080/")
    # _vsock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # server_address = ("127.0.0.1", 8080)
    # _vsock.connect(server_address)

if config.DEVICE == "esp" or config.DEVICE == "espv":
    _sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)


_gamma = np.load(config.GAMMA_TABLE_PATH)
"""Gamma lookup table used for nonlinear brightness correction"""
_prev_pixels = {}

for i in range(0, len(config.STRIP_LED_COUNTS)):
    _prev_pixels[i] = np.zeros((3, config.STRIP_LED_COUNTS[i]))


# _prev_pixels = np.tile(253, (3, config.N_PIXELS))
"""Pixel values that were most recently displayed on the LED strip"""
"""Pixel values for the LED strip"""
lastEspError = None
frameCounter = {}


def differentColor(pixels, prev_pixels, i):
    if pixels[0][i] != prev_pixels[0][i]:
        return True
    if pixels[1][i] != prev_pixels[1][i]:
        return True
    if pixels[2][i] != prev_pixels[2][i]:
        return True
    return False


def _update_virtual(composing,y,beatChange):
    global pixels, _prev_pixels, ws
    if not ws.connected:
        ws.connect("ws://127.0.0.1:8080/")
    frameDict = {}
    for key in composing:
        frame = composing[key].getLEDS()
        ledStripType = config.COLOR_CALIBRATION_ASSIGNMENTS[key]
        ledCalibration = config.cfg["colorCalibration"][ledStripType]
        frame[0] = frame[0] * ledCalibration[0] * (config.cfg["brightness"] / 100) * (config.cfg["stripBrightness"][key] / 100)
        frame[1] = frame[1] * ledCalibration[1] * (config.cfg["brightness"] / 100) * (config.cfg["stripBrightness"][key] / 100)
        frame[2] = frame[2] * ledCalibration[2] * (config.cfg["brightness"] / 100) * (config.cfg["stripBrightness"][key] / 100)
        frame = np.clip(frame, 0, 255).astype(int)
        # frame = _gamma[frame] if config.SOFTWARE_GAMMA_CORRECTION
        frame = np.copy(frame)
        frameDict[key] = frame.tolist()

    # Truncate values and cast to integer

    # Optional gamma correction
    # _prev_pixels = np.copy(sumPixels)
    # print(p)
    # ("===========================")
    ws.send(json.dumps({"frames": frameDict,"mel":y.tolist(),"beatChange": beatChange}).encode())
    # strip.show()

def capAt255(x):
    if x > 255:
        return 255
    return x

def _update_esp8266(composing):
    """Sends TCP packets to c# virtualizer"""
    global _prev_pixels
    global lastEspError
    for stripIndex in composing:
        pixelsComp = composing[stripIndex].getLEDS()
        # Truncate values and cast to integer
        pixelsComp = np.clip(pixelsComp, 0, 255).astype(int)
        # Optionally apply gamma correc tio
        p = (
            _gamma[pixelsComp]
            if config.SOFTWARE_GAMMA_CORRECTION
            else np.copy(pixelsComp)
        )
        MAX_PIXELS_PER_PACKET = 300

        ledStripType = config.COLOR_CALIBRATION_ASSIGNMENTS[stripIndex]
        ledCalibration = config.cfg["colorCalibration"][ledStripType]
        # print(ledCalibration)
        # Pixel indices
        idx = range(0,config.STRIP_LED_COUNTS[stripIndex])
        # print("Sending: ", len(idx))
        # idx = [i for i in idx if differentColor(p, _prev_pixels[stripIndex], i)]
        # if stripIndex == 0:
            # print(len(idx))
        n_packets = len(idx) // MAX_PIXELS_PER_PACKET + 1
        # print(len(idx),len(idx[0]))
        skipFrame = False
        _prev_pixels[stripIndex] = np.copy(p)
        brightness = config.cfg["brightness"] / 100
        if stripIndex >= 0:
            stripBrightness = config.cfg["stripBrightness"][stripIndex] / 100
        else:
            stripBrightness = 1
        if stripIndex in config.UDP_FRAMEDIVIDER:
            if stripIndex not in frameCounter:
                frameCounter[stripIndex] = 0
            else:
                if frameCounter[stripIndex] >= config.UDP_FRAMEDIVIDER[stripIndex]:
                    frameCounter[stripIndex] = 0
                else:
                    frameCounter[stripIndex] += 1
                    skipFrame = True

        if not skipFrame:
            if config.UDP_IPS[stripIndex] != "GROUP":

                #check wether the device is lagging behind
                deviceLag = AckHandler.getDeviceLag(config.UDP_IPS[stripIndex])
                # print("Device lagging behind: ", config.UDP_IPS[stripIndex], deviceLag)
                if deviceLag > 15:
                    pass
                else:
                    idx = np.array_split(idx, n_packets)
                    for packet_indices in idx:
                        m = []
                        for i in packet_indices:
                            offset = i // 256
                            newI = i % 256
                            m.append(offset)
                            m.append(newI)  # Index of pixel to change
                            m.append(int(capAt255(p[0][i] * ledCalibration[0] * brightness * stripBrightness)))  # Pixel red value
                            m.append(int(capAt255(p[1][i] * ledCalibration[1] * brightness * stripBrightness)))  # Pixel green value
                            m.append(int(capAt255(p[2][i] * ledCalibration[2] * brightness * stripBrightness)))  # Pixel blue value
                        # print(len(m))
                        try:
                            messageAckId = int(random.randint(0, 1000000000))
                            bytes_val = messageAckId.to_bytes(4, 'big')
                            bytes_val += bytes(m)
                            # print(m)
                            mx = bytearray(bytes_val)
                            _sock.sendto(mx, (config.UDP_IPS[stripIndex], config.UDP_PORT))
                            AckHandler.registerAckId(config.UDP_IPS[stripIndex], messageAckId)
                        except Exception as e:
                            if e != lastEspError:
                                lastEspError = str(e)
                                if config.DEBUG_LOG:
                                    print(e)
                                    print("There is something with the ESP connection....")
            # _prev_pixels = np.copy(p)
            else:
                for grp in config.UDP_GROUPS[stripIndex]:
                    if AckHandler.getDeviceLag(grp["IP"]) > 10:
                        print("Device lagging behind: ", config.UDP_IPS[stripIndex])
                    else:
                        m = []
                        # print(idx)
                        idxPart = range(grp["from"], grp["to"])
                        # if "invert" in grp:
                        # idxPart = range(grp["to"], grp["from"],1)
                        # print("Reversed:")
                        # print(idxPart)
                        n_packets = len(idx) // MAX_PIXELS_PER_PACKET + 1
                        idxPart = np.array_split(idxPart, n_packets)
                        # print(idxPart)
                        for packet_indices in idxPart:
                            for i in packet_indices:
                                # i = packet_indices[i]
                                newI = i - grp["from"]
                                if "invert" in grp:
                                    newI = grp["to"] - i
                                # print(newI)
                                offset = newI // 256
                                newI = newI % 256
                                m.append(offset)
                                m.append(newI)  # Index of pixel to change
                                # print(offset,newI)
                                m.append(int(capAt255(p[0][i] * ledCalibration[0] * brightness * stripBrightness)))  # Pixel red value
                                m.append(int(capAt255(p[1][i] * ledCalibration[1] * brightness * stripBrightness)))  # Pixel green value
                                m.append(int(capAt255(p[2][i] * ledCalibration[2] * brightness * stripBrightness)))
                            # print(len(m))
                            try:
                                mx = bytearray(m)
                                _sock.sendto(mx, (grp["IP"], config.UDP_PORT))
                            except Exception as e:
                                if e != lastEspError:
                                    lastEspError = str(e)
                                    if config.DEBUG_LOG:
                                        print(e)
                                        print(
                                            "[GROUP] There is something with the ESP connection...."
                                        )


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


def update(composing, queue2Parent,y,beatChange):

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
        _update_virtual(positiveComp,y,beatChange)
    elif config.DEVICE == "esp":
        # _update_virtual(composing)
        _update_esp8266(positiveComp)
    elif config.DEVICE == "espv":
        _update_virtual(positiveComp,y,beatChange)
        _update_esp8266(positiveComp)
    elif config.DEVICE == "null":
        pass
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
