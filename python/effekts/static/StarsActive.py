import random
import time
import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d


class visualize_starsActive:
    def __init__(self, id):
        self.id = id
        self.p = None
        self.description = {
            "name": "Stars Active",
            "description": "Tiny stars that shine with the music",
            "effektSystemName": "visualize_starsActive",
            "group": "Static moving",
            "groupColor": "#44bd32",
            "supports": ["color"],
        }
        self.activeStars = {}
        self.fallingStars = {}
        self.rgbColor = random.sample(config.cfg["colorDict"], 1)

    def run(self, y, stripSize, gain: dsp.ExpFilter, instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        if self.p is None:
            self.p = np.tile(1.0, (3, stripSize))
        # Make a rainbow over the complete stripSize

        # Get ten random positions between 0 and stripSize
        if len(self.activeStars) < 15:
            for i in range(0, random.randint(4, stripSize // 15)):
                pos = random.randint(0, stripSize - 1)
                self.activeStars[pos] = 0
        # Make a star at each position
        resetStars = False
        rgbColor = self.rgbColor[0]

        y = np.copy(y)
        y /= gain.value
        y *= float((stripSize // 2) - 1)
        scale = 1 * config.cfg["globalIntensity"]
        y = [i for i in y if i > 0.05]
        if len(y) < 3:
            y = np.tile(0.0, config.cfg["frequencyBins"])
        y = np.copy(y)
        y = y**scale

        self.p[:, :] = 0.0
        yMean = int(np.average(y[:] ** scale))
        if "color" in instanceData:
            rgbColor = instanceData["color"]
        for i in self.activeStars:
            starValue = self.activeStars[i]
            starValue = starValue + int(1 + (50 * (yMean / 255)))
            self.activeStars[i] = starValue
            if starValue > 255:
                resetStars = True
            self.p[0][i] = starValue * (rgbColor[0] / 255)
            self.p[1][i] = starValue * (rgbColor[1] / 255)
            self.p[2][i] = starValue * (rgbColor[2] / 255)

        for i in self.fallingStars:
            starValue = self.fallingStars[i]
            starValue = starValue - int(1 + (50 * (yMean / 255)))
            self.fallingStars[i] = starValue
            if starValue < 1:
                starValue = 0
            self.p[0][i] = starValue * (rgbColor[0] / 255)
            self.p[1][i] = starValue * (rgbColor[1] / 255)
            self.p[2][i] = starValue * (rgbColor[2] / 255)

        if resetStars:
            self.fallingStars = self.activeStars
            self.activeStars = {}
        self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=0.8)
        self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=0.8)
        self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=0.8)
        return self.p
