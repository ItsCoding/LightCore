import random
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_scrollExtremeColorInverted:
    def __init__(self,id):
        self.id = id
        self.p = None
        # self.gain = dsp.ExpFilter(np.tile(0.01, config.cfg["frequencyBins"]),
        #                 alpha_decay=0.001, alpha_rise=0.99)
        self.description = {
            "name": "Scroll extreme Color inverted",
            "description": "Scrolls an RGB color across the strip, but in Extreme colours",
            "effektSystemName": "visualize_scrollExtremeColorInverted",
            "group": "scroll",
            "groupColor": "#ff00d7",
            "supports": ["intensity","colorDict-3"]
        }
        self.colors = random.sample(config.cfg["colorDict"], 3)
    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that originates in the center and scrolls outwards"""
        
        if(self.p is None):
            self.p = np.tile(1.0, (3, stripSize // 2))

        # print(y)
        y = y**(3 * config.cfg["globalIntensity"])
        # gain.update(y)
        # print(self.gain.value)
        y /= gain.value
        y *= 10

        y = [i for i in y if i > 0.05]
        if len(y) < 3:
            y = np.tile(0.1, config.cfg["frequencyBins"])
        y = np.copy(y)
        r = int(np.max(y[:len(y) // 3]))
        g = int(np.max(y[len(y) // 3: 2 * len(y) // 3]))
        b = int(np.max(y[2 * len(y) // 3:]))
        # Scrolling effect window
        self.p[:, 1:] = self.p[:, :-1]
        # self.p *= 0.98
        
        # Create new color originating at the center
        self.p[0, 0] =+ self.colors[0][0] * r
        self.p[1, 0] =+ self.colors[0][1] * r
        self.p[2, 0] =+ self.colors[0][2] * r

        self.p[0, 0] =+ self.colors[1][0] * g
        self.p[1, 0] =+ self.colors[1][1] * g
        self.p[2, 0] =+ self.colors[1][2] * g

        self.p[0, 0] =+ self.colors[2][0] * b
        self.p[1, 0] =+ self.colors[2][1] * b
        self.p[2, 0] =+ self.colors[2][2] * b

        self.p = gaussian_filter1d(self.p, sigma=0.3)
        # Update the LED strip
        return np.concatenate(( self.p,self.p[:, ::-1]), axis=1)
        