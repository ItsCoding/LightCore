from tracemalloc import start
import numpy as np
import config

class StripFrame:
    def __init__(self, stripIndex: int, stripLength: int):
        self.stripIndex = stripIndex
        self.stripLength = stripLength
        self.leds = np.array(
            [np.tile(0, stripLength), np.tile(0, stripLength), np.tile(0, stripLength)]
        )

    def addFrame(self, frame, startIndex: int, endIndex: int):
        # loop trough the three colors and add the frame to the leds array starting at the startIndex
        for i in range(3):
            if endIndex > self.stripLength:
                endIndex = self.stripLength
            # scaledUp = np.tile(0, self.stripLength)
            # print(len(frame[i]),endIndex - startIndex,endIndex,startIndex,len(range(startIndex, endIndex)))
            if len(frame[i]) < endIndex - startIndex:
                endIndex = endIndex - 1
            self.leds[i, startIndex:endIndex] = np.add(
                self.leds[i, startIndex:endIndex], frame[i]
            )
            brightness = config.cfg["brightness"] / 100
            if self.stripIndex >= 0:
                stripBrightness = config.cfg["stripBrightness"][self.stripIndex] / 100
            else:
                stripBrightness = 1
            self.leds[0, startIndex:endIndex] = [int(i * brightness * stripBrightness) for i in self.leds[0, startIndex:endIndex]]
            self.leds[1, startIndex:endIndex] = [int(i * brightness * stripBrightness) for i in self.leds[1, startIndex:endIndex]]
            self.leds[2, startIndex:endIndex] = [int(i * brightness * stripBrightness) for i in self.leds[2, startIndex:endIndex]]
        # for x in range(startIndex, endIndex):
        #     self.leds[i][x] = self.leds[i][x] + frame[i][x]
        # np.put(self.leds[i], range(startIndex, endIndex), scaledUp)
        # print(self.leds[0])

    def getLEDS(self):
        return self.leds
