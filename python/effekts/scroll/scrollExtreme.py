import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_scrollExtreme:
    def __init__(self,id):
        self.id = id
        self.p = None
        # self.gain = dsp.ExpFilter(np.tile(0.01, config.cfg["frequencyBins"]),
        #                 alpha_decay=0.001, alpha_rise=0.99)
    def description():
        return {
            "name": "ScrollExtreme",
            "description": "Scrolls an RGB color across the strip, but in Extreme colours",
            "effektSystemName": "visualize_scrollExtreme",
            "group": "scroll",
            "groupColor": "#ff00d7",
        }
    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that originates in the center and scrolls outwards"""
        
        if(self.p is None):
            self.p = np.tile(1.0, (3, stripSize // 2))

        # self.p = np.tile(1.0, (3, config.N_PIXELS // 2))
        # print(y)
        y = y**(3 * config.cfg["globalIntensity"])
        # gain.update(y)
        # print(self.gain.value)
        y /= gain.value
        y *= 255.0

        y = [i for i in y if i > 0.05]
        if len(y) < 3:
            y = np.tile(0.1, config.cfg["frequencyBins"])
        y = np.copy(y)
        r = int(np.max(y[:len(y) // 3]))
        g = int(np.max(y[len(y) // 3: 2 * len(y) // 3]))
        b = int(np.max(y[2 * len(y) // 3:]))
        # Scrolling effect window
        self.p[:, 1:] = self.p[:, :-1]
        self.p *= 0.98
        self.p = gaussian_filter1d(self.p, sigma=0.2)
        # Create new color originating at the center
        self.p[0, 0] = r
        self.p[1, 0] = g
        self.p[2, 0] = b
        # Update the LED strip
        return np.concatenate((self.p[:, ::-1], self.p), axis=1)