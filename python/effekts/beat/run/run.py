import random
import time
import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d



class visualize_run:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None
        self.rgbColor = random.choice(config.cfg["colorDict"])
        self.lastFlash = 0
        self.description = {
            "name": "Running light",
            "description": "A effekt that runs across the strip and changes color on beat",
            "effektSystemName": "visualize_run",
            "group": "beat-run",
            "groupColor": "#FFFEE",
            "bpmSensitive": True,
            "supports": ["color","speed"]
        }
        self.runPosition = 0
        self.offP = None
        self.incrementPosition = True
        self.steps = 1
    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt
        
        if(self.p is None):
            self.p = np.tile(0, (3, stripSize))
            self.p_filt =  dsp.ExpFilter(np.tile(1, (3, stripSize)),
                        alpha_decay=0.1, alpha_rise=0.99)
            if stripSize > 50:
                self.steps = 3

        # y = np.copy(y)
        # # gain.update(y)
        # y /= gain.value
        # # Scale by the width of the LED strip
        # y *= float((stripSize) - 1)
        # # Map color channels according to energy in the different freq bands
        # scale = 1.1 * config.cfg["globalIntensity"]
        if "color" in instanceData:
            self.rgbColor = instanceData["color"]
        if "beatChanged" in instanceData:
            if instanceData["beatChanged"]:
                self.rgbColor = random.choice(config.cfg["colorDict"])
                self.offP = np.copy(self.p)
                self.p = np.tile(0, (3, stripSize))
                self.lastFlash = int(round(time.time() * 1000))
        if self.lastFlash + (60000/(instanceData["bpm"]+1)) - 250 < int(round(time.time() * 1000)) and self.offP is not None:
                self.p = np.copy(self.offP)
                self.offP = None
        else:
            # self.p[0][:self.runPosition] = self.rgbColor[0]
            # self.p[1][:self.runPosition] = self.rgbColor[1]
            # self.p[2][:self.runPosition] = self.rgbColor[2]
            for i in range(0,self.runPosition):

                # get random float between 1.0 and 0.9
                r = random.uniform(0.4, 1.0)
                self.p[0][i] = int(self.rgbColor[0] * r)
                self.p[1][i] = int(self.rgbColor[1] * r)
                self.p[2][i] = int(self.rgbColor[2] * r)
            if self.incrementPosition:
                self.runPosition += self.steps
            else:
                self.runPosition -= self.steps
            if self.runPosition + 1 >= stripSize:
                self.incrementPosition = False
            if self.runPosition == 0:
                self.incrementPosition = True
        self.p[0][self.runPosition:] = 0
        self.p[1][self.runPosition:] = 0
        self.p[2][self.runPosition:] = 0
        return self.p
