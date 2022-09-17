"""Settings for audio reactive LED strip"""
from __future__ import print_function
from __future__ import division
import os



#DEVICE = 'esp8266'
DEVICE = 'espv'
"""Device used to control LED strip. Must be 'esp' or 'virtual'

'esp8266' means that you are using an ESP8266 module to control the LED strip
and commands will be sent to the ESP8266 over WiFi.

'pi' means that you are using a Raspberry Pi as a standalone unit to process
audio input and control the LED strip directly.

'blinkstick' means that a BlinkstickPro is connected to this PC which will be used
to control the leds connected to it.
"""

if DEVICE == 'esp' or DEVICE == 'espv':
    UDP_IP = '192.168.62.3' #'10.40.0.186'
    """IP address of the ESP8266. Must match IP in ws2812_controller.ino"""
    UDP_PORT = 7777
    """Port number used for socket communication between Python and ESP8266"""
    SOFTWARE_GAMMA_CORRECTION = True
    """Set to False because the firmware handles gamma correction + dither"""

if DEVICE == "virtual" or DEVICE == "espv":
    SOFTWARE_GAMMA_CORRECTION = True

BRIGHTNESS = 100
USE_GUI = False
"""Whether or not to display a PyQtGraph GUI plot of visualization"""

DISPLAY_FPS = True
DISPLAY_BPM = False
"""Whether to display the FPS when running (can reduce performance)"""

#ToDo: This need to be replaced
N_PIXELS = 300
"""Number of pixels in the LED strip (must match ESP8266 firmware)"""

GAMMA_TABLE_PATH = os.path.join(os.path.dirname(__file__), 'gamma_table.npy')
"""Location of the gamma correction table"""

MIC_RATE = 44100
"""Sampling frequency of the microphone in Hz"""

FPS = 90
"""Desired refresh rate of the visualization (frames per second)

FPS indicates the desired refresh rate, or frames-per-second, of the audio
visualization. The actual refresh rate may be lower if the computer cannot keep
up with desired FPS value.

Higher framerates improve "responsiveness" and reduce the latency of the
visualization but are more computationally expensive.

Low framerates are less computationally expensive, but the visualization may
appear "sluggish" or out of sync with the audio being played if it is too low.

The FPS should not exceed the maximum refresh rate of the LED strip, which
depends on how long the LED strip is.
"""

MIN_FREQUENCY = 0
"""Frequencies below this value will be removed during audio processing"""

MAX_FREQUENCY = 14000
"""Frequencies above this value will be removed during audio processing"""

N_FFT_BINS = 64
"""Number of frequency bins to use when transforming audio to frequency domain

Fast Fourier transforms are used to transform time-domain audio data to the
frequency domain. The frequencies present in the audio signal are assigned
to their respective frequency bins. This value indicates the number of
frequency bins to use.

A small number of bins reduces the frequency resolution of the visualization
but improves amplitude resolution. The opposite is true when using a large
number of bins. More bins is not always better!

There is no point using more bins than there are pixels on the LED strip.
"""

N_ROLLING_HISTORY = 2
"""Number of past audio frames to include in the rolling window"""

MIN_VOLUME_THRESHOLD = 1e-7
"""No music visualization displayed if recorded audio volume below threshold"""


STRIP_COUNT = 4
STRIP_LED_COUNTS = [300,540,50,50]
STRIP_MIRRORS = [[2,3]]

RANDOM_MAX_WAIT = 8
RANDOM_MIN_WAIT = 4

DROP_RANDOM_MAX_WAIT = 10
DROP_RANDOM_MIN_WAIT = 5

GLOBAL_SPEED = 50
GLOBAL_INTENSITY = 1.0
DETECT_BEAT = True
STRIP_BRIGHTNESS = []
for i in range(STRIP_COUNT):
    STRIP_BRIGHTNESS.append(100)

BLACKLISTED_EFFECTS = {
    "all":[]
}
for i in range(STRIP_COUNT):
    BLACKLISTED_EFFECTS[str(i)] = []


COLOR_DICT = [
    [0,0,255],
    [0,255,0],
    [255,0,0],
    [0,255,255],
    [255,0,255],
    [255,255,0],
    [255,255,255],
    [34,166,179],
    [190,46,221]
]

cfg = {
    "device": DEVICE,
    "brightness": BRIGHTNESS,
    "minFrequency": MIN_FREQUENCY,
    "maxFrequency": MAX_FREQUENCY,
    "frequencyBins": N_FFT_BINS,
    "randomMaxWait": RANDOM_MAX_WAIT,
    "randomMinWait": RANDOM_MIN_WAIT,
    "dropRandomMaxWait": DROP_RANDOM_MAX_WAIT,
    "dropRandomMinWait": DROP_RANDOM_MIN_WAIT,
    "globalSpeed": GLOBAL_SPEED,
    "globalIntensity": GLOBAL_INTENSITY,
    "beatDetection": DETECT_BEAT,
    "stripBrightness": STRIP_BRIGHTNESS,
    "blacklistedEffects": BLACKLISTED_EFFECTS,
}