from __future__ import division, print_function

import multiprocessing
import time

import numpy as np
from effekts.static.StarsActive import visualize_starsActive
from effekts.wash.washColorInverted import visualize_washColorInverted
from effekts.beat.run.run import visualize_run
from effekts.beat.run.runMirrored import visualize_runMirrored
from scipy.ndimage.filters import gaussian_filter1d

# import wsServer as wsServer
import composer
import config
import dsp
import effekts.beat.flash.flashRotating as flashRotatingEffekt
import effekts.beat.flash.flashSection as flashSectionEffekt
import effekts.beat.flash.flashSectionMirrored as flashSectionMirroredEffekt
import effekts.beat.flash.flashSectionMirroredRandomColor as flashSectionMirroredRandomColorEffekt
import effekts.beat.flash.flashSectionRandomColor as flashSectionRandomColorEffekt
import effekts.beat.flash.flashSectionUpwards as flashSectionUpwardsEffekt
import effekts.beat.flash.flashSectionUpwardsAscending as flashSectionUpwardsAscendingEffekt
import effekts.beat.rush.rushUpwards as rushUpwardsEffekt
import effekts.beat.zoop.zoop as zoopEffekt
import effekts.energy.energy as energyEffekt
import effekts.energy.energyExtreme as energyExtremeEffekt
import effekts.energy.energyExtremeColor as energyExtremeColorEffekt
import effekts.energy.energyExtremeColorInverted as energyExtremeColorInvertedEffekt
import effekts.energy.energyExtremeInverted as energyExtremeInvertedEffekt
import effekts.energy.energyInverted as energyInvertedEffekt
import effekts.energy.energyRGB as energyRGBEffekt
import effekts.energy.energyRGBInverted as energyRGBInvertedEffekt
import effekts.energy.multipleEnergy as multipleEnergyEffekt
import effekts.energy.rotatingEnergy as rotatingEnergyEffekt
import effekts.energy.rotatingEnergyInverted as rotatingEnergyInvertedEffekt
import effekts.flashy.flashy as flashyEffekt
import effekts.flashy.flashyBpm as flashyBpmEffekt
import effekts.misc.random as randomEffekt
import effekts.misc.spectrum as spectrumEffekt
import effekts.scroll.scroll as scrollEffekt
import effekts.scroll.scrollExtreme as scrollExtremeEffekt
import effekts.scroll.scrollInverted as scrollInvertedEffekt
import effekts.simple.colorStep as colorStepEffekt
import effekts.simple.colorStepRandom as colorStepRandomEffekt
import effekts.simple.colorStepRandomMultiple as colorStepRandomMultipleEffekt
import effekts.static.RotatingRainbow as RotatingRainbowEffekt
import effekts.static.Stars as StarsEffekt
import effekts.system.off as OffEffekt
import led
import microphone
import queueHandler
import randomizer
from customTypes.frequencyRange import FrequencyRange
from effekts.energy.multipleEnergyColor import visualize_multipleEnergyColor
from effekts.energy.rotatingEnergyColor import visualize_rotatingEnergyColor
from effekts.energy.rotatingEnergyInvertedColor import \
    visualize_rotatingEnergyInvertedColor
from effekts.scroll.scrollExtremeColor import visualize_scrollExtremeColor
from effekts.scroll.scrollExtremeColorInverted import \
    visualize_scrollExtremeColorInverted
from effekts.system.abbaulicht import visualize_Abbau
from effekts.wash.washColor import visualize_washColor

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
visualize_Zoop = zoopEffekt.visualize_Zoop
visualize_energyExtremeColor = energyExtremeColorEffekt.visualize_energyExtremeColor
visualize_energyExtremeColorInverted = energyExtremeColorInvertedEffekt.visualize_energyExtremeColorInverted
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

        self.mel_gain = dsp.ExpFilter(np.tile(1e-1, config.cfg["frequencyBins"]),
                                alpha_decay=0.01, alpha_rise=0.99)

        self.mel_smoothing = dsp.ExpFilter(np.tile(1e-1, config.cfg["frequencyBins"]),
                                alpha_decay=0.5, alpha_rise=0.99)

        self.fft_window = np.hamming(config.FRAMES_PER_BUFFER * config.N_ROLLING_HISTORY)
        self.prev_fps_update = time.time()
        # Set the visualization effect to be used
        # Number of audio samples to read every time frame
        # Array containing the rolling audio sample window
        self.y_roll = np.random.rand(config.N_ROLLING_HISTORY, config.FRAMES_PER_BUFFER) / 1e16
        self.queue2Thread = None
        self.queue2Parent = None
        self.bpmQueue = None
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
            4: True,
            5: True,
            6: True,
            7: True,
            8: True,
            9: True
        }
        self.noAudioCount = 0
        self.hasBeatChanged = False
        #CONFIG VARS
        self.randomEnabled = False
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
        if config.cfg["beatDetection"]:
            while not self.bpmQueue.empty():
                message = self.bpmQueue.get()
                self.avg_Bpm = message["bpm"]
                if self.beat != message["beat"]:
                    self.beat = message["beat"]
                    self.hasBeatChanged = True
                    self.randomizerBeatCount += 1
                if(config.DISPLAY_BPM):
                    if(self.beat):
                        print("- BPM: " + str(self.avg_Bpm) + " => " + str(self.randomizerBeatCount % config.cfg["musicBeatsBar"]))
                    else:
                        print("| BPM: " + str(self.avg_Bpm)+ " => " + str(self.randomizerBeatCount % config.cfg["musicBeatsBar"]))
        else:
            #throw all packets away so they dont stack up
             while not self.bpmQueue.empty():
                message = self.bpmQueue.get()
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
        composerOutput = composer.getComposition(mel,self,self.hasBeatChanged)
        led.update(composerOutput,self.queue2Parent)
        if config.DISPLAY_FPS:
            fps = self.frames_per_second()
            if time.time() - 1 > self.prev_fps_update:
                self.prev_fps_update = time.time()
                if config.DEBUG_LOG:
                    print('FPS {:.0f} / {:.0f}'.format(fps, config.FPS))


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
                            visualize_colorStep,visualize_colorStepRandom,visualize_colorStepRandomMultiple,visualize_Zoop,visualize_energyExtremeColor,
                            visualize_energyExtremeColorInverted,visualize_rotatingEnergyColor,visualize_rotatingEnergyInvertedColor,visualize_multipleEnergyColor,
                            visualize_scrollExtremeColor,visualize_scrollExtremeColorInverted,visualize_washColor,visualize_starsActive,visualize_run,
                            visualize_runMirrored,visualize_washColorInverted]
        self.allEffekts = self.randomEffekts + [visualize_Off,visualize_Abbau]
        randomizer.initRandomizer(queueHandler,self)

        composer.addEffekt(visualize_runMirrored(0),FrequencyRange.all,0,0,300)
        composer.addEffekt(visualize_runMirrored(1),FrequencyRange.all,1,0,540)
        composer.addEffekt(visualize_runMirrored(2),FrequencyRange.all,2,0,50)
        composer.addEffekt(visualize_runMirrored(3),FrequencyRange.all,3,0,50)
        microphone.start_stream(self.microphone_update)

def exec_vis() :
    vis = Visualization()
    queue = multiprocessing.SimpleQueue()
    queue1 = multiprocessing.SimpleQueue()
    queue2 = multiprocessing.SimpleQueue()
    vis.start(queue,queue1,queue2)

if __name__ == '__main__':
    # import cProfile
    # cProfile.run(statement='exec_vis()',sort="cumtime")
    exec_vis()
   
