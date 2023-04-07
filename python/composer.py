from array import array
from config import config
from customTypes.activeEffekt import ActiveEffekt
from effekts.positional.test import TestEffekt
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
        print("ledEndIndex is out of range, correcting",realIndex, stripIndex, ledEndIndex, config.STRIP_LED_COUNTS[stripIndex])
        ledEndIndex = config.STRIP_LED_COUNTS[realIndex]
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


def changeFrequencyRangeForEffektById(id, frequencyRange: FrequencyRange):
    effekt: ActiveEffekt
    for effekt in runningEffekts:
        if effekt.stripIndex == id:
            effekt.frequencyRange = frequencyRange

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
        if stipLength < 0:
            stipLength = effekt.ledStartIndex - effekt.ledEndIndex
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
        if effekt.stripIndex in config.STRIP_SPEED:
            effekt.instanceData["speed"] = config.STRIP_SPEED[effekt.stripIndex]
        else:
            effekt.instanceData["speed"] = config.cfg["globalSpeed"]

        if effekt.stripIndex in config.STRIP_INTENSITY:
            effekt.instanceData["intensity"] = config.STRIP_INTENSITY[effekt.stripIndex]
        else:
            effekt.instanceData["intensity"] = config.cfg["globalIntensity"]

        if effekt.stripIndex in config.STRIP_COLOR_DICT:
            effekt.instanceData["colorDict"] = config.STRIP_COLOR_DICT[effekt.stripIndex]
        else:
            effekt.instanceData["colorDict"] = config.cfg["colorDict"]

        startTime = time.time()
        try:
            effektResult = effekt.effekt.run(tempBins,stipLength,gain,effekt.instanceData)
        except Exception as e:
            print("Error in effekt", effekt.effekt.__class__.__name__,realIndex,stipLength//2,stipLength, e)
            effektResult = np.tile(0, (3, stipLength))
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
testeffekt = None
def runPositional(frequencyBins,vis,beatChanged):
    global testeffekt
    ledPositions = config.STRIP_LED_POSITIONS
    if testeffekt == None:
        testeffekt = TestEffekt("1",None,config.CANVAS_WIDTH,config.CANVAS_HEIGHT,ledPositions)
    effektCanvas = testeffekt.run(None,None)

    frameDict = {}
    
    for x in ledPositions:
        for y in ledPositions[x]:
            for led in ledPositions[x][y]:
                stripId = int(led["stripID"])
                ledIndex = int(led["ledIndex"])
                xInt = int(x)
                yInt = int(y)
                if ledIndex >= config.STRIP_LED_COUNTS[stripId] or ledIndex < 0 or yInt >= config.CANVAS_HEIGHT or xInt >= config.CANVAS_WIDTH or xInt < 0 or yInt < 0:
                    continue
               
                # print(stripId,"StripID", config.STRIP_LED_COUNTS[stripId],ledIndex,x,y)
                if not stripId in frameDict:
                    frameDict[stripId] = np.zeros((3, config.STRIP_LED_COUNTS[stripId]))
                try:
                    frameDict[stripId][0][ledIndex] += effektCanvas[xInt][yInt][0]
                    frameDict[stripId][1][ledIndex] += effektCanvas[xInt][yInt][1]
                    frameDict[stripId][2][ledIndex] += effektCanvas[xInt][yInt][2]
                except Exception as e:
                    print("Error in effekt", stripId,ledIndex,[xInt,config.CANVAS_WIDTH],[yInt,config.CANVAS_HEIGHT], e)
    returnDict = {}
    # print(len(frameDict))
    for stripID in frameDict:
        returnDict[stripID] = StripFrame(stripID, config.STRIP_LED_COUNTS[stripID])
        returnDict[stripID].addFrame(frameDict[stripID], 0, config.STRIP_LED_COUNTS[stripID])
    return returnDict