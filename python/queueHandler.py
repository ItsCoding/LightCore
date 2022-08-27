
import json
import composer
import config


def addSpecificEffektToComp(vis,effektName,stripIndex,frequencyRange):
    print("Adding Effekt: ", effektName, " to strip: ", stripIndex)
    effektClass = next(x for x in vis.randomEffekts if x.__name__ == effektName)
    if effektClass == None:
        return
    stripLength = config.STRIP_LED_COUNTS[stripIndex]
    composer.removeElementById(stripIndex)
    composer.addEffekt(effektClass(stripIndex),frequencyRange,stripIndex,0,stripLength)

def handleQueue(queue2Thread,queue2Parent,vis):
    while not queue2Thread.empty():
            incommingData = queue2Thread.get()
            msg = json.loads(incommingData)
            topicType = msg["type"]
            data = msg["message"]
            print("Got QueueTask: ", msg)
            if topicType == "light.random.next":
                vis.makeRandomComposition("all")
            elif topicType == "light.random.next.triangle":
                vis.makeRandomComposition("triangle")
            elif topicType == "light.random.next.middle":
                vis.makeRandomComposition("middle")
            elif topicType == "light.random.setEnabled":
                vis.randomEnabled = data["enabled"]
                print("Changed Enabled to: ", vis.randomEnabled)
            elif topicType == "get.availableEffekts":
                availableEffekts = []
                for effekt in vis.randomEffekts:
                    availableEffekts.append(effekt.description())
                print("Pushing available Effekts in Queue")
                queue2Parent.put(json.dumps({"type": "return.availableEffekts", "message": availableEffekts}))
            elif topicType == "light.setEffekt":
                addSpecificEffektToComp(vis,data["effektName"],data["stripIndex"],data["frequencyRange"])
            elif topicType == "light.setOff":
                composer.removeElementById(data["stripIndex"])
                composer.addEffekt(vis.OFF_EFFEKT(data["stripIndex"]), [0,64], data["stripIndex"], 0, config.STRIP_LED_COUNTS[data["stripIndex"]])

