import random
import time
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_scannerMirrored:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.description = {
            "name": "Scanner Mirrored",
            "description": "Scanner Mirrored effekt",
            "effektSystemName": "visualize_scannerMirrored",
            "group": "Static moving",
            "groupColor": "#44bd32",
            "supports": ["speed"]
        }
        self.position = 0
        self.stepFloat = 0.0
        self.up = True
    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        stripSize = stripSize // 2
        if(self.p is None):
            self.p = np.tile(1.0, (3, stripSize))
        # Make a comet over the complete stripSize at the current position
        colors = config.cfg["colorDict"]
        bgColor = colors[0]
        color = colors[1]
        self.p[0, :] = bgColor[0] * 0.15 
        self.p[1, :] = bgColor[1] * 0.15
        self.p[2, :] = bgColor[2] * 0.15
        

        scannerSize = stripSize // 5
        for i in range(-scannerSize // 2, scannerSize // 2 ):
            pos = self.position + i
            if pos > stripSize - 1:
                pos = stripSize - 1
            if pos < 0:
                pos = 0
            self.p[0, pos] = color[0] 
            self.p[1, pos] = color[1] 
            self.p[2, pos] = color[2] 

            


        self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=6.0)
        self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=6.0)
        self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=6.0)
        increment = 1 * (stripSize / 40) * (instanceData["speed"] / 100)
        self.stepFloat = self.stepFloat + increment
        if self.stepFloat > 1.0:
            if self.up:
                self.position = self.position + int(self.stepFloat)
            else:
                self.position = self.position - int(self.stepFloat)
            self.stepFloat = 0.0

        if self.position >= stripSize - 1:
            self.position = stripSize - 1
            self.up = False
        if self.position <= 0:
            self.position = 0
            self.up = True
        
       
        return np.concatenate((self.p[:, ::-1], self.p), axis=1)
        