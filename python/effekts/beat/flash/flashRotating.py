import random
import time
import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d



class visualize_flashRotating:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None
        self.rgbColor = random.choice(config.cfg["colorDict"])
        self.lastFlash = 0
        self.description = {
            "name": "Flash rotating",
            "description": "A effekt that flash a rotating when beat changes",
            "effektSystemName": "visualize_flashRotating",
            "group": "beat-flash",
            "groupColor": "#FFFEE",
            "bpmSensitive": True,
            "supports": ["color","speed"]
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
        loopRange = list(range(0,stripSize, int(stripSize/ 3)))

        speed = (1.0 - (config.cfg["globalSpeed"] / 100)) * 10

        milliseconds = int(round(time.time() * 1000) / speed)
        offset = (milliseconds % (stripSize * 4)) // 3
        length = stripSize // 20
        self.p[0, :] = 0
        self.p[1, :] = 0
        self.p[2, :] = 0
        # print(offset)
        for i in loopRange:
            i = i + offset
            if i > stripSize:
                i = i % stripSize
            # print(i)
            # print(i,stripSize)
            self.p[0, i:i+length] = self.rgbColor[0] if instanceData["beatChanged"] else self.rgbColor[0] * 0.1
            self.p[0, i-length:i] = self.rgbColor[0] if instanceData["beatChanged"] else self.rgbColor[0] * 0.1 

            self.p[1, i:i+length] = self.rgbColor[1] if instanceData["beatChanged"] else self.rgbColor[1] * 0.1 
            self.p[1, i-length:i] = self.rgbColor[1] if instanceData["beatChanged"] else self.rgbColor[1] * 0.1

            self.p[2, i:i+length] = self.rgbColor[2] if instanceData["beatChanged"] else self.rgbColor[2] * 0.1 
            self.p[2, i-length:i] = self.rgbColor[2] if instanceData["beatChanged"] else self.rgbColor[2] * 0.1 
        # if "beatChanged" in instanceData:
        #     if instanceData["beatChanged"]:
        #         self.lastFlash = int(round(time.time() * 1000))
        #         randPos = random.randint(0,8)
        #         randStart = int((stripSize / 8) * randPos)
        #         randEnd = int((stripSize / 8) * (randPos + 1))
        #         self.p[0][randStart: randEnd] = self.rgbColor[0]
        #         self.p[1][randStart: randEnd] = self.rgbColor[1]
        #         self.p[2][randStart: randEnd] = self.rgbColor[2]
        #         self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=4.0)
        #         self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=4.0)
        #         self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=4.0)
        # if self.lastFlash +(60000/(instanceData["bpm"]+1)) - 150 < int(round(time.time() * 1000)):
        #     self.p = np.tile(0, (3, stripSize))
        self.p_filt.update(self.p)
        self.p = np.round(self.p_filt.value)
        # Apply substantial blur to smooth the edges
        self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=1)
        self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=1)
        self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=1)
        return self.p
