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
queue = multiprocessing.SimpleQueue()
class SimpleEcho(WebSocket):
    def handle(self):
        print("Incomming message:", self.data)
        queue.put("light.random.next")
        self.send_message(self.data)

    def connected(self):
        print(self.address, 'connected')

    def handle_close(self):
        print(self.address, 'closed')

def initServer():
    global proc, queue
    queue.put("init")
    vis = Visualization()
    proc = multiprocessing.Process(target=vis.start, args=(queue,))
    proc.start()
    server = WebSocketServer('', 8000, SimpleEcho)
    server.serve_forever()

def handler(signum, frame):
    global proc
    proc.terminate()
    exit(1)
    

signal.signal(signal.SIGINT, handler)

if __name__ == '__main__':
    initServer()
