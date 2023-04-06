import random
import time
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d



class visualize_colorStepRandomMultiple:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None
        
        self.description = {
            "name": "Color step random multiple",
            "description": "A effekt that changes the color on each beat step but random in position and multiple times",
            "effektSystemName": "visualize_colorStepRandomMultiple",
            "group": "simple-step",
            "groupColor": "#FFFEE",
            "bpmSensitive": True,
            "supports": ["color","stepAmount"]
        }
        self.step = 0
        self.randomSteps = []
        

    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        self.rgbColor = config.cfg["colorDict"][0]
        self.stepAmount = config.cfg["musicBeatsBar"]
        if(self.p is None):
            self.p = np.tile(0, (3, stripSize))
            for i in range(0,random.randint(1,5)):
                self.randomSteps.append(random.randint(0,self.stepAmount))
        if "color" in instanceData:
            self.rgbColor = instanceData["color"]
    
        size = stripSize // self.stepAmount
        if "beatChanged" in instanceData:
            if instanceData["beatChanged"]:
                self.step += 1
                self.randomSteps = []
                for i in range(0,random.randint(1,5)):
                    self.randomSteps.append(random.randint(0,self.stepAmount))
                if self.step >= self.stepAmount:
                    self.step = 0
                    if not "color" in instanceData:
                        self.rgbColor = random.choice(config.cfg["colorDict"])
        
        for idx,i in enumerate(range(0,stripSize,size)):
            if idx in self.randomSteps:
                self.p[0,i:i+size] = self.rgbColor[0]
                self.p[1,i:i+size] = self.rgbColor[1]
                self.p[2,i:i+size] = self.rgbColor[2]
            else:
                self.p[0,i:i+size] = 0
                self.p[1,i:i+size] = 0
                self.p[2,i:i+size] = 0

            # self.p = np.tile(0, (3, stripSize))
        self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=1.5)
        self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=1.5)
        self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=1.5)
        return self.p
