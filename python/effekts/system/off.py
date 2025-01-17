from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_OFF:
    def __init__(self,id):
        self.id = id
        # self.p = None
        # self.gain = dsp.ExpFilter(np.tile(0.01, config.cfg["frequencyBins"]),
        #                 alpha_decay=0.001, alpha_rise=0.99)
        self.description = {
            "name": "OFF",
            "description": "Turns the LEDs off, should only be used by system",
            "effektSystemName": "visualize_OFF",
            "group": "system",
            "groupColor": "black",
            "supports": []
        }

    def run(self, y,stripSize,gain,additionalData):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt
        # if(self.p is None):
        #     self.p = np.tile(0, (3, stripSize))
        p = np.tile(0, (3, stripSize))
        p[0, :] = 0
        p[1, :] = 0
        p[2, :] = 0
        return np.copy(p)
