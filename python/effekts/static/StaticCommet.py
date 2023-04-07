import random
import time
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_staticCommet:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.description = {
            "name": "Static commet",
            "description": "Static commet effekt that rotates",
            "effektSystemName": "visualize_staticCommet",
            "group": "Static moving",
            "groupColor": "#44bd32",
            "supports": ["speed"]
        }
        self.position = 0
        self.stepFloat = 0.0
    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        if(self.p is None):
            self.p = np.tile(1.0, (3, stripSize))
        # Make a comet over the complete stripSize at the current position
        self.p[:, :] = 0.0
        rgbColor = instanceData["colorDict"][0]
        if "color" in instanceData:
            rgbColor = instanceData["color"]

        for i in range(0,stripSize // 3):
            tempI = (self.position + i) % stripSize
            offsetI = (tempI - 4) % stripSize
            self.p[0, tempI] = rgbColor[0]
            self.p[1, tempI] = rgbColor[1]
            self.p[2, tempI] = rgbColor[2]
            self.p[0, :offsetI] = gaussian_filter1d(self.p[0, :offsetI], sigma=4.0)
            self.p[1, :offsetI] = gaussian_filter1d(self.p[1, :offsetI], sigma=4.0)
            self.p[2, :offsetI] = gaussian_filter1d(self.p[2, :offsetI], sigma=4.0)

        # Move the position
        # print("Speed: " + str(instanceData["speed"]))
        # print("Cal:" + str(stripSize // 40) + " * " + str(100 // instanceData["speed"]))
        increment = 2 * (stripSize / 40) * (instanceData["speed"] / 100)
        self.stepFloat = self.stepFloat + increment
        if self.stepFloat > 1.0:
            self.position = self.position + int(self.stepFloat)
            self.stepFloat = 0.0
        if self.position >= stripSize:
            self.position = 0
        
       
        return self.p
        