import random
import time
import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d



class visualize_rushUpwards:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.rgbColor = random.choice(config.COLOR_DICT)
        self.description = {
            "name": "Rush upwards",
            "description": "A effekt that rushes upwards when beat changes",
            "effektSystemName": "visualize_rushUpwards",
            "group": "beat-rush",
            "groupColor": "#FFFEE",
            "bpmSensitive": True,
            "supports": ["color"]
        }

    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt
        
        if(self.p is None):
            self.p = np.tile(0, (3, stripSize // 2))
        # y = np.copy(y)
        # # gain.update(y)
        # y /= gain.value
        # # Scale by the width of the LED strip
        # y *= float((stripSize) - 1)
        # # Map color channels according to energy in the different freq bands
        # scale = 1.1 * config.cfg["globalIntensity"]
        length = int((stripSize // 2) / 10)
        self.p[:, 2:] = self.p[:, :-2]
        self.p[:,:2] = 0
        if "color" in instanceData:
            self.rgbColor = instanceData["color"]

        if "beatChanged" in instanceData:
            if instanceData["beatChanged"]:
                startPosition = int(length / 4)
                endPosition = int((length / 4) * 3)
                self.p[0, startPosition:endPosition] = self.rgbColor[0]
                self.p[1, startPosition:endPosition] = self.rgbColor[1]
                self.p[2, startPosition:endPosition] = self.rgbColor[2]

                self.p[0, :length] = gaussian_filter1d(self.p[0, :length], sigma=0.2)
                self.p[1, :length] = gaussian_filter1d(self.p[1, :length], sigma=0.2)
                self.p[2, :length] = gaussian_filter1d(self.p[2, :length], sigma=0.2)
        
        return np.concatenate((self.p, self.p[:, ::-1]), axis=1)
