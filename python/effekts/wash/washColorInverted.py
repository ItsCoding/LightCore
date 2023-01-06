import random
import time
import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_washColorInverted:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None
        self.loopCount = None
        self.longerP = None
        # self.gain = dsp.ExpFilter(np.tile(0.01, config.cfg["frequencyBins"]),
        #                 alpha_decay=0.001, alpha_rise=0.99)
        self.description = {
            "name": "Wash Color Inverted",
            "description": "Washes an RGB color across the strip",
            "effektSystemName": "visualize_washColorInverted",
            "group": "moving",
            "groupColor": "#44bd32",
            "supports": ["intensity"]
        }
        self.colors = random.sample(config.cfg["colorDict"], 2)
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
            self.p = np.tile(1.0, (3, stripSize))
            self.p_filt =  dsp.ExpFilter(np.tile(1, (3, self.longerP)),
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
        yMean = int(np.average(y[:]**scale))
        # Assign color to different frequency regions
        if yMean > 255:
            yMean = 255
        
        yOff = yMean // 4
        self.p[0, :] = self.colors[0][0] * 0.1
        self.p[1, :] = self.colors[0][1] * 0.1
        self.p[2, :] = self.colors[0][2] * 0.1
        
        steps = stripSize // self.loopCount
        
        loopRange = list(range(0,stripSize, steps))
        # speed = (1.0 - (yMean / 255)) * 10
        # if speed < 0.1:
        #     speed = 0.1

        # milliseconds = int(round(time.time() * 1000) / speed)
        # nOff = milliseconds // self.loopCount
        self.offset += int(1 + (20 * (yMean / 255)))
        # print(offset)
       
        tempP = np.tile(0, (3, self.longerP))
        tempP[0, :] = self.colors[0][0] * 0.1
        tempP[1, :] = self.colors[0][1] * 0.1
        tempP[2, :] = self.colors[0][2] * 0.1
        for i in loopRange:
            i = i + self.offset
            if i > stripSize:
                i = i % stripSize
            i = stripSize - i
            
            tempP[0, i-yOff:i+yOff] = self.colors[1][0] 
            tempP[1, i-yOff:i+yOff] = self.colors[1][1] 
            tempP[2, i-yOff:i+yOff] = self.colors[1][2] 


        self.p_filt.update(tempP)
        tempP = np.round(self.p_filt.value)
        # Apply substantial blur to smooth the edges
        tempP[0, :] = gaussian_filter1d(tempP[0, :], sigma=4)
        tempP[1, :] = gaussian_filter1d(tempP[1, :], sigma=4)
        tempP[2, :] = gaussian_filter1d(tempP[2, :], sigma=4)
        # Set the new pixel value
        self.p = tempP[:, :stripSize]
        

        # Add the values from tempP to self.p 
        # for i in range(0,2):
        #     self.p[i,0:(stripSize//self.loopCount)] = np.add(self.p[i,0:(stripSize//self.loopCount)], tempP[i,stripSize:])
             
        # self.p[:,0:(stripSize//self.loopCount)] = tempP[:,stripSize:]#np.sum([self.p[0,0:(stripSize //self.loopCount)], tempP[0, stripSize:]],axis=1)
       
        # print(len(tempP[0]),len(self.p[0]),stripSize,self.loopCount,(stripSize //self.loopCount),self.longerP)
        # print(self.p)
        
        return self.p
