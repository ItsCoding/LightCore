from array import array
from config import config
from customTypes.activeEffekt import ActiveEffekt
import numpy as np
import dsp
import time


from customTypes.frequencyRange import FrequencyRange
from customTypes.stripFrame import StripFrame
runningEffekts: list = []
gain = dsp.ExpFilter(np.tile(0.01, config.cfg["frequencyBins"]),
                         alpha_decay=0.001, alpha_rise=0.99)
# Add a new effekt to the composition
def addEffekt(effekt, frequencyRange: array, stripIndex: int, ledStartIndex: int, ledEndIndex: int, instanceData: dict = {}, zIndex: int = 0):
    realIndex = stripIndex
    if(realIndex < 0):
        realIndex = (realIndex * -1 ) - 5
    if realIndex >= config.STRIP_COUNT:
        return

    if ledEndIndex > config.STRIP_LED_COUNTS[realIndex]:
        print("ledEndIndex is out of range", stripIndex, ledEndIndex, config.STRIP_LED_COUNTS[stripIndex])
        return
    runningEffekts.append(ActiveEffekt(effekt, frequencyRange, stripIndex, ledStartIndex, ledEndIndex,instanceData,zIndex))
    runningEffekts.sort(key=lambda x: x.zIndex, reverse=True)

# def getFrequencyRangeByEnum(frequencyRange: FrequencyRange):
#    return FrequencyRange[frequencyRange]
def clear():
    runningEffekts.clear()

#needs to be tested
def removeElementById(id):
    runningEffekts[:] = [effekt for effekt in runningEffekts if effekt.effekt.id != id]
    runningEffekts.sort(key=lambda x: x.zIndex, reverse=True)

def removeElementByStripIndex(stripIndex):
    runningEffekts[:] = [effekt for effekt in runningEffekts if effekt.stripIndex != stripIndex]
    runningEffekts.sort(key=lambda x: x.zIndex, reverse=True)

def getEffekts():
    return runningEffekts

def getEffektByStripIndex(stripIndex):
    return [effekt for effekt in runningEffekts if effekt.stripIndex == stripIndex]

# Get the renderd composition output
def getComposition(frequencyBins,vis,beatChanged):
    frameDict = {}
    effekt: ActiveEffekt
    gain.update(frequencyBins)
    timeDict = {}

    for effekt in runningEffekts:
        stipLength = effekt.ledEndIndex - effekt.ledStartIndex
        realIndex = effekt.stripIndex
        if(realIndex < 0):
            realIndex = (realIndex * -1 ) - 5
        if realIndex >= len(config.STRIP_LED_COUNTS):
            continue
        if stipLength > config.STRIP_LED_COUNTS[realIndex]:
            stipLength = config.STRIP_LED_COUNTS[realIndex]

        
        if not effekt.stripIndex in frameDict:
            frameDict[effekt.stripIndex] = StripFrame(effekt.stripIndex, config.STRIP_LED_COUNTS[realIndex])

        frequencyRange = effekt.frequencyRange
        tempBins = np.tile(0.0, config.cfg["frequencyBins"])
        np.put(tempBins, range(frequencyRange[0], frequencyRange[1]), frequencyBins)
        # tempBins = frequencyBins[frequencyRange[0]:frequencyRange[1]]
        effekt.instanceData["bpm"] = vis.avg_Bpm
        effekt.instanceData["beat"] = vis.beat
        effekt.instanceData["beatChanged"] = beatChanged
        effekt.instanceData["beatCount"] = vis.randomizerBeatCount
        startTime = time.time()
        effektResult = effekt.effekt.run(tempBins,stipLength,gain,effekt.instanceData)
        endTime = time.time()
      
        # Adjust brightness
        # effektResult[0] = [int(i * brightness) for i in effektResult[0]]
        # effektResult[1] = [int(i * brightness) for i in effektResult[1]]
        # effektResult[2] = [int(i * brightness) for i in effektResult[2]]
        startFrameTime = time.time()
        frameDict[effekt.stripIndex].addFrame(effektResult, effekt.ledStartIndex, effekt.ledEndIndex)
        endFrameTime = time.time()

        timeDict[str(effekt.stripIndex) + "-" + str(config.STRIP_LED_COUNTS[realIndex])] = [endTime - startTime, endFrameTime - startFrameTime]
    # if(len(frameDict) == 0):
    #     return {
    #         0: np.tile(0, (3, config.STRIP_LED_COUNTS[0]))
    #     }
    return frameDict, timeDict