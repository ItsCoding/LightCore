import random
import time
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d



class visualize_flashSectionRandomColor:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None
        self.rgbColor = random.choice(config.cfg["colorDict"])
        self.lastFlash = 0
        self.description = {
            "name": "Flash section random color",
            "description": "A effekt that flash a section when beat changes",
            "effektSystemName": "visualize_flashSectionRandomColor",
            "group": "beat-flash",
            "groupColor": "#FFFEE",
            "bpmSensitive": True,
            "supports": ["color","intensity"]
        }


    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt
        
        if(self.p is None):
            self.p = np.tile(0, (3, stripSize))
            self.p_filt =  dsp.ExpFilter(np.tile(1, (3, stripSize)),
                        alpha_decay=0.1, alpha_rise=0.99)

        # y = np.copy(y)
        # # gain.update(y)
        # y /= gain.value
        # # Scale by the width of the LED strip
        # y *= float((stripSize) - 1)
        # # Map color channels according to energy in the different freq bands
        # scale = 1.1 * config.cfg["globalIntensity"]
        if "color" in instanceData:
            self.rgbColor = instanceData["color"]
        randSize = random.randint(2,10)
        if "beatChanged" in instanceData:
            if instanceData["beatChanged"]:
                self.p = np.tile(0, (3, stripSize))
                self.lastFlash = int(round(time.time() * 1000))
                randPos = random.randint(0,randSize)
                randStart = int((stripSize / randSize) * randPos)
                randEnd = int((stripSize / randSize) * (randPos + 1))
                self.rgbColor = random.choice(config.cfg["colorDict"])
                self.p[0][randStart: randEnd] = self.rgbColor[0]
                self.p[1][randStart: randEnd] = self.rgbColor[1]
                self.p[2][randStart: randEnd] = self.rgbColor[2]
                self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=4.0)
                self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=4.0)
                self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=4.0)
        if self.lastFlash + (60000/(instanceData["bpm"]+1)) - 250 < int(round(time.time() * 1000)):
            self.p = np.tile(0, (3, stripSize))
        return self.p
