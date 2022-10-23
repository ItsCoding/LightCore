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
def initRandomizer(queueHandlerP, engineP):
    global queueHandler, engine
    queueHandler = queueHandlerP
    engine = engineP
    print("Init Randomizer...")


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
    if time.time() - lastDetectedBeat > 2 and not cleardBeatEffekts:
        cleardBeatEffekts = True
        print("Clearing beat effekts")
        makeRandomComposition("all",False,True)
    if cleardBeatEffekts and not hasBeatChanged and time.time() - lastDetectedBeat > 2:
        engine.randomizerBeatCount = 1

    if (engine.randomizerBeatCount >= config.cfg["musicBeatsBar"] * config.cfg["randomizerBar"]):
        cleardBeatEffekts = False
        print("Change Randomizer")
        engine._lastTime = time.time()
        engine.randomizerBeatCount = 1
        makeRandomComposition("all")