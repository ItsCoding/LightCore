from tracemalloc import start
import numpy as np


class StripFrame:
    def __init__(self, stripIndex: int, stripLength: int):
        self.stripIndex = stripIndex
        self.stripLength = stripLength
        self.leds = np.array([np.tile(0, stripLength), np.tile(0, stripLength), np.tile(0, stripLength)])
    
    def addFrame(self, frame, startIndex: int,endIndex: int):
        # loop trough the three colors and add the frame to the leds array starting at the startIndex
        for i in range(3):
            if endIndex > self.stripLength:
                endIndex = self.stripLength
            # scaledUp = np.tile(0, self.stripLength)
            # print(len(frame[i]),endIndex - startIndex,endIndex,startIndex,len(range(startIndex, endIndex)))
            if len(frame[i]) < endIndex - startIndex:
                endIndex = endIndex - 1
            self.leds[i, startIndex:endIndex] = frame[i]
            # np.put(self.leds[i], range(startIndex, endIndex), scaledUp)
        # print(self.leds[0])

    def getLEDS(self):
        return self.leds

