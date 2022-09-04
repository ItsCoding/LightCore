from customTypes.frequencyRange import FrequencyRange
import multiprocessing
import signal
from visualization import Visualization
import composer as comp
import time
import zmq
import bpmdetector.beatDetector as beatDetector

procRendering = None
procBPM = None
vis = None
queue2Thread = multiprocessing.SimpleQueue()
queue2Parent = multiprocessing.SimpleQueue()
bpmQueue = multiprocessing.SimpleQueue()
clients = []

def handler(signum, frame):
    global procBPM, procRendering
    procBPM.terminate()
    procRendering.terminate()
    exit(1)


def initServer():
    global procRendering, queue2Thread,queue2Parent,procBPM
    vis = Visualization()
    procRendering = multiprocessing.Process(target=vis.start, args=(queue2Thread,queue2Parent,bpmQueue))
    procRendering.start()
    print("Started Rendering Process")

    procBPM = multiprocessing.Process(target=beatDetector.start, args=(bpmQueue,))
    procBPM.start()
    print("Started BPM Process")
    
    context = zmq.Context()
    socket = context.socket(zmq.PULL)
    socket2Node = context.socket(zmq.PUSH)
    poller = zmq.Poller()
    poller.register(socket, zmq.POLLIN)
    socket.connect("tcp://127.0.0.1:7123")
    socket2Node.connect("tcp://127.0.0.1:7321")
    print("ZeroMQ connected")
    while True:
        #  Wait for next request from client
        socks = dict(poller.poll(10))
        # print("MessageCount: ", messageCount)
        if socks.get(socket) == zmq.POLLIN:
            # print("Received request:")
            message = socket.recv().decode("utf-8")
            # print(message)
            queue2Thread.put(message)
        #  Do some 'work'
        while not queue2Parent.empty():
            incommingData = queue2Parent.get()
            print("Sending to ZeroMQ: ", len(incommingData))
            socket2Node.send_string(incommingData)
        # print("...")
    

signal.signal(signal.SIGINT, handler)

if __name__ == '__main__':
    initServer()
