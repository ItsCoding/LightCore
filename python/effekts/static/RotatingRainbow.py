import random
import time
import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_rotatingRainbow:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.description = {
            "name": "Rotating rainbow",
            "description": "Static rainbow effekt that rotates",
            "effektSystemName": "visualize_rotatingRainbow",
            "group": "Static moving",
            "groupColor": "#44bd32",
        }
    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        if(self.p is None):
            self.p = np.tile(1.0, (3, stripSize))
        # Make a rainbow over the complete stripSize  
        r = np.arange(stripSize)
        g = np.arange(stripSize)
        b = np.arange(stripSize)
        speed = (1.0 - (config.cfg["globalSpeed"] / 100)) * 10

        milliseconds = int(round(time.time() * 1000) / speed)
        offset = milliseconds// 4

        for i in range(stripSize):
            iOff = i + offset
            r[i] = int(127.5 * np.sin(iOff * 0.05 + 0) + 127.5)
            g[i] = int(127.5 * np.sin(iOff * 0.05 + 2) + 127.5)
            b[i] = int(127.5 * np.sin(iOff * 0.05 + 4) + 127.5)
        self.p[0] = r
        self.p[1] = g
        self.p[2] = b
        return self.p
        