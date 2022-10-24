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

colors_list = ["red", "blue", "green"]
colors_idx = 0

bpm_list = []
prev_beat = perf_counter()
low_freq_avg_list = []
bpm_avg = 0
pingPong = False
queueToParentBPM = None
q2p = None


def plot_audio_and_detect_beats():
    if not input_recorder.has_new_audio:
        return

    # get x and y values from FFT
    xs, ys = input_recorder.fft()

    # calculate average for all frequency ranges
    y_avg = numpy.mean(ys)

    # calculate low frequency average
    low_freq = [ys[i] for i in range(len(xs)) if xs[i] < 1000]
    low_freq_avg = numpy.mean(low_freq)

    global low_freq_avg_list, pingPong
    low_freq_avg_list.append(low_freq_avg)
    cumulative_avg = numpy.mean(low_freq_avg_list)

    bass = low_freq[: int(len(low_freq) / 2)]
    bass_avg = numpy.mean(bass)
    # print("bass: {:.2f} vs cumulative: {:.2f}".format(bass_avg, cumulative_avg))

    # check if there is a beat
    # song is pretty uniform across all frequencies
    if y_avg > 10 and (
        bass_avg > cumulative_avg * 1.5
        or (low_freq_avg < y_avg * 1.2 and bass_avg > cumulative_avg)
    ):
        global prev_beat
        curr_time = perf_counter()
        # print(curr_time - prev_beat)
        if curr_time - prev_beat > 60 / 200:  # 200 BPM max

            # change the button color
            global colors_idx
            colors_idx += 1
            # uiplot.btnD.setStyleSheet("background-color: {:s}".format(colors_list[colors_idx % len(colors_list)]))

            # change the button text
            global bpm_list, bpm_avg
            bpm_avg = 0
            bpm = int(60 / (curr_time - prev_beat))
            if len(bpm_list) < 4:
                if bpm > 60:
                    bpm_list.append(bpm)
            else:
                bpm_avg = int(numpy.mean(bpm_list))
                if abs(bpm_avg - bpm) < 35:
                    bpm_list.append(bpm)
                # uiplot.btnD.setText(_fromUtf8("BPM: {:d}".format(bpm_avg)))
            # pingString = "-" if pingPong else "|"
            # sys.stdout.write("\r\r" +  pingString  + " beat: " + str(bpm_avg) + "    ")
            # sys.stdout.flush()
            queueToParentBPM.put({"beat": pingPong, "bpm": bpm_avg})
            q2p.put(json.dumps({"type": "return.beat.detected", "message": pingPong}))
            pingPong = not pingPong
            # reset the timer
            prev_beat = curr_time

    # shorten the cumulative list to account for changes in dynamics
    if len(low_freq_avg_list) > 50:
        low_freq_avg_list = low_freq_avg_list[25:]
        # print("REFRESH!!")

    # keep two 8-counts of BPMs so we can maybe catch tempo changes
    if len(bpm_list) > 24:
        bpm_list = bpm_list[8:]

    # reset song data if the song has stopped
    if y_avg < 10:
        # print("Lost beat")
        bpm_list = []
        low_freq_avg_list = []
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
        plot_audio_and_detect_beats()


if __name__ == "__main__":
    q1 = multiprocessing.SimpleQueue()
    start(q1)
