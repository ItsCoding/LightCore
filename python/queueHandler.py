def handleQueue(queue,vis):
    while not queue.empty():
            msg = queue.get()
            print("Got QueueTask: ", msg)
            if msg == "light.random.next":
                vis.makeRandomComposition()