from array import array
import config
from customTypes.activeEffekt import ActiveEffekt
import numpy as np
import dsp


from customTypes.frequencyRange import FrequencyRange
from customTypes.stripFrame import StripFrame
runningEffekts: list = []
gain = dsp.ExpFilter(np.tile(0.01, config.N_FFT_BINS),
                         alpha_decay=0.001, alpha_rise=0.99)
# Add a new effekt to the composition
def addEffekt(effekt, frequencyRange: array, stripIndex: int, ledStartIndex: int, ledEndIndex: int):
    runningEffekts.append(ActiveEffekt(effekt, frequencyRange, stripIndex, ledStartIndex, ledEndIndex))

# def getFrequencyRangeByEnum(frequencyRange: FrequencyRange):
#    return FrequencyRange[frequencyRange]
def clear():
    runningEffekts.clear()

#needs to be tested
def removeElementById(id):
    runningEffekts[:] = [effekt for effekt in runningEffekts if effekt.effekt.id != id]
    
# Get the renderd composition output
def getComposition(frequencyBins):
    frameDict = {}
    effekt: ActiveEffekt
    gain.update(frequencyBins)
    for effekt in runningEffekts:
        stipLength = config.STRIP_LED_COUNTS[effekt.stripIndex]
        if not effekt.stripIndex in frameDict:
            frameDict[effekt.stripIndex] = StripFrame(effekt.stripIndex, stipLength)

        frequencyRange = effekt.frequencyRange
        tempBins = np.tile(0.0, config.N_FFT_BINS)
        np.put(tempBins, range(frequencyRange[0], frequencyRange[1]), frequencyBins)
        # tempBins = frequencyBins[frequencyRange[0]:frequencyRange[1]]
        effektResult = effekt.effekt.run(tempBins,stipLength,gain)

        frameDict[effekt.stripIndex].addFrame(effektResult, effekt.ledStartIndex, effekt.ledEndIndex)



    return frameDict