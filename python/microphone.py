import time
import numpy as np
import pyaudio
import config
import wave

p = pyaudio.PyAudio()
FORMAT = pyaudio.paInt16
RATE = config.MIC_RATE
CHUNK = 1024
RECORD_SECONDS = 5
WAVE_OUTPUT_FILENAME = "file.wav"

audioStream = None
threa = None
audioFrames = []
frames_per_buffer = int(config.MIC_RATE / config.FPS)


def saveAudioData():
    global frameCount
    global audioFrames
    waveFile = wave.open(WAVE_OUTPUT_FILENAME, 'wb')
    waveFile.setnchannels(1)
    waveFile.setsampwidth(p.get_sample_size(FORMAT))
    waveFile.setframerate(config.MIC_RATE)
    waveFile.writeframes(b''.join(audioFrames))
    waveFile.close()
    print("Saved to file")

def start_stream(callback):
    global killMe
    global audioFrames
    global audioStream
    global frames_per_buffer
  
    audioStream = p.open(format=pyaudio.paInt16,
                    channels=1,
                    rate=config.MIC_RATE,
                    input=True,
                    frames_per_buffer=frames_per_buffer)
    overflows = 0
    prev_ovf_time = time.time()
    while True:
        try:
            startTime = time.time()
            audioData = audioStream.read(frames_per_buffer, exception_on_overflow=False)
            if config.RECORD_SAMPLES:
                audioFrames.append(audioData)
                if len(audioFrames) > 350:
                    saveAudioData()
                    audioFrames = []
            y = np.fromstring(audioData, dtype=np.int16)
            y = y.astype(np.float32)
            # print(audioStream.get_read_available())

            # crank fps here, runs with 400-600fps on windows
            # audioStream.read(800, exception_on_overflow=False)
            endTime = time.time()
            callback(y, endTime - startTime)
        except IOError as e:
            overflows += 1
            if time.time() > prev_ovf_time + 1:
                print(e)
                prev_ovf_time = time.time()
                print('Audio buffer has overflowed {} times'.format(overflows))
    audioStream.stop_stream()
    audioStream.close()
    p.terminate()

# def start_stream(callback):
#     global thread
#     if not config.USE_GUI:
#         print('Starting audio stream in separate thread...')
#         thread = multiprocessing.Process(target=task, args=(callback,))
#         thread.start()
#         while thread.is_alive():
#             time.sleep(0.2)
#     else:
#         print("Running on same threrad as GUI")
#         task(callback)

# def signal_handler(sig, frame):
#     global thread
#     if thread:
#         thread.terminate()
#     print('You pressed Ctrl+C!')
#     exit(1)

# signal.signal(signal.SIGINT, signal_handler)

