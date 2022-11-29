import random
import time
import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d



class visualize_run:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None
        self.colors = random.sample(config.cfg["colorDict"], 2)
        self.lastFlash = 0
        self.loopCount = None
        self.longerP = None
        self.description = {
            "name": "Running light",
            "description": "A effekt that runs across the strip and changes color on beat",
            "effektSystemName": "visualize_run",
            "group": "moving",
            "groupColor": "#FFFEE",
            "supports": ["color","speed"]
        }
        self.runPosition = 0
        self.startRunPosition = 0
        self.offP = None
        self.incrementPosition = True
        self.steps = 1
        self.unlockColor = False
        self.offset = 0
    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt
        
        if(self.p is None):
            
            if "loopCount" in instanceData and instanceData["loopCount"] is not None:
                self.loopCount = instanceData["loopCount"]
            else:
                if(stripSize >50):
                    self.loopCount = random.randint(3,5)
                else:  
                    self.loopCount = random.randint(1,3)
            self.longerP = stripSize + (stripSize // self.loopCount)
            self.p_filt =  dsp.ExpFilter(np.tile(1, (3, self.longerP)),
                        alpha_decay=0.1, alpha_rise=0.99)
            if stripSize > 50:
                self.steps = 3
        scale = 1 * config.cfg["globalIntensity"]
        y /= gain.value
        y *= float((stripSize // 2) - 1)
        y = [i for i in y if i > 0.05]
        if len(y) < 3:
            y = np.tile(0.0, config.cfg["frequencyBins"])
        y = np.copy(y)
        
        ySc = y ** scale
        yMean = int(np.average(ySc[:]**scale))     

        if yMean > 255:
            yMean = 255
        yOff = yMean // 4
        self.p = np.tile(0, (3, stripSize))
        steps = stripSize // self.loopCount
        
        loopRange = list(range(0,stripSize, steps))
        self.offset += int(1 + (20 * (yMean / 255)))

        tempP = np.tile(0, (3, self.longerP))
        if self.runPosition == 0 and self.startRunPosition == 0:
            tempP[:,:] = 0
        else:
            tempP[0, self.startRunPosition:self.runPosition] = int(self.colors[0][0] * 0.25)
            tempP[1, self.startRunPosition:self.runPosition] = int(self.colors[0][1] * 0.25)
            tempP[2, self.startRunPosition:self.runPosition] = int(self.colors[0][2] * 0.25)

        for i in loopRange:
            i = i + self.offset
            if i > stripSize:
                i = i % stripSize
            
            tempP[0, i-yOff:i+yOff] = self.colors[1][0] 
            tempP[1, i-yOff:i+yOff] = self.colors[1][1] 
            tempP[2, i-yOff:i+yOff] = self.colors[1][2] 
        self.p_filt.update(tempP)
        tempP = np.round(self.p_filt.value)
        # Apply substantial blur to smooth the edges
        tempP[0, :] = gaussian_filter1d(tempP[0, :], sigma=4)
        tempP[1, :] = gaussian_filter1d(tempP[1, :], sigma=4)
        tempP[2, :] = gaussian_filter1d(tempP[2, :], sigma=4)

        # if "beatCount" in instanceData:
        #     if instanceData["beatCount"] % config.cfg["musicBeatsBar"] == 0:
        #         if self.unlockColor:
        #             self.colors = random.sample(config.cfg["colorDict"], 2)
        #             self.offP = np.copy(self.p)
        #             self.p = np.tile(0, (3, stripSize))
        #             self.lastFlash = int(round(time.time() * 1000))
        #             self.unlockColor = False
        #     else:
        #         self.unlockColor = True
        # if self.lastFlash + (60000/(instanceData["bpm"]+1)) - 250 < int(round(time.time() * 1000)) and self.offP is not None:
        #         self.p = np.copy(self.offP)
        #         self.offP = None
        # else:
            # for i in range(self.startRunPosition,self.runPosition):
        self.p[0][self.startRunPosition:self.runPosition] = tempP[0][self.startRunPosition:self.runPosition]
        self.p[1][self.startRunPosition:self.runPosition] = tempP[1][self.startRunPosition:self.runPosition]
        self.p[2][self.startRunPosition:self.runPosition] = tempP[2][self.startRunPosition:self.runPosition]

        if self.incrementPosition:
            self.runPosition += self.steps
        else:
            self.startRunPosition += self.steps

        if self.runPosition + 1 >= stripSize:
            self.incrementPosition = False
        if self.startRunPosition + 1 >= stripSize:
            self.incrementPosition = True
            self.colors = random.sample(config.cfg["colorDict"], 2)
            self.startRunPosition = 0
            self.runPosition = 0
        return self.p
