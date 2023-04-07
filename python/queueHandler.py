
import json
from tracemalloc import start
import composer
from config import config
import randomizer
import misc.syncConfig as syncConfig
from customTypes.Composition import Composition
def setSpecificEffekt(vis,effektName,stripIndex,frequencyRange,instanceData,instanceUUID,zIndex):
    print("Adding Effekt: ", effektName, " to strip: ", stripIndex, instanceUUID)
    effektClass = next(x for x in vis.allEffekts if x.__name__ == effektName)
    if effektClass == None:
        return
    realIndex = stripIndex
    if(realIndex < 0):
        realIndex = (realIndex * -1 ) - 5
    stripLength = config.STRIP_LED_COUNTS[realIndex]
    composer.removeElementByStripIndex(stripIndex)
    composer.addEffekt(effektClass(instanceUUID),frequencyRange,stripIndex,0,stripLength,instanceData,zIndex)

def addEffektToComp(vis,effektName,stripIndex,frequencyRange,instanceData,instanceUUID,startIndex,endIndex,zIndex):
    effektClass = next(x for x in vis.allEffekts if x.__name__ == effektName)
    if effektClass == None:
        return
    composer.addEffekt(effektClass(instanceUUID),frequencyRange,stripIndex,startIndex,endIndex,instanceData,zIndex)

def randomizerTriggered(vis,queue2Parent):
    queue2Parent.put(json.dumps({"type": "return.trigger.randomizer.next", "message": ""}))


def reportEffekts(vis,queue2Parent):
    comEffekts = composer.getEffekts()
    effektList = []
    for activeEffekt in comEffekts:
        effektList.append({
            "id": activeEffekt.effekt.id,
            "frequencyRange": activeEffekt.frequencyRange,
            "stripIndex": activeEffekt.stripIndex,
            "ledStartIndex": activeEffekt.ledStartIndex,
            "ledEndIndex": activeEffekt.ledEndIndex,
            "instanceData": activeEffekt.instanceData,
            "effektSystemName": activeEffekt.effekt.__class__.__name__,
            "effektName": activeEffekt.effekt.description["name"],
        })
    queue2Parent.put(json.dumps({"type": "return.data.activeEffekts", "message": effektList}))

def reportBeat(vis,queue2Parent):
    queue2Parent.put(json.dumps({
        "type": "return.system.beatUpdate", 
        "message": {
                "beat": vis.randomizerBeatCount,
                "beats": config.cfg["musicBeatsBar"],
                "bar": config.cfg["randomizerBar"]
            }
    }))

def handleQueue(queue2Thread,queue2Parent,vis):
    while not queue2Thread.empty():
            incommingData = queue2Thread.get()
            msg = json.loads(incommingData)
            
            topicType = msg["type"]
            # print("TOPIC", topicType)
            data = msg["message"]
            # print("Got QueueTask: ", msg)
            if topicType == "light.random.next":
                if randomizer.randomizerMode == randomizer.RndMode.auto:
                    randomizer.makeRandomComposition("all")
                else:
                    randomizer.pickRandomComposition()
            elif topicType == "light.random.next.specific":
                randomizer.makeRandomComposition(data["stripIndex"])
            elif topicType == "light.random.setEnabled":
                vis.randomEnabled = data["enabled"]
                print("Changed Enabled to: ", vis.randomEnabled)
            elif topicType == "data.get.availableEffekts":
                availableEffekts = []
                for effekt in vis.randomEffekts:
                    availableEffekts.append(effekt(1).description)
                print("Pushing available Effekts in Queue")
                queue2Parent.put(json.dumps({"type": "return.data.availableEffekts", "message": availableEffekts}))
            elif topicType == "light.setEffekt":
                setSpecificEffekt(vis,data["effektName"],data["stripIndex"],data["frequencyRange"],data["instanceData"],data["instanceUUID"],data["zIndex"])
                reportEffekts(vis,queue2Parent)
            elif topicType == "light.removeEffekt":
                composer.removeElementById(data["instanceUUID"])
                reportEffekts(vis,queue2Parent)
            elif topicType == "light.clearStrip":
                composer.removeElementByStripIndex(data["stripIndex"])
                reportEffekts(vis,queue2Parent)
            elif topicType == "light.addEffekt":
                addEffektToComp(vis,data["effektName"],data["stripIndex"],data["frequencyRange"],data["instanceData"],data["instanceUUID"],data["startIndex"],data["endIndex"],data["zIndex"])
                reportEffekts(vis,queue2Parent)
            elif topicType == "light.setOff":
                composer.removeElementById(data["stripIndex"])
                realIndex = data["stripIndex"]
                if(realIndex < 0):
                    realIndex = (realIndex * -1 ) - 5
                composer.addEffekt(vis.OFF_EFFEKT(data["stripIndex"]), [0,64], data["stripIndex"], 0, config.STRIP_LED_COUNTS[realIndex],{},99999999)
                reportEffekts(vis,queue2Parent)
            elif topicType == "light.random.setEnabled.specific":
                vis.ENDABLED_RND_PARTS[data["stripIndex"]] = data["enabled"]
                print("Changed Enabled to: ", vis.ENDABLED_RND_PARTS)
            elif topicType == "system.config.change":
                config.cfg[data["key"]] = data["value"]
                print("Changing Config")
            elif topicType == "system.config.get":
                print("Pushing Config in Queue")
                queue2Parent.put(json.dumps({"type": "return.system.config", "message": config.cfg}))
            elif topicType == "system.status.get":
                print("Pushing Status in Queue")
                retMessage = {
                     "type": "return.system.status", 
                      "message": {
                            "config": config.cfg,
                            "specificRandomizerEnabled": vis.ENDABLED_RND_PARTS,
                            "mainRandomizerEnabled": vis.randomEnabled
                        }
                }
                queue2Parent.put(json.dumps(retMessage))
            elif topicType == "light.report":
                reportEffekts(vis,queue2Parent)
            elif topicType == "beat.tap":
                vis.hasBeatChangedManual = True
            elif topicType == "beat.reset":
                vis.randomizerBeatCount = 0
                reportBeat(vis,queue2Parent)
            elif topicType == "light.colorPalette.set":
                print("ColorDict set to: ", data["colorPalette"])
                config.cfg["colorDict"] = data["colorPalette"]
            elif topicType == "system.config.sync":
                syncConfig.syncConfig(vis,data)
            elif topicType == "light.random.next.byType":
                randomizer.lastRandomizerType = data["type"]
                randomizer.makeRandomCompositionByType(data["type"])
            elif topicType == "light.random.useLastType":
                randomizer.useLastRandomizerType = data
            elif topicType == "light.setStripBrightness":
                print("Setting Strip Brightness to: ", data["brightness"], " for Strip: ", data["stripIndex"])
                config.cfg["stripBrightness"][str(data["stripIndex"])] = data["brightness"]
            elif topicType == "beat.detectFreq":
                vis.listenForBeatType = data
                print("Changing Beat detect to:", data)
            elif topicType == "system.reloadPipelineCompositions":
                parsedCompositions = []
                for x in data:
                    parsedCompositions.append(Composition(x,vis))
                print("Parsed Compositions: ", len(parsedCompositions))
                randomizer.setAvailableCompositions(parsedCompositions)
            elif topicType == "light.random.getMode":
                queue2Parent.put(json.dumps({"type": "return.system.randomizerMode", "message": randomizer.randomizerMode}))
            elif topicType == "light.random.setMode":
                randomizer.randomizerMode = data
                print("Setting Randomizer Mode to: ", data)
            elif topicType == "light.random.setTags":
                randomizer.useTags = data
            elif topicType == "light.random.getTags":
                queue2Parent.put(json.dumps({"type": "return.system.randomizerTags", "message": randomizer.useTags}))
            elif topicType == "system.config.setDesignerURL":
                config.DESIGNER_WS_URL = data
            elif topicType == "light.setStripSpeed":
                config.STRIP_SPEED[data["stripIndex"]] = int(data["speed"])
            elif topicType == "light.setStripIntensity":
                config.STRIP_INTENSITY[data["stripIndex"]] = data["intensity"] / 100
            elif topicType == "light.changeStripFeqRange":
                composer.changeFrequencyRangeForEffektById(data["stripIndex"],data["frequencyRange"])

                
