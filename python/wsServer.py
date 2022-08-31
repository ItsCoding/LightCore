from customTypes.frequencyRange import FrequencyRange
from effekts.energyExtreme import visualize_energyExtreme
from effekts.energyRGB import visualize_energyRGB
from simple_websocket_server import WebSocketServer, WebSocket
import multiprocessing
import signal
from visualization import Visualization
import composer as comp
import time
import zmq

proc = None
vis = None
queue2Thread = multiprocessing.SimpleQueue()
queue2Parent = multiprocessing.SimpleQueue()
clients = []
# class SimpleEcho(WebSocket):
#     def handleQueue(self):
#         while not queue2Parent.empty():
#             incommingData = queue2Parent.get()
#             # print("Sending: ", incommingData)
#             self.send_message(incommingData)
#             for client in clients:
#                 if client != self:
#                     client.send_message(incommingData)

#     def handle(self):
#         print("Incomming message:", self.data)
#         # print("Handel Queue")
#         self.handleQueue()
#         # print("Handel Queue done")
#         queue2Thread.put(self.data)
#         # print("Sending AKK")
#         # self.send_message("AKK: " + self.data)

#     def connected(self):
#         print(self.address, 'connected')
#         clients.append(self)

#     def handle_close(self):
#         clients.remove(self)
#         print(self.address, 'closed')

# def initServer():
#     global proc, queue2Thread,queue2Parent
#     vis = Visualization()
#     proc = multiprocessing.Process(target=vis.start, args=(queue2Thread,queue2Parent))
#     proc.start()
#     server = WebSocketServer('0.0.0.0', 8000, SimpleEcho)
#     server.serve_forever()

def handler(signum, frame):
    global proc
    proc.terminate()
    exit(1)


def initServer():
    global proc, queue2Thread,queue2Parent
    vis = Visualization()
    proc = multiprocessing.Process(target=vis.start, args=(queue2Thread,queue2Parent))
    proc.start()
    print("Started")
    
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
