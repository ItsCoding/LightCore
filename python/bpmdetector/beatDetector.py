"""
Sources

http://www.swharden.com/blog/2013-05-09-realtime-fft-audio-visualization-with-python/
http://julip.co/2012/05/arduino-python-soundlight-spectrum/
"""

import json
import signal
import sys
import numpy
from bpmdetector.recorder import *
from time import perf_counter, sleep
import multiprocessing
import config
colors_list = ["red", "blue", "green"]
colors_idx = 0


queueToParentBPM = None
q2p = None

typeDict = {
    0: "low",
    1: "mid",
    2: "high",
    4: "all"
}
detectorDict = {}
# make for each type a detector
def plot_audio_and_detect_beats(xs, ys, type):
    global detectorDict
    if type not in detectorDict:
        detectorDict[type] = BeatDetector()
    detectorDict[type].detect(xs, ys, type)

def getBeats():
    if not input_recorder.has_new_audio:
        return
    xs, ys = input_recorder.fft()
    chunkSizeXs = len(xs) // 3
    chunkSizeYs = len(ys) // 3

   
    for x in range(0,3):
        xsE = xs[chunkSizeXs * x :chunkSizeXs * (x + 1)]
        ysE = ys[chunkSizeYs * x :chunkSizeYs * (x + 1)]
        plot_audio_and_detect_beats(xsE, ysE, typeDict[x])
    plot_audio_and_detect_beats(xs, ys, typeDict[4])
        
class BeatDetector:
    def __init__(self):
        self.bpm_list = []
        self.prev_beat = perf_counter()
        self.low_freq_avg_list = []
        self.bpm_avg = 0
        self.pingPong = False

    def detect(self,xs,ys,type):
        if not input_recorder.has_new_audio:
            return

        # get x and y values from FFT
        # ys = numpy.tile(0,config.N_FFT_BINS)
        # xs = numpy.tile(0,config.N_FFT_BINS)
        # calculate average for all frequency ranges
        y_avg = numpy.mean(ys)
        # print("YS Length: ", len(ys))
        # calculate low frequency average
        low_freq = [ys[i] for i in range(len(xs)) if xs[i] < 1000]
        low_freq_avg = numpy.mean(low_freq)

        self.low_freq_avg_list.append(low_freq_avg)
        cumulative_avg = numpy.mean(self.low_freq_avg_list)

        bass = low_freq[: int(len(low_freq) / 2)]
        bass_avg = numpy.mean(bass)
        # print("bass: {:.2f} vs cumulative: {:.2f}".format(bass_avg, cumulative_avg))

        # check if there is a beat
        # song is pretty uniform across all frequencies
        if y_avg > 10 and (
            bass_avg > cumulative_avg * 1.5
            or (low_freq_avg < y_avg * 1.2 and bass_avg > cumulative_avg)
        ):
            curr_time = perf_counter()
            # print(curr_time - prev_beat)
            if curr_time - self.prev_beat > 60 / 200:  # 200 BPM max


                self.bpm_avg = 0
                bpm = int(60 / (curr_time - self.prev_beat))
                if len(self.bpm_list) < 4:
                    if bpm > 60:
                        self.bpm_list.append(bpm)
                else:
                    self.bpm_avg = int(numpy.mean(self.bpm_list))
                    if abs(self.bpm_avg - bpm) < 35:
                        self.bpm_list.append(bpm)
                    # uiplot.btnD.setText(_fromUtf8("BPM: {:d}".format(self.bpm_avg)))
                # pingString = "-" if pingPong else "|"
                # sys.stdout.write("\r\r" +  pingString  + " beat: " + str(self.bpm_avg) + "    ")
                # sys.stdout.flush()
                queueToParentBPM.put({"beat": self.pingPong, "bpm": self.bpm_avg, "type": type})
                q2p.put(json.dumps({"type": "return.beat.detected", "message": {"beat": self.pingPong, "bpm": self.bpm_avg, "type": type}}))
                self.pingPong = not self.pingPong
                # reset the timer
                self.prev_beat = curr_time

        # shorten the cumulative list to account for changes in dynamics
        if len(self.low_freq_avg_list) > 50:
            self.low_freq_avg_list = self.low_freq_avg_list[25:]
            # print("REFRESH!!")

        # keep two 8-counts of BPMs so we can maybe catch tempo changes
        if len(self.bpm_list) > 24:
            self.bpm_list = self.bpm_list[8:]

        # reset song data if the song has stopped
        if y_avg < 10:
            # print("Lost beat")
            self.bpm_list = []
            self.low_freq_avg_list = []
            # uiplot.btnD.setText(_fromUtf8("BPM"))
            # print("new song")

        # plot the data
        # c.setData(xs, ys)
        # uiplot.qwtPlot.replot()
        input_recorder.newAudio = False


def handler(signum, frame):
    global input_recorder
    input_recorder.close()
    exit(1)


def start(queue, queue2Parent):
    global input_recorder, queueToParentBPM, q2p
    queueToParentBPM = queue
    q2p = queue2Parent
    signal.signal(signal.SIGINT, handler)
    input_recorder = InputRecorder()
    input_recorder.start()
    while True:
        sleep(0.001)
        getBeats()


if __name__ == "__main__":
    q1 = multiprocessing.SimpleQueue()
    start(q1)
