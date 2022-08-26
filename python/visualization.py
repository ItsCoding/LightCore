from __future__ import print_function
from __future__ import division
import random
import signal
import sys
import time
import numpy as np
from scipy.ndimage.filters import gaussian_filter1d
import config
import microphone
import dsp
import led
import effekts.random as randomEffekt
import os
import effekts.scroll as scrollEffekt
import effekts.energy as energyEffekt
import effekts.spectrum as spectrumEffekt
import effekts.scrollExtreme as scrollExtremeEffekt
import effekts.energyExtreme as energyExtremeEffekt
import effekts.flashy as flashyEffekt
import effekts.energyRGB as energyRGBEffekt
import effekts.multipleEnergy as multipleEnergyEffekt
import effekts.rotatingEnergy as rotatingEnergyEffekt
import composer
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

# composer.addEffekt(visualize_scroll,FrequencyRange.ALL,0,75,100)
composer.addEffekt(visualize_rotatingEnergy(1),FrequencyRange.all,1,0,180)
composer.addEffekt(visualize_multipleEnergy(2),FrequencyRange.all,0,0,100)


# Setting Global Vars
clear = lambda: os.system('clear')
_time_prev = time.time() * 1000.0
"""The previous time that the frames_per_second() function was called"""
_fps = dsp.ExpFilter(val=config.FPS, alpha_decay=0.2, alpha_rise=0.2)
"""The low-pass filter used to estimate frames-per-second"""
_lastTime = time.time()
_randomWait = 0
output = []
fft_plot_filter = dsp.ExpFilter(np.tile(1e-1, config.N_FFT_BINS),
                         alpha_decay=0.5, alpha_rise=0.99)

mel_gain = dsp.ExpFilter(np.tile(1e-1, config.N_FFT_BINS),
                         alpha_decay=0.01, alpha_rise=0.99)

mel_smoothing = dsp.ExpFilter(np.tile(1e-1, config.N_FFT_BINS),
                         alpha_decay=0.5, alpha_rise=0.99)

volume = dsp.ExpFilter(config.MIN_VOLUME_THRESHOLD,
                       alpha_decay=0.02, alpha_rise=0.02)

fft_window = np.hamming(int(config.MIC_RATE / config.FPS) * config.N_ROLLING_HISTORY)
prev_fps_update = time.time()
# Set the visualization effect to be used
visualization_effect = visualize_scroll
# Number of audio samples to read every time frame
samples_per_frame = int(config.MIC_RATE / config.FPS)
# Array containing the rolling audio sample window
y_roll = np.random.rand(config.N_ROLLING_HISTORY, samples_per_frame) / 1e16

def frames_per_second():
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
    global _time_prev, _fps
    changeEffekt()
    time_now = time.time() * 1000.0
    dt = time_now - _time_prev
    _time_prev = time_now
    if dt == 0.0:
        return _fps.value
    return _fps.update(1000.0 / dt)


def microphone_update(audio_samples):
    global y_roll, prev_rms, prev_exp, prev_fps_update, output
    # Normalize samples between 0 and 1
    y = audio_samples / 2.0**15
    # Construct a rolling window of audio samples
    y_roll[:-1] = y_roll[1:]
    y_roll[-1, :] = np.copy(y)
    y_data = np.concatenate(y_roll, axis=0).astype(np.float32)
    
    vol = np.max(np.abs(y_data))
    if vol < config.MIN_VOLUME_THRESHOLD:
        print('No audio input. Volume below threshold. Volume:', vol)
        # led.pixels = np.tile(0, (3, config.N_PIXELS))
        # led.update()
    else:
        # Transform audio input into the frequency domain
        N = len(y_data)
        N_zeros = 2**int(np.ceil(np.log2(N))) - N
        # Pad with zeros until the next power of two
        y_data *= fft_window
        y_padded = np.pad(y_data, (0, N_zeros), mode='constant')
        YS = np.abs(np.fft.rfft(y_padded)[:N // 2])
        # Construct a Mel filterbank from the FFT data
        mel = np.atleast_2d(YS).T * dsp.mel_y.T
        # Scale data to values more suitable for visualization
        # mel = np.sum(mel, axis=0)
        mel = np.sum(mel, axis=0)
        mel = mel**2.0
        # Gain normalization
        mel_gain.update(np.max(gaussian_filter1d(mel, sigma=1.0)))
        mel /= mel_gain.value
        mel = mel_smoothing.update(mel)
        # Map filterbank output onto LED strip
        
        # mel = np.concatenate((mel[:6],np.full(26,0)),axis=0)
        composerOutput = composer.getComposition(mel)
        output = composerOutput[0].getLEDS()
        # print(output)
        # output = visualization_effect(mel)
        # output += visualize_energy(mel)

        led.pixels = output
        led.update(composerOutput)
        if config.USE_GUI:
            # Plot filterbank output
            x = np.linspace(config.MIN_FREQUENCY, config.MAX_FREQUENCY, len(mel))
            mel_curve.setData(x=x, y=fft_plot_filter.update(mel))
            # Plot the color channels
            r_curve.setData(y=led.pixels[0])
            g_curve.setData(y=led.pixels[1])
            b_curve.setData(y=led.pixels[2])
    if config.USE_GUI:
        app.processEvents()
    
    if config.DISPLAY_FPS:
        fps = frames_per_second()
        if time.time() - 1 > prev_fps_update:
            prev_fps_update = time.time()
            print('FPS {:.0f} / {:.0f}'.format(fps, config.FPS))

def makeRandomComposition():
    global composer
    triangleRandomFrequencys = [FrequencyRange.all, FrequencyRange.low]
    middleRandomFrequencys = [FrequencyRange.all, FrequencyRange.high,FrequencyRange.mid]
    randomEffekts = [visualize_spectrum,visualize_energy,visualize_scroll,visualize_random,visualize_scrollExtreme,visualize_energyExtreme,visualize_energyRGB,visualize_flashy,visualize_multipleEnergy,visualize_rotatingEnergy]
    composer.clear()
    trf = random.choice(triangleRandomFrequencys)
    mrf = random.choice(middleRandomFrequencys)
    reT = random.choice(randomEffekts)
    reM = random.choice(randomEffekts)

    composer.addEffekt(reT(1),trf,1,0,180)
    composer.addEffekt(reM(2),mrf,0,0,100)

def checkIfDrop(): 
    rCheck = all(v == 0 for v in led.pixels[0])
    gCheck = all(v == 0 for v in led.pixels[1])
    bCheck = all(v == 0 for v in led.pixels[2])
    return (rCheck and gCheck and bCheck and (time.time() - _lastTime >= 10))

def minute_passed():
    return time.time() - _lastTime >= _randomWait

def changeEffekt():
    global _lastTime, visualization_effect,visualize_spectrum,visualize_energy,visualize_scroll, _randomWait
    elements = [visualize_spectrum,visualize_energy,visualize_scroll]
    timeToChange = minute_passed()
    dropDetected = checkIfDrop()
    #print(led.pixels[0])
    #print(led.pixels[1])
    #print(led.pixels[2])

    if(dropDetected):
        print("DROOOOOOOP!!!")
    if(timeToChange or dropDetected):
        print("Change Effekt \n")
        #print(output)
        _lastTime = time.time()
        _randomWait = 0
        if(dropDetected):
            _randomWait = random.randrange(60, config.RANDOM_MAX_WAIT, 1)
        else:
            _randomWait = random.randrange(1, config.RANDOM_MAX_WAIT, 1)
        print(_randomWait)
        copyArray = elements.copy()
        # copyArray.remove(visualization_effect)
        # visualization_effect = random.choice(copyArray)
        makeRandomComposition()



if __name__ == '__main__':
    if config.USE_GUI:
        import pyqtgraph as pg
        from pyqtgraph.Qt import QtGui, QtCore
        # Create GUI window
        app = QtGui.QApplication([])
        view = pg.GraphicsView()
        layout = pg.GraphicsLayout(border=(100,100,100))
        view.setCentralItem(layout)
        view.show()
        view.setWindowTitle('Visualization')
        view.resize(800,600)
        # Mel filterbank plot
        fft_plot = layout.addPlot(title='Filterbank Output', colspan=3)
        fft_plot.setRange(yRange=[-0.1, 1.2])
        fft_plot.disableAutoRange(axis=pg.ViewBox.YAxis)
        x_data = np.array(range(1, config.N_FFT_BINS + 1))
        mel_curve = pg.PlotCurveItem()
        mel_curve.setData(x=x_data, y=x_data*0)
        fft_plot.addItem(mel_curve)
        # Visualization plot
        layout.nextRow()
        led_plot = layout.addPlot(title='Visualization Output', colspan=3)
        led_plot.setRange(yRange=[-5, 260])
        led_plot.disableAutoRange(axis=pg.ViewBox.YAxis)
        # Pen for each of the color channel curves
        r_pen = pg.mkPen((255, 30, 30, 200), width=4)
        g_pen = pg.mkPen((30, 255, 30, 200), width=4)
        b_pen = pg.mkPen((30, 30, 255, 200), width=4)
        # Color channel curves
        r_curve = pg.PlotCurveItem(pen=r_pen)
        g_curve = pg.PlotCurveItem(pen=g_pen)
        b_curve = pg.PlotCurveItem(pen=b_pen)
        # Define x data
        x_data = np.array(range(1, config.N_PIXELS + 1))
        r_curve.setData(x=x_data, y=x_data*0)
        g_curve.setData(x=x_data, y=x_data*0)
        b_curve.setData(x=x_data, y=x_data*0)
        # Add curves to plot
        led_plot.addItem(r_curve)
        led_plot.addItem(g_curve)
        led_plot.addItem(b_curve)
        # Frequency range label
        freq_label = pg.LabelItem('')
        # Frequency slider
        def freq_slider_change(tick):
            minf = freq_slider.tickValue(0)**2.0 * (config.MIC_RATE / 2.0)
            maxf = freq_slider.tickValue(1)**2.0 * (config.MIC_RATE / 2.0)
            t = 'Frequency range: {:.0f} - {:.0f} Hz'.format(minf, maxf)
            freq_label.setText(t)
            config.MIN_FREQUENCY = minf
            config.MAX_FREQUENCY = maxf
            dsp.create_mel_bank()
        freq_slider = pg.TickSliderItem(orientation='bottom', allowAdd=False)
        freq_slider.tickMoveFinished = freq_slider_change
        freq_slider.addTick((config.MIN_FREQUENCY / (config.MIC_RATE / 2.0))**0.5)
        freq_slider.addTick((config.MAX_FREQUENCY / (config.MIC_RATE / 2.0))**0.5)
        freq_label.setText('Frequency range: {} - {} Hz'.format(
            config.MIN_FREQUENCY,
            config.MAX_FREQUENCY))
        # Effect selection
        active_color = '#16dbeb'
        inactive_color = '#FFFFFF'
        def energy_click(x):
            global visualization_effect, composer
            # visualization_effect = visualize_energy
            composer.clear()
            composer.addEffekt(visualize_energyRGB(1),FrequencyRange.low,1,0,180)
            composer.addEffekt(visualize_energyExtreme(2),FrequencyRange.midHigh,0,0,100)
            energy_label.setText('Energy', color=active_color)
            scroll_label.setText('Scroll', color=inactive_color)
            spectrum_label.setText('Spectrum', color=inactive_color)
        def scroll_click(x):
            global visualization_effect
            composer.clear()
            composer.addEffekt(visualize_scroll(1),FrequencyRange.low,1,0,180)
            composer.addEffekt(visualize_scrollExtreme(2),FrequencyRange.midHigh,0,0,100)
            # visualization_effect = visualize_scroll
            energy_label.setText('Energy', color=inactive_color)
            scroll_label.setText('Scroll', color=active_color)
            spectrum_label.setText('Spectrum', color=inactive_color)
        def spectrum_click(x):
            global visualization_effect
            composer.clear()
            composer.addEffekt(visualize_random(1),FrequencyRange.low,1,0,180)
            composer.addEffekt(visualize_flashy(2),FrequencyRange.all,0,0,100)
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
    microphone.start_stream(microphone_update)
