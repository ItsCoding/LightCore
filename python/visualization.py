from __future__ import print_function
from __future__ import division
import json
import multiprocessing
import random
import signal
import sys
import time
import uuid
import numpy as np
from effekts.system.abbaulicht import visualize_Abbau
from scipy.ndimage.filters import gaussian_filter1d
import config
import microphone
import dsp
import led
import effekts.misc.random as randomEffekt
import os
import effekts.scroll.scroll as scrollEffekt
import effekts.energy.energy as energyEffekt
import effekts.misc.spectrum as spectrumEffekt
import effekts.scroll.scrollExtreme as scrollExtremeEffekt
import effekts.energy.energyExtreme as energyExtremeEffekt
import effekts.flashy.flashy as flashyEffekt
import effekts.energy.energyRGB as energyRGBEffekt
import effekts.energy.multipleEnergy as multipleEnergyEffekt
import effekts.energy.rotatingEnergy as rotatingEnergyEffekt
import effekts.energy.rotatingEnergyInverted as rotatingEnergyInvertedEffekt
import effekts.energy.energyInverted as energyInvertedEffekt
import effekts.energy.energyRGBInverted as energyRGBInvertedEffekt
import effekts.energy.energyExtremeInverted as energyExtremeInvertedEffekt
import effekts.scroll.scrollInverted as scrollInvertedEffekt
import effekts.flashy.flashyBpm as flashyBpmEffekt


import effekts.system.off as OffEffekt
import effekts.system.abbaulicht as AbbaulichtEffekt

import effekts.beat.flash.flashSection as flashSectionEffekt
import effekts.beat.flash.flashSectionUpwards as flashSectionUpwardsEffekt
import effekts.beat.rush.rushUpwards as rushUpwardsEffekt
import effekts.beat.flash.flashRotating as flashRotatingEffekt
import effekts.beat.flash.flashSectionMirrored as flashSectionMirroredEffekt
import effekts.beat.flash.flashSectionUpwardsAscending as flashSectionUpwardsAscendingEffekt
import effekts.beat.flash.flashSectionRandomColor as flashSectionRandomColorEffekt
import effekts.beat.flash.flashSectionMirroredRandomColor as flashSectionMirroredRandomColorEffekt

import effekts.static.RotatingRainbow as RotatingRainbowEffekt
import effekts.static.Stars as StarsEffekt

import effekts.simple.colorStep as colorStepEffekt
import effekts.simple.colorStepRandom as colorStepRandomEffekt
import effekts.simple.colorStepRandomMultiple as colorStepRandomMultipleEffekt

import queueHandler
# import wsServer as wsServer
import composer
import randomizer
from customTypes.frequencyRange import FrequencyRange
# Import our visualization effect functions
visualize_scroll = scrollEffekt.visualize_scroll
visualize_energy = energyEffekt.visualize_energy
visualize_spectrum = spectrumEffekt.visualize_spectrum
visualize_random = randomEffekt.visualize_random
visualize_scrollExtreme = scrollExtremeEffekt.visualize_scrollExtreme
visualize_energyExtreme = energyExtremeEffekt.visualize_energyExtreme
visualize_energyRGB = energyRGBEffekt.visualize_energyRGB
visualize_flashy = flashyEffekt.visualize_flashy
visualize_multipleEnergy = multipleEnergyEffekt.visualize_multipleEnergy
visualize_rotatingEnergy = rotatingEnergyEffekt.visualize_rotatingEnergy
visualize_Off = OffEffekt.visualize_OFF
visualize_energyInverted = energyInvertedEffekt.visualize_energyInverted
visualize_energyRGBInverted = energyRGBInvertedEffekt.visualize_energyRGBInverted
visualize_energyExtremeInverted = energyExtremeInvertedEffekt.visualize_energyExtremeInverted
visualize_scrollInverted = scrollInvertedEffekt.visualize_scrollInverted
visualize_flashyBpm = flashyBpmEffekt.visualize_flashyBPM
visualize_flashSection = flashSectionEffekt.visualize_flashSection
visualize_flashSectionUpwards = flashSectionUpwardsEffekt.visualize_flashSectionUpwards
visualize_rushUpwards = rushUpwardsEffekt.visualize_rushUpwards
visualize_flashRotating = flashRotatingEffekt.visualize_flashRotating
visualize_flashSectionMirrored = flashSectionMirroredEffekt.visualize_flashSectionMirrored
visualize_rotatingEnergyInverted = rotatingEnergyInvertedEffekt.visualize_rotatingEnergyInverted
visualize_flashSectionUpwardsAscending = flashSectionUpwardsAscendingEffekt.visualize_flashSectionUpwardsAscending
visualize_flashSectionRandomColor = flashSectionRandomColorEffekt.visualize_flashSectionRandomColor
visualize_flashSectionMirroredRandomColor = flashSectionMirroredRandomColorEffekt.visualize_flashSectionMirroredRandomColor
visualize_rotatingRainbow = RotatingRainbowEffekt.visualize_rotatingRainbow
visualize_stars = StarsEffekt.visualize_stars
visualize_colorStep = colorStepEffekt.visualize_colorStep
visualize_colorStepRandom = colorStepRandomEffekt.visualize_colorStepRandom
visualize_colorStepRandomMultiple = colorStepRandomMultipleEffekt.visualize_colorStepRandomMultiple
visualize_Abbau = AbbaulichtEffekt.visualize_Abbau
# composer.addEffekt(visualize_scroll,FrequencyRange.ALL,0,75,100)


# Setting Global Vars

def checkInDir(dir, key):
    for d in dir:
        if key in d:
            return True
    return False
class Visualization:
    def __init__(self):
        self._time_prev = time.time() * 1000.0
        """The previous time that the frames_per_second() function was called"""
        self._fps = dsp.ExpFilter(val=config.FPS, alpha_decay=0.2, alpha_rise=0.2)
        """The low-pass filter used to estimate frames-per-second"""
        self._lastTime = time.time()
        self._randomWait = 0
        self.output = []
        self.fft_plot_filter = dsp.ExpFilter(np.tile(1e-1, config.cfg["frequencyBins"]),
                                alpha_decay=0.5, alpha_rise=0.99)

        self.mel_gain = dsp.ExpFilter(np.tile(1e-1, config.cfg["frequencyBins"]),
                                alpha_decay=0.01, alpha_rise=0.99)

        self.mel_smoothing = dsp.ExpFilter(np.tile(1e-1, config.cfg["frequencyBins"]),
                                alpha_decay=0.5, alpha_rise=0.99)

        self.volume = dsp.ExpFilter(config.MIN_VOLUME_THRESHOLD,
                            alpha_decay=0.02, alpha_rise=0.02)

        self.fft_window = np.hamming(int(config.MIC_RATE / config.FPS) * config.N_ROLLING_HISTORY)
        self.prev_fps_update = time.time()
        # Set the visualization effect to be used
        self.visualization_effect = visualize_scroll
        # Number of audio samples to read every time frame
        self.samples_per_frame = int(config.MIC_RATE / config.FPS)
        # Array containing the rolling audio sample window
        self.y_roll = np.random.rand(config.N_ROLLING_HISTORY, self.samples_per_frame) / 1e16
        self.app = None
        self.queue2Thread = None
        self.queue2Parent = None
        self.bpmQueue = None
        self.fft_plot = None
        self.mel_curve = None
        self.r_curve = None
        self.g_curve = None
        self.b_curve = None
        self.avg_Bpm = 0
        self.beat = False
        self.randomEffekts = None
        self.allEffekts = None
        self.OFF_EFFEKT = visualize_Off
        self.ENDABLED_RND_PARTS = {
            0: True,
            1: True,
            2: True,
            3: True,
        }
        self.noAudioCount = 0
        self.hasBeatChanged = False
        self.lastBeatPacket = 0
        #CONFIG VARS
        self.randomEnabled = True
        self.randomizerBeatCount = 0
    def frames_per_second(self):
        """Return the estimated frames per second

        Returns the current estimate for frames-per-second (FPS).
        FPS is estimated by measured the amount of time that has elapsed since
        this function was previously called. The FPS estimate is low-pass filtered
        to reduce noise.

        This function is intended to be called one time for every iteration of
        the program's main loop.

        Returns
        -------
        fps : float
            Estimated frames-per-second. This value is low-pass filtered
            to reduce noise.
        """
        
        time_now = time.time() * 1000.0
        dt = time_now - self._time_prev
        self._time_prev = time_now
        if dt == 0.0:
            return self._fps.value
        return self._fps.update(1000.0 / dt)


    def microphone_update(self,audio_samples):
        # time.sleep(0.01)
        self.hasBeatChanged = False
        self.hasBeatChangedManual = False
        queueHandler.handleQueue(self.queue2Thread,self.queue2Parent,self)
        while not self.bpmQueue.empty() and config.cfg["beatDetection"]:
            message = self.bpmQueue.get()
            self.beat = message["beat"]
            self.avg_Bpm = message["bpm"]
            self.hasBeatChanged = True
            self.randomizerBeatCount += 1
            if(config.DISPLAY_BPM):
                if(self.beat):
                    print("- BPM: " + str(self.avg_Bpm) + " => " + str(self.randomizerBeatCount % config.cfg["musicBeatsBar"]))
                else:
                    print("| BPM: " + str(self.avg_Bpm)+ " => " + str(self.randomizerBeatCount % config.cfg["musicBeatsBar"]))
        self.hasBeatChanged = (self.hasBeatChanged or self.hasBeatChangedManual)
        # Normalize samples between 0 and 1
        y = audio_samples / 2.0**15
        # Construct a rolling window of audio samples
        self.y_roll[:-1] = self.y_roll[1:]
        self.y_roll[-1, :] = np.copy(y)
        y_data = np.concatenate(self.y_roll, axis=0).astype(np.float32)
        mel = np.tile(0,config.N_FFT_BINS)

        vol = np.max(np.abs(y_data))
        if vol < config.MIN_VOLUME_THRESHOLD:
            if self.noAudioCount > 50:
                self.noAudioCount = 0
                if config.DEBUG_LOG:
                    print('No audio input. Volume below threshold. Volume:', vol, 'Count:', self.noAudioCount)
            self.noAudioCount += 1
            # led.update()
        else:
            # Transform audio input into the frequency domain
            N = len(y_data)
            N_zeros = 2**int(np.ceil(np.log2(N))) - N
            # Pad with zeros until the next power of two
            y_data *= self.fft_window
            y_padded = np.pad(y_data, (0, N_zeros), mode='constant')
            YS = np.abs(np.fft.rfft(y_padded)[:N // 2])
            # Construct a Mel filterbank from the FFT data
            mel = np.atleast_2d(YS).T * dsp.mel_y.T
            # Scale data to values more suitable for visualization
            # mel = np.sum(mel, axis=0)
            mel = np.sum(mel, axis=0)
            mel = mel**2.0
            # Gain normalization
            self.mel_gain.update(np.max(gaussian_filter1d(mel, sigma=1.0)))
            mel /= self.mel_gain.value
            mel = self.mel_smoothing.update(mel)
            # Map filterbank output onto LED strip
            # try:
        if self.randomEnabled:
            randomizer.changeEffekt(self.hasBeatChanged)
        # mel = np.concatenate((mel[:6],np.full(26,0)),axis=0)
        composerOutput = composer.getComposition(mel,self,self.hasBeatChanged)
        if(len(composerOutput) > 0 and 0 in composerOutput and "getLEDS" in dir(composerOutput[0])):
            self.output = composerOutput[0].getLEDS()
        # print(output)
        # output = visualization_effect(mel)
        # output += visualize_energy(mel)
        
        led.pixels = self.output
        led.update(composerOutput,self.queue2Parent)
        if config.USE_GUI:
            # Plot filterbank output
            x = np.linspace(config.MIN_FREQUENCY, config.MAX_FREQUENCY, len(mel))
            self.mel_curve.setData(x=x, y=self.fft_plot_filter.update(mel))
            # Plot the color channels
            self.r_curve.setData(y=led.pixels[0])
            self.g_curve.setData(y=led.pixels[1])
            self.b_curve.setData(y=led.pixels[2])
        if config.USE_GUI:
            self.app.processEvents()
        
        if config.DISPLAY_FPS:
            fps = self.frames_per_second()
            if time.time() - 1 > self.prev_fps_update:
                self.prev_fps_update = time.time()
                if config.DEBUG_LOG:
                    print('FPS {:.0f} / {:.0f}'.format(fps, config.FPS))

    # def checkIfAllowed(self,rnd1,rnd2):
    #     if(rnd1 == visualize_rotatingRainbow and rnd2 == visualize_rotatingRainbow):
    #         return False
    #     return True

    
        

    def checkIfDrop(self): 
        rCheck = all(v == 0 for v in led.pixels[0])
        gCheck = all(v == 0 for v in led.pixels[1])
        bCheck = all(v == 0 for v in led.pixels[2])
        return (rCheck and gCheck and bCheck and (time.time() - self._lastTime >= 10))

    def minute_passed(self):
        return time.time() - self._lastTime >= self._randomWait

   



    def start(self, q2t, q2p, bpmQ):
        self.queue2Thread = q2t
        self.bpmQueue = bpmQ
        self.queue2Parent = q2p
        self.randomEffekts = [visualize_spectrum,visualize_energy,visualize_scroll,visualize_random,visualize_scrollExtreme,
                            visualize_energyExtreme,visualize_energyRGB,visualize_flashy,visualize_multipleEnergy,visualize_rotatingEnergy,
                            visualize_energyInverted,visualize_energyRGBInverted,visualize_energyExtremeInverted,visualize_scrollInverted,
                            visualize_flashyBpm,visualize_flashSection,visualize_flashSectionUpwards,visualize_rushUpwards,
                            visualize_flashRotating,visualize_flashSectionMirrored,visualize_rotatingEnergyInverted,visualize_flashSectionUpwardsAscending,
                            visualize_flashSectionRandomColor,visualize_flashSectionMirroredRandomColor,visualize_rotatingRainbow,visualize_stars,
                            visualize_colorStep,visualize_colorStepRandom,visualize_colorStepRandomMultiple]
        self.allEffekts = self.randomEffekts + [visualize_Off,visualize_Abbau]
        randomizer.initRandomizer(queueHandler,self)
        if config.USE_GUI:
            import pyqtgraph as pg
            from pyqtgraph.Qt import QtGui, QtCore
            # Create GUI window
            self.app = QtGui.QApplication([])
            view = pg.GraphicsView()
            layout = pg.GraphicsLayout(border=(100,100,100))
            view.setCentralItem(layout)
            view.show()
            view.setWindowTitle('Visualization')
            view.resize(800,600)
            # Mel filterbank plot
            self.fft_plot = layout.addPlot(title='Filterbank Output', colspan=3)
            self.fft_plot.setRange(yRange=[-0.1, 1.2])
            self.fft_plot.disableAutoRange(axis=pg.ViewBox.YAxis)
            x_data = np.array(range(1, config.cfg["frequencyBins"] + 1))
            self.mel_curve = pg.PlotCurveItem()
            self.mel_curve.setData(x=x_data, y=x_data*0)
            self.fft_plot.addItem(self.mel_curve)
            # Visualization plotself.
            layout.nextRow()
            led_plot = layout.addPlot(title='Visualization Output', colspan=3)
            led_plot.setRange(yRange=[-5, 260])
            led_plot.disableAutoRange(axis=pg.ViewBox.YAxis)
            # Pen for each of the color channel curves
            r_pen = pg.mkPen((255, 30, 30, 200), width=4)
            g_pen = pg.mkPen((30, 255, 30, 200), width=4)
            b_pen = pg.mkPen((30, 30, 255, 200), width=4)
            # Color channel curves
            self.r_curve = pg.PlotCurveItem(pen=r_pen)
            self.g_curve = pg.PlotCurveItem(pen=g_pen)
            self.b_curve = pg.PlotCurveItem(pen=b_pen)
            # Define x data
            x_data = np.array(range(1, config.STRIP_LED_COUNTS[0] + 1))
            self.r_curve.setData(x=x_data, y=x_data*0)
            self.g_curve.setData(x=x_data, y=x_data*0)
            self.b_curve.setData(x=x_data, y=x_data*0)
            # Add curves to plot
            led_plot.addItem(self.r_curve)
            led_plot.addItem(self.g_curve)
            led_plot.addItem(self.b_curve)
            # Frequency range label
            freq_label = pg.LabelItem('')
            # Frequency slider
            def freq_slider_change(tick):
                minf = freq_slider.tickValue(0)**2.0 * (config.MIC_RATE / 2.0)
                maxf = freq_slider.tickValue(1)**2.0 * (config.MIC_RATE / 2.0)
                t = 'Frequency range: {:.0f} - {:.0f} Hz'.format(minf, maxf)
                freq_label.setText(t)
                config.cfg["minFrequency"] = minf
                config.cfg["maxFrequency"] = maxf
                dsp.create_mel_bank()
            freq_slider = pg.TickSliderItem(orientation='bottom', allowAdd=False)
            freq_slider.tickMoveFinished = freq_slider_change
            freq_slider.addTick((config.MIN_FREQUENCY / (config.MIC_RATE / 2.0))**0.5)
            freq_slider.addTick((config.MAX_FREQUENCY / (config.MIC_RATE / 2.0))**0.5)
            freq_label.setText('Frequency range: {} - {} Hz'.format(
                config.cfg["minFrequency"],
                config.cfg["maxFrequency"]))
            # Effect selection
            active_color = '#16dbeb'
            inactive_color = '#FFFFFF'
            def energy_click(x):
                # visualization_effect = visualize_energy
                composer.clear()
                composer.addEffekt(visualize_energyRGB(1),FrequencyRange.low,1,0,180)
                composer.addEffekt(visualize_energyExtreme(0),FrequencyRange.midHigh,0,0,100)
                energy_label.setText('Energy', color=active_color)
                scroll_label.setText('Scroll', color=inactive_color)
                spectrum_label.setText('Spectrum', color=inactive_color)
            def scroll_click(x):
                composer.clear()
                composer.addEffekt(visualize_scroll(1),FrequencyRange.low,1,0,180)
                composer.addEffekt(visualize_scrollExtreme(0),FrequencyRange.midHigh,0,0,100)
                # visualization_effect = visualize_scroll
                energy_label.setText('Energy', color=inactive_color)
                scroll_label.setText('Scroll', color=active_color)
                spectrum_label.setText('Spectrum', color=inactive_color)
            def spectrum_click(x):
                composer.clear()
                composer.addEffekt(visualize_random(1),FrequencyRange.low,1,0,180)
                composer.addEffekt(visualize_flashy(0),FrequencyRange.all,0,0,100)
                energy_label.setText('Energy', color=inactive_color)
                scroll_label.setText('Scroll', color=inactive_color)
                spectrum_label.setText('Spectrum', color=active_color)
            # Create effect "buttons" (labels with click event)
            energy_label = pg.LabelItem('Energy')
            scroll_label = pg.LabelItem('Scroll')
            spectrum_label = pg.LabelItem('Spectrum')
            energy_label.mousePressEvent = energy_click
            scroll_label.mousePressEvent = scroll_click
            spectrum_label.mousePressEvent = spectrum_click
            # energy_click(0)
            # Layout
            layout.nextRow()
            layout.addItem(freq_label, colspan=3)
            layout.nextRow()
            layout.addItem(freq_slider, colspan=3)
            layout.nextRow()
            layout.addItem(energy_label)
            layout.addItem(scroll_label)
            layout.addItem(spectrum_label)
        # Initialize LEDs
        # led.update()
        # Start listening to live audio stream
        # wsServer.initServer()
        # for i in range(0,config.STRIP_COUNT - 1):
            # self.DISABLED_RND_PARTS[i] = True
        composer.addEffekt(visualize_energy(0),FrequencyRange.all,0,0,180)
        composer.addEffekt(visualize_energy(1),FrequencyRange.all,1,0,100)
        microphone.start_stream(self.microphone_update)



if __name__ == '__main__':
    vis = Visualization()
    queue = multiprocessing.SimpleQueue()
    vis.start(queue)