import random
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_Abbau:
    def __init__(self,id):
        self.id = id
        # self.p = None
        # self.gain = dsp.ExpFilter(np.tile(0.01, config.cfg["frequencyBins"]),
        #                 alpha_decay=0.001, alpha_rise=0.99)
        self.rgbColor = [255,173,10]
        self.description = {
            "name": "Abbaulicht",
            "description": "Sets all LEDs to a specific color",
            "effektSystemName": "visualize_Abbau",
            "group": "system",
            "groupColor": "black",
            "supports": []
        }

    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt
        # if(self.p is None):
        #     self.p = np.tile(0, (3, stripSize))
        rgbColor = self.rgbColor
        if "color" in instanceData:
            rgbColor = instanceData["color"]
        p = np.tile(0, (3, stripSize))
        p[0, :] = rgbColor[0]
        p[1, :] = rgbColor[1]
        p[2, :] = rgbColor[2]
        return np.copy(p)
