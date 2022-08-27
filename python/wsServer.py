from customTypes.frequencyRange import FrequencyRange
from effekts.energyExtreme import visualize_energyExtreme
from effekts.energyRGB import visualize_energyRGB
from simple_websocket_server import WebSocketServer, WebSocket
import multiprocessing
import signal
from visualization import Visualization
import composer as comp
proc = None
vis = None
queue2Thread = multiprocessing.SimpleQueue()
queue2Parent = multiprocessing.SimpleQueue()
class SimpleEcho(WebSocket):
    def handleQueue(self):
        while not queue2Parent.empty():
            incommingData = queue2Parent.get()
            print("Sending: ", incommingData)
            self.send_message(incommingData)

    def handle(self):
        print("Incomming message:", self.data)
        # print("Handel Queue")
        self.handleQueue()
        print("Handel Queue done")
        queue2Thread.put(self.data)
        # print("Sending AKK")
        # self.send_message("AKK: " + self.data)

    def connected(self):
        print(self.address, 'connected')

    def handle_close(self):
        print(self.address, 'closed')

def initServer():
    global proc, queue
    vis = Visualization()
    proc = multiprocessing.Process(target=vis.start, args=(queue2Thread,queue2Parent))
    proc.start()
    server = WebSocketServer('0.0.0.0', 8000, SimpleEcho)
    server.serve_forever()

def handler(signum, frame):
    global proc
    proc.terminate()
    exit(1)
    

signal.signal(signal.SIGINT, handler)

if __name__ == '__main__':
    initServer()
