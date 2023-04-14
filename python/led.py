from __future__ import print_function
from __future__ import division
from datetime import datetime
import numpy as np
import copy
from config import config
import json
import socket
from websocket import create_connection
import random
import time 
import multiprocessing
from functools import partial

import esp.ackHandler as AckHandler
# ESP8266 uses WiFi communication
if config.DEVICE == "virtual" or config.DEVICE == "espv":
    ws = create_connection(config.DESIGNER_WS_URL)
    lastWSURL = config.DESIGNER_WS_URL
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
pool = None

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
    try:
        if config.DESIGNER_WS_URL != lastWSURL:
            ws.close()
        if not ws.connected:
            ws.connect(config.DESIGNER_WS_URL)
        frameDict = {}
        for key in composing:
            frame = composing[key].getLEDS()
            ledStripType = config.COLOR_CALIBRATION_ASSIGNMENTS[key]
            ledCalibration = config.cfg["colorCalibration"][ledStripType.upper()]
            # print("Brightness: " + str(config.cfg["brightness"]))
            frame[0] = frame[0] * ledCalibration[0] * (config.cfg["brightness"] / 100) * (config.cfg["stripBrightness"][str(key)] / 100)
            frame[1] = frame[1] * ledCalibration[1] * (config.cfg["brightness"] / 100) * (config.cfg["stripBrightness"][str(key)] / 100)
            frame[2] = frame[2] * ledCalibration[2] * (config.cfg["brightness"] / 100) * (config.cfg["stripBrightness"][str(key)] / 100)
            frame = np.clip(frame, 0, 255).astype(int)
            # frame = _gamma[frame] if config.SOFTWARE_GAMMA_CORRECTION
            frame = np.copy(frame)
            frameDict[key] = frame.tolist()
        ws.send(json.dumps({"frames": frameDict,"mel":y.tolist(),"beatChange": beatChange}).encode())
    except Exception as e:
        ws.close()
        pass

def capAt255(x):
    if x > 255:
        return 255
    return x

def updateEspStrip(stripIndex,composing,cfgInstance,ackData):
    global lastEspError
    packetIDs = []
    # check if composing exists for stripIndex
    if stripIndex not in composing:
        return

    pixelsComp = composing[stripIndex].getLEDS()
    # Truncate values and cast to integer
    pixelsComp = np.clip(pixelsComp, 0, 255).astype(int)
    # Optionally apply gamma correc tio
    p = (
        _gamma[pixelsComp]
        if cfgInstance["SOFTWARE_GAMMA_CORRECTION"]
        else np.copy(pixelsComp)
    )
    MAX_PIXELS_PER_PACKET = 300

    ledStripType = cfgInstance["COLOR_CALIBRATION_ASSIGNMENTS"][stripIndex]
    ledCalibration = cfgInstance["cfg"]["colorCalibration"][ledStripType]
    # print(ledCalibration)
    # Pixel indices
    try:
        idx = range(0,cfgInstance["STRIP_LED_COUNTS"][stripIndex])
    except:
        print("Error: ", stripIndex, cfgInstance["STRIP_LED_COUNTS"])
    # print("Sending: ", len(idx))
    # idx = [i for i in idx if differentColor(p, _prev_pixels[stripIndex], i)]
    # if stripIndex == 0:
        # print(len(idx))
    n_packets = len(idx) // MAX_PIXELS_PER_PACKET + 1
    # print(len(idx),len(idx[0]))
    skipFrame = False
    _prev_pixels[stripIndex] = np.copy(p)
    brightness = cfgInstance["cfg"]["brightness"] / 100
    if stripIndex >= 0:
        stripBrightness = cfgInstance["cfg"]["stripBrightness"][str(stripIndex)] / 100
    else:
        stripBrightness = 1
    if stripIndex in cfgInstance["UDP_FRAMEDIVIDER"]:
        if stripIndex not in frameCounter:
            frameCounter[stripIndex] = 0
        else:
            if frameCounter[stripIndex] >= cfgInstance["UDP_FRAMEDIVIDER"][stripIndex]:
                frameCounter[stripIndex] = 0
            else:
                frameCounter[stripIndex] += 1
                skipFrame = True
    brightnesCalc = brightness * stripBrightness
    if not skipFrame:
        if cfgInstance["UDP_IPS"][stripIndex] != "GROUP":
            isLCPProtocol = False
            acceptsAcknowlegeId = False
            if cfgInstance["UDP_IPS"][stripIndex] in cfgInstance["ESP_PROTOCOLS"]:
                if cfgInstance["ESP_PROTOCOLS"][cfgInstance["UDP_IPS"][stripIndex]] == "LCP":
                    isLCPProtocol = True
                if cfgInstance["ESP_PROTOCOLS"][cfgInstance["UDP_IPS"][stripIndex]] == "LCP+":
                    isLCPProtocol = True
                    acceptsAcknowlegeId = True
                
            #check wether the device is lagging behind
            deviceLag = 0
            if cfgInstance["UDP_IPS"][stripIndex] in ackData:
                deviceLag = ackData[cfgInstance["UDP_IPS"][stripIndex]]
            if isLCPProtocol:
                idx = np.array_split(idx, n_packets)
            else:
                idx = [idx]
            # print("Device lagging behind: ", cfgInstance["UDP_IPS"][stripIndex], deviceLag)
            if deviceLag > cfgInstance["ESP_MAX_FRAMES_SKIPPED"] * len(idx) and isLCPProtocol:
                pass
                # now = datetime.now()
                # date_time = now.strftime("%H:%M:%S")
                # print("[" + date_time + "] Device lagging behind: ", cfgInstance["UDP_IPS"][stripIndex], cfgInstance["ESP_MAX_FRAMES_SKIPPED"] * len(idx),deviceLag)
            else:
               
                bytes_val = b''
                udpPort = 7777
                if isLCPProtocol:
                    udpPort = cfgInstance["UDP_PORT_LCP"] 
                    if acceptsAcknowlegeId:
                        messageAckId = int(random.randint(0, 1000000000))
                        bytes_val += messageAckId.to_bytes(4, 'big')
                        packetIDs.append({
                            "id": messageAckId,
                            "ip": cfgInstance["UDP_IPS"][stripIndex]
                            })
                else:
                    udpPort = cfgInstance["UDP_PORT_WLED"]
                    # bytes_val += bytes("H","ascii")[0].to_bytes(1,"big")
                    # bytes_val += int(1).to_bytes(1, 'big')
                    # bytes_val += int(3).to_bytes(1, 'big')
                    # print(len(bytes_val))
                for packet_indices in idx:
                    m = []
                   
                    for i in packet_indices:
                        copyI = i
                        if i >= len(p[0]):
                            break
                        
                        if stripIndex in cfgInstance["UDP_INDEX_OFFSET"]:
                            copyI = i + cfgInstance["UDP_INDEX_OFFSET"][stripIndex]

                        offset = copyI // 256
                        newI = copyI % 256
                        # if "invert" in grp and grp["invert"]:
                        #     newI = grp["to"] - i
                        # print(len(p[0]), stripIndex,cfgInstance.STRIP_LED_COUNTS[stripIndex],i)
                        # if newI == 0:
                            # print("NewI is 0")
    
                        if isLCPProtocol:
                            appendM = [
                                offset,
                                newI,
                                int(capAt255(p[0][i] * ledCalibration[0]) * brightnesCalc),
                                int(capAt255(p[1][i] * ledCalibration[1]) * brightnesCalc),
                                int(capAt255(p[2][i] * ledCalibration[2]) * brightnesCalc)
                            ]
                            bytes_val += bytes(appendM)
                        else:
                            appendM = [
                                # newI,
                                int(capAt255(p[0][i] * ledCalibration[0]) * brightnesCalc),
                                int(capAt255(p[1][i] * ledCalibration[1]) * brightnesCalc),
                                int(capAt255(p[2][i] * ledCalibration[2]) * brightnesCalc)
                            ]
                            bytes_val += bytes(appendM)
                    try:
                        mx = bytearray(bytes_val)
                        _sock.sendto(mx, (cfgInstance["UDP_IPS"][stripIndex], udpPort))
                    except Exception as e:
                        pass
                        # if e != lastEspError:
                        #     lastEspError = str(e)
                        #     if cfgInstance["DEBUG_LOG"]:
                        #         print(e)
                        #         print("There is something with the ESP connection....")
                        # else:
                        #     pass
        else:
            for grp in cfgInstance["UDP_GROUPS"][stripIndex]:
                m = []
                # print(idx)
                idxPart = range(grp["from"], grp["to"])
                isLCPProtocol = False
                acceptsAcknowlegeId = False
                if grp["IP"] in cfgInstance["ESP_PROTOCOLS"]:
                    if cfgInstance["ESP_PROTOCOLS"][grp["IP"]] == "LCP":
                        isLCPProtocol = True
                    if cfgInstance["ESP_PROTOCOLS"][grp["IP"]] == "LCP+":
                        isLCPProtocol = True
                        acceptsAcknowlegeId = True
                # if "invert" in grp:
                # idxPart = range(grp["to"], grp["from"],1)
                # print("Reversed:")
                # print(idxPart)
                n_packets = len(idxPart) // MAX_PIXELS_PER_PACKET + 1
                if isLCPProtocol:
                    idxPart = np.array_split(idxPart, n_packets)
                else:
                    idxPart = [idxPart]
                
                deviceLag = 0
                if grp["IP"] in ackData:
                    deviceLag = ackData[grp["IP"]]

                if deviceLag > cfgInstance["ESP_MAX_FRAMES_SKIPPED"] * len(idxPart):
                    pass
                #     now = datetime.now()
                #     date_time = now.strftime("%H:%M:%S")
                #     print("[" + date_time + "] Device lagging behind: ", grp["IP"],cfgInstance["UDP_IPS"][stripIndex], cfgInstance["ESP_MAX_FRAMES_SKIPPED"] * len(idx),deviceLag)
                else:
                    # print(idxPart)
                    for packet_indices in idxPart:
                        udpPort = 7777
                        bytes_val = b''
                        if isLCPProtocol:
                            udpPort = cfgInstance["UDP_PORT_LCP"]
                            if acceptsAcknowlegeId:
                                messageAckId = int(random.randint(0, 1000000000))
                                bytes_val += messageAckId.to_bytes(4, 'big')
                                packetIDs.append({
                                    "id": messageAckId,
                                    "ip": grp["IP"]
                                })
                        else:
                            udpPort = cfgInstance["UDP_PORT_WLED"]
                            # bytes_val += int(2).to_bytes(1, 'big')
                            # bytes_val += int(3).to_bytes(1, 'big')
                        
                       
                        for i in packet_indices:
                            # i = packet_indices[i]
                            newI = i - grp["from"]
                            if "invert" in grp and grp["invert"]:
                                newI = grp["to"] - i
                            # print(newI)
                            offset = newI // 256
                            newI = newI % 256
                            if isLCPProtocol:
                                appendM = [
                                    offset,
                                    newI,
                                    int(capAt255(p[0][i] * ledCalibration[0]) * brightnesCalc),
                                    int(capAt255(p[1][i] * ledCalibration[1]) * brightnesCalc),
                                    int(capAt255(p[2][i] * ledCalibration[2]) * brightnesCalc)
                                ]
                                bytes_val += bytes(appendM)
                            else:
                                appendM = [
                                    # newI,
                                    int(capAt255(p[0][i] * ledCalibration[0]) * brightnesCalc),
                                    int(capAt255(p[1][i] * ledCalibration[1]) * brightnesCalc),
                                    int(capAt255(p[2][i] * ledCalibration[2]) * brightnesCalc)
                                ]
                                bytes_val += bytes(appendM)
                        # print(len(m))
                        try:
                            mx = bytearray(bytes_val)
                            _sock.sendto(mx, (grp["IP"], udpPort))
                        except Exception as e:
                            pass
                            # if e != lastEspError:
                            #     lastEspError = str(e)
                            #     if cfgInstance["DEBUG_LOG"]:
                            #         print(e)
                            #         print(
                            #             "[GROUP] There is something with the ESP connection...."
                            #         )
                            #     else:
                            #         pass
    return packetIDs

def _update_esp8266(composing):
    """Sends TCP packets to c# virtualizer"""
    global _prev_pixels
    global lastEspError
    # with multiprocessing.Pool() as pool:
    # results = pool.map(test, composing)
    # print(range(len(composing)))
    # print(config.STRIP_LED_COUNTS)

    configClone = {
        "STRIP_LED_COUNTS": config.STRIP_LED_COUNTS,
        "cfg": config.cfg,
        "COLOR_CALIBRATION_ASSIGNMENTS": config.COLOR_CALIBRATION_ASSIGNMENTS,
        "UDP_IPS": config.UDP_IPS,
        "SOFTWARE_GAMMA_CORRECTION": config.SOFTWARE_GAMMA_CORRECTION,
        "UDP_FRAMEDIVIDER": config.UDP_FRAMEDIVIDER,
        "UDP_PORT_LCP": config.UDP_PORT_LCP,
        "UDP_PORT_WLED": config.UDP_PORT_WLED,
        "UDP_GROUPS": config.UDP_GROUPS,
        "ESP_MAX_FRAMES_SKIPPED": config.ESP_MAX_FRAMES_SKIPPED,
        "DEBUG_LOG": config.DEBUG_LOG,
        "ESP_PROTOCOLS": config.ESP_PROTOCOLS,
        "UDP_INDEX_OFFSET": config.UDP_INDEX_OFFSET,
    }
    # print("=======================")
    allDeviceLag = AckHandler.getAllDeviceLag()
    updateEspStrip_with_static_arg = partial(updateEspStrip, composing=composing,cfgInstance=configClone,ackData=allDeviceLag)
    # for i in range(len(composing)):
    #     updateEspStrip_with_static_arg(i)
    results = pool.map(updateEspStrip_with_static_arg, range(len(composing)))
    if results is not None:
        for result in results:
            if result is not None:
                for msg in result:
                    AckHandler.registerAckId(msg["ip"], msg["id"])
    # with concurrent.futures.ThreadPoolExecutor() as executor:
    #     results = [executor.submit(updateEspStrip, i,composing) for i in composing]
    #     for future in concurrent.futures.as_completed(results):
    #         pass
            # Do something with the result

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
    global pool
    if pool is None:
        pool = multiprocessing.Pool()
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
    # pixels *= 0x
    # pixels[0, 0] = 255  # Set 1st pixel red
    # pixels[1, 1] = 255  # Set 2nd pixel green
    # pixels[2, 2] = 255  # Set 3rd pixel blue
    print("Starting LED strand test")
    while True:
        pixels = np.roll(pixels, 1, axis=1)
        update()
        time.sleep(0.1)
