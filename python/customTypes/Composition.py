from customTypes.activeEffekt import ActiveEffekt
import composer
from config import config
import copy
import uuid
from effekts.system.off import visualize_OFF
class Composition:
    def __init__(self,data,vis):
        self.allEffekts = vis.allEffekts
        self.compositionName = data["compositionName"]
        self.tags = data["tags"]
        self.activeEffekts = []
        for jEff in data["activeEffekts"]:
            effektClass = next(x for x in self.allEffekts if x.__name__ == jEff["effektSystemName"])
            if effektClass == None:
                return
            self.activeEffekts.append(ActiveEffekt(effektClass(jEff["id"]),jEff["frequencyRange"],jEff["stripIndex"],jEff["ledStartIndex"],jEff["ledEndIndex"],jEff["instanceData"],jEff["zIndex"]))

    def activate(self):
        allStripIndexes = {}
        for effekt in self.activeEffekts:
            if effekt.stripIndex not in allStripIndexes:
                allStripIndexes[effekt.stripIndex] = effekt
            composer.addEffekt(effekt.effekt,effekt.frequencyRange,effekt.stripIndex,effekt.ledStartIndex,effekt.ledEndIndex,effekt.instanceData,effekt.zIndex)
        # get all strips that are not in the composition
        if config.RND_COMPOSITION_FILL_UNUSED:
            missingStrips = []
            for i in range(0,config.STRIP_COUNT):
                if i not in allStripIndexes:
                    missingStrips.append(i)
            # print("Missing Strips: " + str(missingStrips))
            # check if the missing strip is a mirror strip
            for stripIndex in missingStrips:
                # print("Checking strip " + str(stripIndex))
                stripToCopyFrom = None
                for grp in config.STRIP_MIRRORS:
                    if stripIndex in grp:
                        # get the overlapping strip between grp and allStripIndexes
                        # print(allStripIndexes.keys(), grp,stripIndex)
                        try:
                            stripToCopyFrom = next(x for x in grp if x in allStripIndexes.keys())
                        except Exception as e:
                            # print("Error in Iteration",allStripIndexes.keys(),grp,stripIndex, e)
                            pass # means that we couldnt find a strip to copy from
                        break
                if stripToCopyFrom != None:
                    # print("Copying from strip " + str(stripToCopyFrom) + " to strip " + str(stripIndex))
                    effekt = copy.copy(allStripIndexes[stripToCopyFrom])
                    
                    newStripLength = config.STRIP_LED_COUNTS[stripIndex]
                    newEffektMaxLength = effekt.ledEndIndex
                    if effekt.ledEndIndex > newStripLength:
                        newEffektMaxLength = newStripLength
                    if effekt.ledStartIndex > newStripLength:
                        effekt.ledStartIndex = 0

                    effektClass = next(x for x in self.allEffekts if x.__name__ == effekt.effekt.__class__.__name__)
                    # print(stripIndex,effekt.stripIndex,effekt.ledStartIndex,effekt.ledEndIndex, " - ", newStripLength,newEffektMaxLength)
                    composer.addEffekt(effektClass(str(uuid.uuid4()) + "-clone"),effekt.frequencyRange,stripIndex,effekt.ledStartIndex,newEffektMaxLength,effekt.instanceData,effekt.zIndex)
                else:
                     newStripLength = config.STRIP_LED_COUNTS[stripIndex]
                     composer.addEffekt(visualize_OFF(str(uuid.uuid4()) + "-clone"),effekt.frequencyRange,stripIndex,0,newStripLength,effekt.instanceData,effekt.zIndex)
                # else:
                    # print("No strip to copy from for strip " + str(stripIndex))