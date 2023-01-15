#create an udp socket to receive acks. It should run in a separate thread. Also make a function that allows a different thread to check if an ack has been received for a particular packet.

import socket
import threading
from config import config
import time
import multiprocessing

queue2LED = multiprocessing.SimpleQueue()


class InternAckHandler:
    def __init__(self, port, timeout):
        print("ESP-AckHandler starting...")
        self.port = port
        self.timeout = timeout
        self.ackDict = {}
        self.ackDictLock = threading.Lock()
        self.ackReceived = threading.Event()
        self.ackReceived.clear()
        self.ackSocket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.ackSocket.bind(('0.0.0.0', self.port))
        self.ackSocket.settimeout(self.timeout)
        self.ackThread = threading.Thread(target=self.ackListener)
        self.ackThread.setDaemon(True)
        self.ackThread.start()
        self.ackThreadStarted = True
        print("ESP-AckHandler started on port " + str(self.port) + " with timeout " + str(self.timeout) + "s")

    def ackListener(self):
        while True:
            try:
                data, addr = self.ackSocket.recvfrom(1024)
                self.ackDictLock.acquire()
                ip = str(addr[0])
                if ip not in self.ackDict:
                    self.ackDict[ip] = []
                try:
                    decodedData = data.decode()
                    ackID = int(decodedData)
                    self.ackDict[ip].append(ackID)
                    # print("ESP-AckHandler received ack from " + ip + " with data " + str(ackID))
                    # print("ESP-AckHandler received ack from " + ip + " with data " + str(ackID))
                except:
                    print("Error in handeling ack data")
                    pass
                self.ackDictLock.release()
                self.ackReceived.set()
            except socket.timeout:
                pass

    # def ackReceivedFor(self, addr):
        # self.ackReceived.clear()
        # self.ackDictLock.acquire()
        # if addr in self.ackDict:
        #     self.ackDictLock.release()
        #     return True
        # self.ackDictLock.release()
        # return False

    def getAcksFor(self, addr):
        self.ackDictLock.acquire()
        # print(addr, self.ackDict.keys())
        if addr in self.ackDict:
            acks = self.ackDict[addr]
            del self.ackDict[addr]
            self.ackDictLock.release()
            return acks
        else:
            # print("No acks for " + str(addr) + " found")
            pass
            # print(self.ackDict)
        self.ackDictLock.release()
        return None

    def stop(self):
        if self.ackThreadStarted:
            self.ackSocket.close()
            self.ackThread.join()
            self.ackThreadStarted = False



iAckHandler = None
ackDict = {}


def startHandler():
    global iAckHandler
    if iAckHandler is None:
        print("Creating ESP-AckHandler...")
        iAckHandler = InternAckHandler(config.ESP_ACK_PORT, config.ESP_ACK_TIMEOUT)

def registerAckId(addr, id):
    global ackDict
    if addr == "localhost" or addr == "127.0.0.1":
        return
    if(addr not in ackDict):
        ackDict[addr] = []
    ackDict[addr].append({
        "id": id,
        "time": time.time()
    })

def getDeviceLag(addr):
    global iAckHandler,ackDict
    if(addr in ackDict):
        recivedAcks = iAckHandler.getAcksFor(addr)
        # print("recivedAcks", recivedAcks)
        if recivedAcks is None:
            recivedAcks = []
        for ackElement in ackDict[addr]:
            if ackElement["id"] in recivedAcks:
                ackDict[addr].remove(ackElement)
            elif(time.time() - ackElement["time"] > 3):
                ackDict[addr].remove(ackElement)
        return len(ackDict[addr])
    return 0

def getAllDeviceLag():
    global iAckHandler,ackDict
    lagDict = {}
    for addr in ackDict:
        lagDict[addr] = getDeviceLag(addr)
    lagDict["localhost"] = 0
    lagDict["127.0.0.1"] = 0
    return lagDict