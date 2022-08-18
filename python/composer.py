import config
from customTypes.activeEffekt import ActiveEffekt
import numpy as np

from customTypes.frequencyRange import FrequencyRange
from customTypes.stripFrame import StripFrame
runningEffekts: list = []

# Add a new effekt to the composition
def addEffekt(effekt, frequencyRange: FrequencyRange, stripIndex: int, ledStartIndex: int, ledEndIndex: int):
    runningEffekts.append(ActiveEffekt(effekt, frequencyRange, stripIndex, ledStartIndex, ledEndIndex))

def getFrequencyRangeByEnum(frequencyRange: FrequencyRange):
    if frequencyRange == FrequencyRange.LOW:
        return 0, config.N_FFT_BINS // 3
    elif frequencyRange == FrequencyRange.MID:
        return config.N_FFT_BINS // 3, 2 * config.N_FFT_BINS // 3
    elif frequencyRange == FrequencyRange.HIGH:
        return 2 * config.N_FFT_BINS // 3, config.N_FFT_BINS
    else:
        return 0, config.N_FFT_BINS


# Get the renderd composition output
def getComposition(frequencyBins):
    frameDict = {}
    effekt: ActiveEffekt
    for effekt in runningEffekts:
        if not effekt.stripIndex in frameDict:
            frameDict[effekt.stripIndex] = StripFrame(effekt.stripIndex, config.STRIP_LED_COUNTS[effekt.stripIndex])

        frequencyRange = getFrequencyRangeByEnum(effekt.frequencyRange)
        tempBins = frequencyBins[frequencyRange[0]:frequencyRange[1]]
        frameDict[effekt.stripIndex].addFrame(effekt.effekt(tempBins), effekt.ledStartIndex, effekt.ledEndIndex)



    return frameDict