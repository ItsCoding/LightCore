import random
import time
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d



class visualize_colorStep:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None
        self.rgbColor = random.choice(config.cfg["colorDict"])
        self.description = {
            "name": "Color step",
            "description": "A effekt that changes the color on each beat step",
            "effektSystemName": "visualize_colorStep",
            "group": "simple-step",
            "groupColor": "#FFFEE",
            "bpmSensitive": True,
            "supports": ["color","stepAmount"]
        }
        self.step = 0


    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        if(self.p is None):
            self.p = np.tile(0, (3, stripSize))
           
        if "color" in instanceData:
            self.rgbColor = instanceData["color"]
        self.stepAmount = config.cfg["musicBeatsBar"]
        size = stripSize // self.stepAmount
        if "beatChanged" in instanceData:
            if instanceData["beatChanged"]:
                self.step += 1
                if self.step >= self.stepAmount:
                    self.step = 0
                    if not "color" in instanceData:
                        self.rgbColor = random.choice(config.cfg["colorDict"])
        for idx,i in enumerate(range(0,stripSize,size)):
            if self.step == idx:
                self.p[0,i:i+size] = self.rgbColor[0]
                self.p[1,i:i+size] = self.rgbColor[1]
                self.p[2,i:i+size] = self.rgbColor[2]
            else:
                self.p[0,i:i+size] = 0
                self.p[1,i:i+size] = 0
                self.p[2,i:i+size] = 0

            # self.p = np.tile(0, (3, stripSize))
        self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=1.5)
        self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=1.5)
        self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=1.5)
        return self.p
