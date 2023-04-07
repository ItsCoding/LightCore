import random
import time
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_blink:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.description = {
            "name": "Blink",
            "description": "Static blink effekt",
            "effektSystemName": "visualize_blink",
            "group": "Static moving",
            "groupColor": "#44bd32",
            "supports": ["speed"]
        }
        self.stepFloat = 0.0
        self.nextBlink = 0
    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        if(self.p is None):
            self.p = np.tile(1.0, (3, stripSize))
        # Make a comet over the complete stripSize at the current position
        # self.p[:, :] = 0.0
        rgbColor = config.cfg["colorDict"][0]
        length = stripSize // 15
        if self.nextBlink < time.time():
            self.p[:, :] = 0.0
            amount = int(5 * config.cfg["globalIntensity"])
            for i in range(amount):
                tempI = random.randint(0, stripSize - 1)
                for i in range(-length//2, length//2):
                    offsetI = (tempI + i) % stripSize
                    self.p[0, offsetI] = rgbColor[0]
                    self.p[1, offsetI] = rgbColor[1]
                    self.p[2, offsetI] = rgbColor[2]
            self.nextBlink = time.time() + 0.1 / (instanceData["speed"] / 100)
       
        return self.p
        