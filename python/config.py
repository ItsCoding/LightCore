"""Settings for audio reactive LED strip"""
from __future__ import print_function
from __future__ import division
from operator import invert
import os


# DEVICE = 'esp8266'
DEVICE = "espv" # editable in designer
"""Device used to control LED strip. Must be 'esp', 'espv' or 'virtual'

'esp8266' means that you are using an ESP8266 module to control the LED strip
and commands will be sent to the ESP8266 over WiFi.

'pi' means that you are using a Raspberry Pi as a standalone unit to process
audio input and control the LED strip directly.

'blinkstick' means that a BlinkstickPro is connected to this PC which will be used
to control the leds connected to it.1
"""
DEBUG_LOG = True
if DEVICE == "esp" or DEVICE == "espv":
    UDP_IPS = { # editable in designer
       
        0: "127.0.0.1", 
        1: "127.0.0.1",
        2: "127.0.0.1",
        3: "127.0.0.1",
        #--------------------
        # 10=side   

        # 0: "10.40.0.17", #11
        # 1: "GROUP",
        # 2: "10.40.0.10",
        # 3: "10.40.0.14",
        # 4:"10.40.0.17",
        # 5:"10.40.0.17",
        # 6:"10.40.0.17",
        # 7:"10.40.0.17",
        # 8:"10.40.0.17",
        # 9:"10.40.0.17",
    }  #'192.168.62.3' #'10.40.0.186'
    UDP_GROUPS = { # editable in designer
        1: [
            {"from": 0, "to": 270, "IP": "10.40.0.12"},
            {"from": 270, "to": 540, "IP": "10.40.0.13","offset": 270,"invert": True},
        ],
        # 5:[{"from": 0, "to": 113, "IP": "10.40.0.17"}],
        # 6:[{"from": 113, "to": 113 * 2, "IP": "10.40.0.17"}],
        # 7:[{"from": 113 * 2, "to": 113 * 3, "IP": "10.40.0.17"}],
        # 8:[{"from": 113 * 3, "to": 113 * 4, "IP": "10.40.0.17"}],
        # 9:[{"from": 113 * 4, "to": 113 * 5, "IP": "10.40.0.17"}],
        # 10:[{"from": 113 * 5, "to": 113 * 5 + 35, "IP": "10.40.0.17"}]
    }
    UDP_FRAMEDIVIDER = { # editable in designer
        0: 5,
        1: 3,
    }

    UDP_INDEX_OFFSET = { # editable in designer
        5: 113,
        6: 113*2,
        7: 113*3,
        8: 113*4,
        9: 113*5
    }
    """IP address of the ESP8266. Must match IP in ws2812_controller.ino"""
    UDP_PORT = 7777
    """Port number used for socket communication between Python and ESP8266"""
    SOFTWARE_GAMMA_CORRECTION = True
    """Set to False because the firmware handles gamma correction + dither"""
    ESP_ACK_PORT = 58880 # this should stay the same, otherwise you need to change the esp firmware
    ESP_ACK_TIMEOUT = 0.1
    ESP_MAX_FRAMES_SKIPPED = 3 #maximal number of packets that can be skipped before the connection is considered disturbed

if DEVICE == "virtual" or DEVICE == "espv":
    SOFTWARE_GAMMA_CORRECTION = True

BRIGHTNESS = 100
USE_GUI = False
"""Whether or not to display a PyQtGraph GUI plot of visualization"""

# Wheter to record 5 sec samples of the audio input. It will be saved to file.wav
RECORD_SAMPLES = False

DISPLAY_FPS = True
DISPLAY_BPM = False
"""Whether to display the FPS when running (can reduce performance)"""

# ToDo: This need to be replaced
"""Number of pixels in the LED strip (must match ESP8266 firmware)"""

GAMMA_TABLE_PATH = os.path.join(os.path.dirname(__file__), "gamma_table.npy")
"""Location of the gamma correction table"""

MIC_RATE = 44100
"""Sampling frequency of the microphone in Hz"""

FPS = 60 # editable in designer
LIMIT_FPS = True
FRAMES_PER_BUFFER = int(MIC_RATE / FPS)
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


STRIP_COUNT = 4 # editable in designer
# STRIP_LED_COUNTS = [300, 540, 50, 50]
STRIP_LED_COUNTS = [1000, 540, 50, 50] # editable in designer 
STRIP_MIRRORS = [[2, 3]]  # editable in designer

RANDOM_MAX_WAIT = 8 # editable in client , deprecated
RANDOM_MIN_WAIT = 4 # editable in client , deprecated

DROP_RANDOM_MAX_WAIT = 10 # editable in client , deprecated
DROP_RANDOM_MIN_WAIT = 5 # editable in client, deprecated

GLOBAL_SPEED = 50 # editable in client
GLOBAL_INTENSITY = 1.0 # editable in client
DETECT_BEAT = True # editable in client
STRIP_BRIGHTNESS = {} # editable in client
for i in range(STRIP_COUNT):
    STRIP_BRIGHTNESS[i] = 100

BLACKLISTED_EFFECTS = {"all": []}  # editable in client
for i in range(STRIP_COUNT):
    BLACKLISTED_EFFECTS[str(i)] = []


COLOR_DICT = [ # editable in client
    [0, 0, 255],
    [0, 255, 0],
    [255, 0, 0],
    [0, 255, 255],
    [255, 0, 255],
    [255, 255, 0],
    [255, 255, 255],
    [34, 166, 179],
    [190, 46, 221],
]
COLOR_CALIBRATION = { # editable in client
    "ws2813": [1.0,1.0,1.0],
    "ws2811": [1.0,1.0,1.0],
}

COLOR_CALIBRATION_ASSIGNMENTS = { # editable in designer
    0: "ws2813",
    1: "ws2813",
    2: "ws2811",
    3: "ws2811",
    4: "ws2811",
    5: "ws2811",
    6: "ws2811",
    7: "ws2811",
    8: "ws2811",
    9: "ws2811",
}

# How many beats are one bar
MUSIC_BEATS_BAR = 4 # editable in client
# How many bars to wait before changin randomizer
RANDOMIZER_BAR = 4 # editable in client

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
    "colorDict": COLOR_DICT,
    "colorCalibration": COLOR_CALIBRATION,
    "colorCalibrationAssignments": COLOR_CALIBRATION_ASSIGNMENTS,
    "musicBeatsBar": MUSIC_BEATS_BAR,
    "randomizerBar": RANDOMIZER_BAR,
}
