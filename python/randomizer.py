import random
import time
import uuid
from customTypes.frequencyRange import FrequencyRange
from config import config
import composer

class RndMode:
    auto = 0 # just random
    byComposition = 1 # random by composition



lastDetectedBeat = 0
cleardBeatEffekts = False
queueHandler = None
engine = None
useLastRandomizerType = False
lastRandomizerType = "chilleddrop"
randomizerMode = RndMode.auto
useTags = []
availableCompositions = []


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

availableFreqs = [FrequencyRange.high,FrequencyRange.mid,FrequencyRange.low,FrequencyRange.all]
allFrequencyEffekts = ["visualize_spectrum"]
def makeRandomCompositionByType(type):
    print("Make by Type: " + type)
    global queueHandler, engine
    allPartsRange = list(range(0,config.STRIP_COUNT))
    allFreqencys = availableFreqs.copy()
    effektDict = getEffektsDict(type,config.STRIP_COUNT)
    for x in config.STRIP_MIRRORS:
        randomColor = random.choice(config.cfg["colorDict"])
        randomColorPalette = random.sample(config.cfg["colorDict"], 3)
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
                effectInstance = randomEffekt(str(uuid.uuid1()))
                if hasattr(effectInstance,"colors"):
                    # print("Effekt supports colors", randomEffekt.__name__)
                    effectInstance.colors = randomColorPalette
                composer.addEffekt(effectInstance,randomFreq,i,0,config.STRIP_LED_COUNTS[i],{
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
    queueHandler.reportEffekts(engine, engine.queue2Parent)
    queueHandler.randomizerTriggered(engine, engine.queue2Parent)

def makeRandomComposition(parts,overrideEnabled = False, noBeat = False, cleanBeatEffekts = False):
    global queueHandler, engine
    allFreqencys = [FrequencyRange.all, FrequencyRange.high,FrequencyRange.mid,FrequencyRange.low]
    rndEffekts = list(filter(lambda eff: eff.__name__ not in config.cfg["blacklistedEffects"]["all"] and ("bpmSensitive" not in eff(1).description or not noBeat), engine.randomEffekts))
    if(parts == "all"):  
        allPartsRange = list(range(0,config.STRIP_COUNT))
        for x in config.STRIP_MIRRORS:    
            randomColorPalette = random.sample(config.cfg["colorDict"], 3)
            runningEffekt = composer.getEffektByStripIndex(x[0])
            if len(runningEffekt) > 0:
                if cleanBeatEffekts and not "bpmSensitive" in runningEffekt[0].effekt.description:
                    # print("Skip clean: " + runningEffekt[0].effekt.description["name"],x[0])
                    continue
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
                if not engine.ENDABLED_RND_PARTS[i]:
                    continue
                effectInstance = randomEffekt(str(uuid.uuid1()))
                if hasattr(effectInstance,"colors"):
                    # print("Effekt supports colors", randomEffekt.__name__)
                    effectInstance.colors = randomColorPalette
                composer.removeElementByStripIndex(i)
                composer.addEffekt(effectInstance,randomFreq,i,0,config.STRIP_LED_COUNTS[i],{
                    "color":randomColor,
                    "loopCount":randomLoopCount,
                    "stepAmount":random.randint(6,12)
                })
                allPartsRange.remove(i)
        for x in allPartsRange:
            if engine.ENDABLED_RND_PARTS[x] or overrideEnabled:
                runningEffekt = composer.getEffektByStripIndex(x)
                if len(runningEffekt) > 0:
                    if cleanBeatEffekts and not "bpmSensitive" in runningEffekt[0].effekt.description:
                        print("Skip clean: " + runningEffekt[0].effekt.description["name"],x)
                        continue
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
    queueHandler.randomizerTriggered(engine, engine.queue2Parent)

def pickRandomComposition():
    global availableCompositions, useTags, engine
    # filter out compositions wich dont include at least one tag from useTags
    filterdCompos = []
    lookupCount = 0
    if len(useTags) > 0:
        for comp in availableCompositions:
            if any(tag["name"] in useTags for tag in comp.tags):
                filterdCompos.append(comp)
            lookupCount += 1
    else:
        filterdCompos = availableCompositions
    if len(filterdCompos) == 0:
        filterdCompos = availableCompositions

    randomComposition = random.choice(filterdCompos)
    print("Picked random composition: " + randomComposition.compositionName, randomComposition.tags)
    composer.clear()
    randomComposition.activate()
    queueHandler.reportEffekts(engine, engine.queue2Parent)

def changeEffekt(hasBeatChanged):
    global queueHandler, engine, lastDetectedBeat,cleardBeatEffekts

    # convert bpm to ms
    bpm = engine.avg_Bpm
    if bpm < 1:
        bpm = 1
    bpmInSec = 60 / bpm

    #check if last beat is older than 2 seconds
    if (time.time() - lastDetectedBeat > bpmInSec * 2 or engine.avg_Bpm < 1) and not cleardBeatEffekts:
        cleardBeatEffekts = True
        engine.randomizerBeatCount = 0
        queueHandler.reportBeat(engine, engine.queue2Parent)
        print("Clearing beat effekts")
        if not useLastRandomizerType:
            makeRandomComposition("all",False,True,True)

    if hasBeatChanged:
        lastDetectedBeat = time.time()
        if cleardBeatEffekts and not hasBeatChanged and time.time() - lastDetectedBeat > 2:
            engine.randomizerBeatCount = 0
            queueHandler.reportBeat(engine, engine.queue2Parent)

        if (engine.randomizerBeatCount >= config.cfg["musicBeatsBar"] * config.cfg["randomizerBar"]):
            cleardBeatEffekts = False
            print("==> Change Randomizer")
            engine._lastTime = time.time()
            engine.randomizerBeatCount = 0
            queueHandler.reportBeat(engine, engine.queue2Parent)
            if randomizerMode == RndMode.auto:
                if useLastRandomizerType:
                    makeRandomCompositionByType(lastRandomizerType)
                    print("Comp by type: " + lastRandomizerType)
                else:
                    makeRandomComposition("all")
            elif randomizerMode == RndMode.byComposition:
                pickRandomComposition()
   
           
            # pick a random composition from available compositions
           

def setAvailableCompositions(comps):
    global availableCompositions
    availableCompositions = comps