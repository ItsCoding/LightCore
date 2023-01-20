import numpy as np

class TestEffekt:
    def __init__(self,id,controllHandler,width,height,ledPositions):
        self.step = 0
        self.width = width
        self.height = height
        self.ledPositions = ledPositions 
        pass
    def run(self,audioData,propDict):
        canvas = np.zeros((self.width,self.height,3),dtype=np.uint8)
        self.step += 1
        if self.step >= self.width:
            self.step = 0
            
        # make a vertical line at the current step
        canvas[self.step:self.step+5,:] = [0,255,0]
        # print(self.step)
        # print(canvas)
        return canvas

    def onEnd(self):
        pass