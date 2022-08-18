from asyncio.windows_events import NULL
import datetime
import multiprocessing
import signal
import time
import numpy as np
import pyaudio
import config

threa = None
def task(callback):
    global killMe
    p = pyaudio.PyAudio()
    frames_per_buffer = int(config.MIC_RATE / config.FPS)
    stream = p.open(format=pyaudio.paInt16,
                    channels=1,
                    rate=config.MIC_RATE,
                    input=True,
                    frames_per_buffer=frames_per_buffer)
    overflows = 0
    prev_ovf_time = time.time()
    while True:
        try:
            y = np.fromstring(stream.read(frames_per_buffer, exception_on_overflow=False), dtype=np.int16)
            y = y.astype(np.float32)
            stream.read(stream.get_read_available(), exception_on_overflow=False)
            callback(y)
        except IOError:
            overflows += 1
            if time.time() > prev_ovf_time + 1:
                prev_ovf_time = time.time()
                print('Audio buffer has overflowed {} times'.format(overflows))
    stream.stop_stream()
    stream.close()
    p.terminate()

def start_stream(callback):
    global thread
    if not config.USE_GUI:
        print('Starting audio stream in separate thread...')
        thread = multiprocessing.Process(target=task, args=(callback,))
        thread.start()
        while thread.is_alive():
            time.sleep(0.2)
    else:
        print("Running on same threrad as GUI")
        task(callback)

def signal_handler(sig, frame):
    global thread
    if thread:
        thread.terminate()
    print('You pressed Ctrl+C!')
    exit(1)

signal.signal(signal.SIGINT, signal_handler)

