import time
import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_rotatingEnergyInverted:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None
        # self.gain = dsp.ExpFilter(np.tile(0.01, config.cfg["frequencyBins"]),
        #                 alpha_decay=0.001, alpha_rise=0.99)
        self.description = {
            "name": "Rotating Energy Inverted",
            "description": "Energy effekt that moves around the strip",
            "effektSystemName": "visualize_rotatingEnergy",
            "group": "moving",
            "groupColor": "#44bd32",
        }
    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt
        if(self.p is None):
            self.p = np.tile(1.0, (3, stripSize))
            self.p_filt =  dsp.ExpFilter(np.tile(1, (3, stripSize)),
                        alpha_decay=0.1, alpha_rise=0.99)

        y = np.copy(y)
        # gain.update(y)
        y /= gain.value
        # print(gain.value)
        # Scale by the width of the LED strip
        y *= float((stripSize // 2) - 1)
        # Map color channels according to energy in the different freq bands
        scale = 1 * config.cfg["globalIntensity"]
        y = [i for i in y if i > 0.05]
        if len(y) < 3:
            y = np.tile(0.0, config.cfg["frequencyBins"])
        y = np.copy(y)
        y = y ** scale
        # print(mean)
        # print(mean)
        #r = int(mean * (rgbColor[0] ** scale))  #int(((np.mean(y[:len(y) // 3]**scale)) / 100) * rgbColor[0])
        #g = int(mean * (rgbColor[1] ** scale)) #int(((np.mean(y[len(y) // 3: 2 * len(y) // 3]**scale)) / 100) * rgbColor[1])
        #b = int(mean * (rgbColor[2]  ** scale)) #int(((np.mean(y[2 * len(y) // 3:]**scale)) / 100) * rgbColor[2])

        # print(r,g,b)
        # Assign color to different frequency regions
        r = int(np.mean(y[:len(y) // 3]**scale))
        g = int(np.mean(y[len(y) // 3: 2 * len(y) // 3]**scale))
        b = int(np.mean(y[2 * len(y) // 3:]**scale))
        # Assign color to different frequency regions
        if r > 255:
            r = 255
        if g > 255:
            g = 255
        if b > 255:
            b = 255
        rOff = r // 4
        gOff = g // 4
        bOff = b // 3
        self.p[0, :] = 0.0
        self.p[1, :] = 0.0
        self.p[2, :] = 0.0
        loopRange = list(range(0,stripSize, int(stripSize/ 3)))

        speed = (1.0 - (config.cfg["globalSpeed"] / 100)) * 10

        milliseconds = int(round(time.time() * 1000) / speed)
        offset = (milliseconds % (stripSize * 4)) // 3
        # print(offset)
        for i in loopRange:
            i = i - offset
            if i > stripSize:
                i = i % stripSize
            # print(i)
            # print(i,stripSize)
            self.p[0, i:i+rOff] = 255.0
            self.p[0, i-rOff:i] = 255.0

            self.p[1, i:i+gOff] = 255.0
            self.p[1, i-gOff:i] = 255.0

            self.p[2, i:i+bOff] = 255.0
            self.p[2, i-bOff:i] = 255.0
        # print(self.p[1])
        # print(self.p)
            # np.concatenate((self.p[:, ::-1], self.p), axis=1)

        #     self.p[0, i:i+10] = int(np.mean(y[:len(y) // 3]**scale) * 50) #int(rgbColor[0] * mean)
        #     self.p[1, i:i+10] = int(np.mean(y[len(y) // 3: 2 * len(y) // 3]**scale) * 50)#int(rgbColor[1] * mean)
        #     self.p[2, i:i+10] = int(np.mean(y[2 * len(y) // 3:]**scale) * 50)#int(rgbColor[2] * mean)

        # print( np.mean(y[:len(y) // 3]**scale) * 50, np.mean(y[:len(y) // 3]**scale))
        # self.p[0, :mean] = rgbColor[0]
        # self.p[0, mean:] = 0.0
        # self.p[1, :mean] = rgbColor[1]
        # self.p[1, mean:] = 0.0
        # self.p[2, :mean] = rgbColor[2]
        # self.p[2, mean:] = 0.0
        self.p_filt.update(self.p)
        self.p = np.round(self.p_filt.value)
        # Apply substantial blur to smooth the edges
        self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=4)
        self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=4)
        self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=4)
        # Set the new pixel value

        output = np.copy(self.p)
        output[0] = np.flip(output[0])
        output[1] = np.flip(output[1])
        output[2] = np.flip(output[2])

        return output
