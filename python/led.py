from __future__ import print_function
from __future__ import division

import platform
import numpy as np
import config
import json
import socket

# ESP8266 uses WiFi communication
if config.DEVICE == 'virtual' or config.DEVICE == 'esp':
    _vsock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_address = ('127.0.0.1', 8080)
    _vsock.connect(server_address)

if config.DEVICE == 'esp':
    _sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

_gamma = np.load(config.GAMMA_TABLE_PATH)
"""Gamma lookup table used for nonlinear brightness correction"""

_prev_pixels = np.tile(253, (3, config.N_PIXELS))
"""Pixel values that were most recently displayed on the LED strip"""

pixels = np.tile(1, (3, config.N_PIXELS))
"""Pixel values for the LED strip"""

_is_python_2 = int(platform.python_version_tuple()[0]) == 2

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
    #strip.show()

def _update_esp8266():
    """Sends TCP packets to c# virtualizer
    """
    global pixels, _prev_pixels
    # Truncate values and cast to integer
    pixels = np.clip(pixels, 0, 255).astype(int)
    # Optionally apply gamma correc tio
    p = _gamma[pixels] if config.SOFTWARE_GAMMA_CORRECTION else np.copy(pixels)
    MAX_PIXELS_PER_PACKET = 200
    # Pixel indices
    idx = range(pixels.shape[1])
    idx = [i for i in idx if not np.array_equal(p[:, i], _prev_pixels[:, i])]
    n_packets = len(idx) // MAX_PIXELS_PER_PACKET + 1
    idx = np.array_split(idx, n_packets)
    for packet_indices in idx:
        m = '' if _is_python_2 else []
        for i in packet_indices:
            if _is_python_2:
                m += chr(i) + chr(p[0][i]) + chr(p[1][i]) + chr(p[2][i])
            else:
                m.append(i)  # Index of pixel to change
                m.append(p[0][i])  # Pixel red value
                m.append(p[1][i])  # Pixel green value
                m.append(p[2][i])  # Pixel blue value
        m = m if _is_python_2 else bytes(m)
        _sock.sendto(m, (config.UDP_IP, config.UDP_PORT))
    _prev_pixels = np.copy(p)


def update(composing):
    """Updates the LED strip values"""
    if config.DEVICE == 'virtual':
        _update_virtual(composing)
    elif config.DEVICE == 'esp':
        _update_virtual(composing)
        _update_esp8266()
    else:
        raise ValueError('Invalid device selected')


# Execute this file to run a LED strand test
# If everything is working, you should see a red, green, and blue pixel scroll
# across the LED strip continuously
if __name__ == '__main__':
    import time
    # Turn all pixels off
    pixels *= 0
    pixels[0, 0] = 255  # Set 1st pixel red
    pixels[1, 1] = 255  # Set 2nd pixel green
    pixels[2, 2] = 255  # Set 3rd pixel blue
    print('Starting LED strand test')
    while True:
        pixels = np.roll(pixels, 1, axis=1)
        update()
        time.sleep(.1)
