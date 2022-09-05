from array import array
import config
from customTypes.activeEffekt import ActiveEffekt
import numpy as np
import dsp


from customTypes.frequencyRange import FrequencyRange
from customTypes.stripFrame import StripFrame
runningEffekts: list = []
gain = dsp.ExpFilter(np.tile(0.01, config.cfg["frequencyBins"]),
                         alpha_decay=0.001, alpha_rise=0.99)
# Add a new effekt to the composition
def addEffekt(effekt, frequencyRange: array, stripIndex: int, ledStartIndex: int, ledEndIndex: int, instanceData: dict = {}):
    runningEffekts.append(ActiveEffekt(effekt, frequencyRange, stripIndex, ledStartIndex, ledEndIndex,instanceData))

# def getFrequencyRangeByEnum(frequencyRange: FrequencyRange):
#    return FrequencyRange[frequencyRange]
def clear():
    runningEffekts.clear()

#needs to be tested
def removeElementById(id):
    runningEffekts[:] = [effekt for effekt in runningEffekts if effekt.effekt.id != id]

def removeElementByStripIndex(stripIndex):
    runningEffekts[:] = [effekt for effekt in runningEffekts if effekt.stripIndex != stripIndex]

def getEffekts():
    return runningEffekts

# Get the renderd composition output
def getComposition(frequencyBins,vis,beatChanged):
    frameDict = {}
    effekt: ActiveEffekt
    gain.update(frequencyBins)
    for effekt in runningEffekts:
        stipLength = effekt.ledEndIndex - effekt.ledStartIndex + 1
        if stipLength > config.STRIP_LED_COUNTS[effekt.stripIndex]:
            stipLength = config.STRIP_LED_COUNTS[effekt.stripIndex]

        
        if not effekt.stripIndex in frameDict:
            frameDict[effekt.stripIndex] = StripFrame(effekt.stripIndex, config.STRIP_LED_COUNTS[effekt.stripIndex])

        frequencyRange = effekt.frequencyRange
        tempBins = np.tile(0.0, config.cfg["frequencyBins"])
        np.put(tempBins, range(frequencyRange[0], frequencyRange[1]), frequencyBins)
        # tempBins = frequencyBins[frequencyRange[0]:frequencyRange[1]]
        effekt.instanceData["bpm"] = vis.avg_Bpm
        effekt.instanceData["beat"] = vis.beat
        effekt.instanceData["beatChanged"] = beatChanged
        effektResult = effekt.effekt.run(tempBins,stipLength,gain,effekt.instanceData)

        brightness = config.cfg["brightness"] / 100
        # Adjust brightness
        effektResult[0] = [int(i * brightness) for i in effektResult[0]]
        effektResult[1] = [int(i * brightness) for i in effektResult[1]]
        effektResult[2] = [int(i * brightness) for i in effektResult[2]]

        frameDict[effekt.stripIndex].addFrame(effektResult, effekt.ledStartIndex, effekt.ledEndIndex)


    # if(len(frameDict) == 0):
    #     return {
    #         0: np.tile(0, (3, config.STRIP_LED_COUNTS[0]))
    #     }
    return frameDict