import random
import time
import uuid
from customTypes.frequencyRange import FrequencyRange
import config
import composer

lastDetectedBeat = 0
cleardBeatEffekts = False
queueHandler = None
engine = None
useLastRandomizerType = False
lastRandomizerType = "chilleddrop"
def initRandomizer(queueHandlerP, engineP):
    global queueHandler, engine
    queueHandler = queueHandlerP
    engine = engineP
    print("Init Randomizer...")


def getEffektsDict(type,lenght):
    returnDict = {}
    beatFffekts = list(filter(lambda eff: eff.__name__ not in config.cfg["blacklistedEffects"]["all"] and ("bpmSensitive" in eff(1).description), engine.randomEffekts))
    effekts = list(filter(lambda eff: eff.__name__ not in config.cfg["blacklistedEffects"]["all"] and ("bpmSensitive" not in eff(1).description), engine.randomEffekts))
    if type == "chilled" or type == "chilleddrop":
        for x in range(0,lenght):
            stripEff = list(filter(lambda eff: eff.__name__ not in config.cfg["blacklistedEffects"][str(x)], effekts))
            returnDict[x] = random.choice(stripEff)
    elif type == "beats" or type == "beatsdrop":
        for x in range(0,lenght):
            stripEffBeat = list(filter(lambda eff: eff.__name__ not in config.cfg["blacklistedEffects"][str(x)], beatFffekts))
            returnDict[x] = random.choice(stripEffBeat)
    if type == "chilleddrop":
        stripIndex = random.randint(0,lenght-1)
        stripEffDrop = list(filter(lambda eff: eff.__name__ not in config.cfg["blacklistedEffects"][str(stripIndex)], beatFffekts))
        returnDict[stripIndex] = random.choice(stripEffDrop)
    if type == "beatsdrop":
        stripIndex = random.randint(0,lenght-1)
        stripEffBeatsDrop = list(filter(lambda eff: eff.__name__ not in config.cfg["blacklistedEffects"][str(stripIndex)], effekts))
        returnDict[stripIndex] = random.choice(stripEffBeatsDrop)
    return returnDict

availableFreqs = [FrequencyRange.high,FrequencyRange.mid,FrequencyRange.low]
allFrequencyEffekts = ["visualize_spectrum"]
def makeRandomCompositionByType(type):
    print("Make by Type: " + type)
    global queueHandler, engine
    allPartsRange = list(range(0,config.STRIP_COUNT))
    allFreqencys = availableFreqs.copy()
    effektDict = getEffektsDict(type,config.STRIP_COUNT)
    for x in config.STRIP_MIRRORS:
        randomColor = random.choice(config.cfg["colorDict"])
        if len(allFreqencys) == 0:
            allFreqencys = availableFreqs.copy()
        randomFreq = random.choice(allFreqencys)
        allFreqencys.remove(randomFreq)
        randomEffekt = effektDict[x[0]]
        if randomEffekt.__name__ in allFrequencyEffekts:
            randomFreq = FrequencyRange.all
        randomLoopCount = 0
        if(config.STRIP_LED_COUNTS[x[0]] >50):
            randomLoopCount = random.randint(3,5)
        else:  
            randomLoopCount = random.randint(1,3)
        for i in x:
            if engine.ENDABLED_RND_PARTS[i]:
                composer.removeElementByStripIndex(i)
                composer.addEffekt(randomEffekt(str(uuid.uuid1())),randomFreq,i,0,config.STRIP_LED_COUNTS[i],{
                    "color":randomColor,
                    "loopCount":randomLoopCount,
                    "stepAmount":random.randint(6,12)
                })
            allPartsRange.remove(i)
    for x in allPartsRange:
        if engine.ENDABLED_RND_PARTS[x]:
            randomColor = random.choice(config.cfg["colorDict"])
            if len(allFreqencys) == 0:
                allFreqencys = availableFreqs.copy()
            randomFreq = random.choice(allFreqencys)
            allFreqencys.remove(randomFreq)
            randomEffekt = effektDict[x]
            if randomEffekt.__name__ in allFrequencyEffekts:
                randomFreq = FrequencyRange.all
            composer.removeElementByStripIndex(x)
            composer.addEffekt(randomEffekt(str(uuid.uuid1())),randomFreq,x,0,config.STRIP_LED_COUNTS[x])   

def makeRandomComposition(parts,overrideEnabled = False, noBeat = False):
    global queueHandler, engine
    allFreqencys = [FrequencyRange.all, FrequencyRange.high,FrequencyRange.mid,FrequencyRange.low]
    rndEffekts = list(filter(lambda eff: eff.__name__ not in config.cfg["blacklistedEffects"]["all"] and ("bpmSensitive" not in eff(1).description or not noBeat), engine.randomEffekts))
    if(parts == "all"):  
        allPartsRange = list(range(0,config.STRIP_COUNT))
        for x in config.STRIP_MIRRORS:
            randomColor = random.choice(config.cfg["colorDict"])
            randomFreq = random.choice(allFreqencys)
            rndEffektsStrip = list(filter(lambda eff: eff.__name__ not in config.cfg["blacklistedEffects"][str(x[0])], rndEffekts))
            randomEffekt = random.choice(rndEffektsStrip)
            randomLoopCount = 0
            if(config.STRIP_LED_COUNTS[x[0]] >50):
                randomLoopCount = random.randint(3,5)
            else:  
                randomLoopCount = random.randint(1,3)
            for i in x:
                composer.removeElementByStripIndex(i)
                composer.addEffekt(randomEffekt(str(uuid.uuid1())),randomFreq,i,0,config.STRIP_LED_COUNTS[i],{
                    "color":randomColor,
                    "loopCount":randomLoopCount,
                    "stepAmount":random.randint(6,12)
                })
                allPartsRange.remove(i)
        for x in allPartsRange:
            if engine.ENDABLED_RND_PARTS[x] or overrideEnabled:
                randomFreq = random.choice(allFreqencys)
                rndEffektsStrip = list(filter(lambda eff: eff.__name__ not in config.cfg["blacklistedEffects"][str(x)], rndEffekts))
                randomEffekt = random.choice(rndEffektsStrip)
                composer.removeElementByStripIndex(x)
                composer.addEffekt(randomEffekt(str(uuid.uuid1())),randomFreq,x,0,config.STRIP_LED_COUNTS[x])
    else:
        rndEffektsStrip = list(filter(lambda eff: eff.__name__ not in config.cfg["blacklistedEffects"][str(parts)], rndEffekts))
        randomFreq = random.choice(allFreqencys)
        randomEffekt = random.choice(rndEffektsStrip)
        composer.removeElementByStripIndex(parts)
        composer.addEffekt(randomEffekt(str(uuid.uuid1())),randomFreq,parts,0,config.STRIP_LED_COUNTS[parts])
    queueHandler.reportEffekts(engine, engine.queue2Parent)

def changeEffekt(hasBeatChanged):
    global queueHandler, engine, lastDetectedBeat,cleardBeatEffekts
    if hasBeatChanged:
        lastDetectedBeat = time.time()

    #check if last beat is older than 2 seconds
    if (time.time() - lastDetectedBeat > 1.5 or engine.avg_Bpm < 1) and not cleardBeatEffekts:
        cleardBeatEffekts = True
        print("Clearing beat effekts")
        if not useLastRandomizerType:
            makeRandomComposition("all",False,True)
    if cleardBeatEffekts and not hasBeatChanged and time.time() - lastDetectedBeat > 2:
        engine.randomizerBeatCount = 1

    if (engine.randomizerBeatCount >= config.cfg["musicBeatsBar"] * config.cfg["randomizerBar"]):
        cleardBeatEffekts = False
        print("==> Change Randomizer")
        engine._lastTime = time.time()
        engine.randomizerBeatCount = 1
        if useLastRandomizerType:
            makeRandomCompositionByType(lastRandomizerType)
        else:
            makeRandomComposition("all")