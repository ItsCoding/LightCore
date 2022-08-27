import json


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
