import random
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d


class visualize_energyExtremeColor:
    def __init__(self, id):
        self.id = id
        self.p = None
        self.p_filt = None
        self.description = {
            "name": "Energy extreme Color",
            "description": "Expands from the center with increasing sound energy, but in Extreme colors",
            "effektSystemName": "visualize_energyExtremeColor",
            "group": "energy",
            "groupColor": "#5b82ec",
            "supports": ["intensity","colorDict-3"],
        }
        self.colors = random.sample(config.cfg["colorDict"], 3)

        # self.gain = dsp.ExpFilter(np.tile(0.01, config.cfg["frequencyBins"]),
        #                 alpha_decay=0.001, alpha_rise=0.99)

    def run(self, y, stripSize, gain: dsp.ExpFilter, instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt

        if self.p is None:
            self.p_filt = dsp.ExpFilter(
                np.tile(1, (3, stripSize // 2)), alpha_decay=0.1, alpha_rise=0.99
            )
        self.p = np.tile(1.0, (3, stripSize // 2))
        y = np.copy(y)
        # gain.update(y)
        y /= gain.value
        # Scale by the width of the LED strip
        y *= float((stripSize // 2) - 1)
        # Map color channels according to energy in the different freq bands
        scale = 0.85 * config.cfg["globalIntensity"]
        y = [i for i in y if i > 0.05]
        if len(y) < 3:
            y = np.tile(0.0, config.cfg["frequencyBins"])
        y = np.copy(y)
        c1 = int(np.mean(y[: len(y) // 3] ** scale))
        c2 = int(np.mean(y[len(y) // 3 : 2 * len(y) // 3] ** scale))
        c3 = int(np.mean(y[2 * len(y) // 3 :] ** scale))
        if c3 >= stripSize // 2:
            c3 = stripSize // 2 -1
        if c2 >= stripSize // 2:
            c2 = stripSize // 2 -1 
        if c1 >= stripSize // 2:
            c1 = stripSize // 2 -1
        

        # Assign color to different frequency regions
        self.p[0, :c1] =+ self.colors[0][0]
        self.p[1, :c1] =+ self.colors[0][1]
        self.p[2, :c1] =+ self.colors[0][2]

        self.p[0, :c2] =+ self.colors[1][0]
        self.p[1, :c2] =+ self.colors[1][1]
        self.p[2, :c2] =+ self.colors[1][2]

        self.p[0, :c3] =+ self.colors[2][0]
        self.p[1, :c3] =+ self.colors[2][1]
        self.p[2, :c3] =+ self.colors[2][2]

        self.p_filt.update(self.p)
        self.p = np.round(self.p_filt.value)
        # Apply substantial blur to smooth the edges
        self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=4.0)
        self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=4.0)
        self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=4.0)
        # Set the new pixel value
        return np.concatenate((self.p[:, ::-1], self.p), axis=1)
