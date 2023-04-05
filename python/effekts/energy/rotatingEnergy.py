import random
import time
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_rotatingEnergy:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None
        self.loopCount = None
        self.longerP = None
        # self.gain = dsp.ExpFilter(np.tile(0.01, config.cfg["frequencyBins"]),
        #                 alpha_decay=0.001, alpha_rise=0.99)
        self.description = {
            "name": "Rotating Energy",
            "description": "Energy effekt that moves around the strip",
            "effektSystemName": "visualize_rotatingEnergy",
            "group": "moving",
            "groupColor": "#44bd32",
            "supports": ["intensity"]
        }
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
        scale = 0.9 * instanceData["intensity"]
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
        
        steps = stripSize // self.loopCount
        
        loopRange = list(range(0,stripSize, steps))
        speed = (1.0 - (instanceData["speed"] / 100)) * 10

        milliseconds = int(round(time.time() * 1000) / speed)
        offset = milliseconds // self.loopCount
        # print(offset)
       
        tempP = np.tile(0, (3, self.longerP))

        for i in loopRange:
            i = i + offset
            if i > stripSize:
                i = i % stripSize
            # print(i)
            # print(i,stripSize)
            tempP[0, i:i+rOff] = 255.0
            tempP[0, i-rOff:i] = 255.0

            tempP[1, i:i+gOff] = 255.0
            tempP[1, i-gOff:i] = 255.0

            tempP[2, i:i+bOff] = 255.0
            tempP[2, i-bOff:i] = 255.0
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
        self.p_filt.update(tempP)
        tempP = np.round(self.p_filt.value)
        # Apply substantial blur to smooth the edges
        tempP[0, :] = gaussian_filter1d(tempP[0, :], sigma=4)
        tempP[1, :] = gaussian_filter1d(tempP[1, :], sigma=4)
        tempP[2, :] = gaussian_filter1d(tempP[2, :], sigma=4)
        # Set the new pixel value
        self.p = tempP[:, :stripSize]
        

        # Add the values from tempP to self.p 
        for i in range(0,2):
            self.p[i,0:(stripSize//self.loopCount)] = np.add(self.p[i,0:(stripSize//self.loopCount)], tempP[i,stripSize:])
        # self.p[:,0:(stripSize//self.loopCount)] = tempP[:,stripSize:]#np.sum([self.p[0,0:(stripSize //self.loopCount)], tempP[0, stripSize:]],axis=1)
       
        # print(len(tempP[0]),len(self.p[0]),stripSize,self.loopCount,(stripSize //self.loopCount),self.longerP)
        # print(self.p)
        
        return self.p
