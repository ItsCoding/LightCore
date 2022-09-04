import random
import time
import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

colorPalette = [
    [0,0,255],
    [0,255,0],
    [255,0,0],
    [0,255,255],
    [255,0,255],
    [255,255,0],
    [255,255,255],
    [34,166,179],
    [190,46,221]
]

class visualize_flashSectionUpwards:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None
        self.rgbColor = random.choice(colorPalette)
        self.lastFlash = 0
        self.position = 0
        self.description = {
            "name": "Flash section upwards",
            "description": "A effekt that flash a section when beat changes",
            "effektSystemName": "visualize_flashSectionUpwards",
            "group": "beat-flash",
            "groupColor": "#FFFEE",
        }
  

    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt
        
        if(self.p is None):
            self.p = np.tile(0, (3, stripSize // 2))
            self.p_filt =  dsp.ExpFilter(np.tile(1, (3, stripSize // 2)),
                        alpha_decay=0.1, alpha_rise=0.99)

        if "color" in instanceData:
            self.rgbColor = instanceData["color"]

        if "beatChanged" in instanceData:
            if instanceData["beatChanged"]:
                self.lastFlash = int(round(time.time() * 1000))
                randPos = self.position
                randStart = int(((stripSize //2) / 8) * randPos)
                randEnd = int(((stripSize // 2) / 8) * (randPos + 1))
                self.p[0][randStart: randEnd] = self.rgbColor[0]
                self.p[1][randStart: randEnd] = self.rgbColor[1]
                self.p[2][randStart: randEnd] = self.rgbColor[2]
                self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=4.0)
                self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=4.0)
                self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=4.0)
                self.position = self.position + 1
                if(self.position > 7):
                    self.position = 0
                # print(self.p)
        if self.lastFlash + 200 * config.cfg["globalIntensity"] < int(round(time.time() * 1000)):
            self.p = np.tile(0, (3, stripSize//2))
        output = np.concatenate((self.p,self.p[:, ::-1]), axis=1)
        return output
