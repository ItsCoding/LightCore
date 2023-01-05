from customTypes.activeEffekt import ActiveEffekt
import composer

class Composition:
    def __init__(self,data,vis):
        self.compositionName = data["compositionName"]
        self.tags = data["tags"]
        self.activeEffekts = []
        for jEff in data["activeEffekts"]:
            effektClass = next(x for x in vis.allEffekts if x.__name__ == jEff["effektSystemName"])
            if effektClass == None:
                return
            self.activeEffekts.append(ActiveEffekt(effektClass(jEff["id"]),jEff["frequencyRange"],jEff["stripIndex"],jEff["ledStartIndex"],jEff["ledEndIndex"],jEff["instanceData"],jEff["zIndex"]))

    def activate(self):
        for effekt in self.activeEffekts:
            composer.addEffekt(effekt.effekt,effekt.frequencyRange,effekt.stripIndex,effekt.ledStartIndex,effekt.ledEndIndex,effekt.instanceData,effekt.zIndex)