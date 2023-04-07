import random
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d




class visualize_energyRGB:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None
        
        # self.gain = dsp.ExpFilter(np.tile(0.01, config.cfg["frequencyBins"]),
        #                 alpha_decay=0.001, alpha_rise=0.99)
        self.description = {
            "name": "Energy RGB",
            "description": "Expands from the center with increasing sound energy but in random static Colors",
            "effektSystemName": "visualize_energyRGB",
            "group": "energy",
            "groupColor": "#5b82ec",
            "supports": ["intensity"]
        }
    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt
        self.rgbColor = instanceData["colorDict"][0]
        if(self.p is None):
            self.p = np.tile(1.0, (3, stripSize // 2))
            self.p_filt =  dsp.ExpFilter(np.tile(1, (3, stripSize // 2)),
                        alpha_decay=0.1, alpha_rise=0.99)
        # print(self.rgbColor)
        rgbColor = self.rgbColor
        if "color" in instanceData:
            rgbColor = instanceData["color"]
        y = np.copy(y)
        # gain.update(y)
        y /= gain.value 
        # print(gain.value)
        # Scale by the width of the LED strip
        y *= float((stripSize // 2) - 1)
        # Map color channels according to energy in the different freq bands
        scale = 0.95 * instanceData["intensity"]
        y = [i for i in y if i > 0.05]
        if len(y) < 3:
            y = np.tile(0.0, config.cfg["frequencyBins"])
        y = np.copy(y)
        mean = int(((np.mean(y) / 100) * stripSize) ** scale)
        # print(mean)
        # print(mean)
        #r = int(mean * (rgbColor[0] ** scale))  #int(((np.mean(y[:len(y) // 3]**scale)) / 100) * rgbColor[0])
        #g = int(mean * (rgbColor[1] ** scale)) #int(((np.mean(y[len(y) // 3: 2 * len(y) // 3]**scale)) / 100) * rgbColor[1])
        #b = int(mean * (rgbColor[2]  ** scale)) #int(((np.mean(y[2 * len(y) // 3:]**scale)) / 100) * rgbColor[2])

        # r = int(np.mean(y[:len(y) // 3]**scale))
        # g = int(np.mean(y[len(y) // 3: 2 * len(y) // 3]**scale))
        # b = int(np.mean(y[2 * len(y) // 3:]**scale))


        # print(r,g,b)
        # Assign color to different frequency regions
        self.p[0, :mean] = rgbColor[0]
        self.p[0, mean:] = 0.0
        self.p[1, :mean] = rgbColor[1]
        self.p[1, mean:] = 0.0
        self.p[2, :mean] = rgbColor[2]
        self.p[2, mean:] = 0.0
        self.p_filt.update(self.p)
        self.p = np.round(self.p_filt.value)
        # Apply substantial blur to smooth the edges
        self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=4.0)
        self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=4.0)
        self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=4.0)
        # Set the new pixel value
        return np.concatenate((self.p[:, ::-1], self.p), axis=1)
