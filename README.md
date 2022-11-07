# LightCore
Real-time LED strip music visualization using Python and the ESP8266 or Raspberry Pi.
## Special thanks to ❤
- Scott Lawson for the base [project](https://github.com/scottlawsonbc/audio-reactive-led-strip)
- shunfu for the beat detection [project](https://github.com/shunfu/python-beat-detector)

## Python Dependencies
Visualization code is compatible with Python 3.9. A few Python dependencies must also be installed:
- Numpy
- Scipy (for digital signal processing)
- PyQtGraph (for GUI visualization)
- PyAudio (for recording audio with microphone)
# Installing dependencies
The pip package manager can also be used to install the python dependencies.
```
pip install numpy
pip install scipy
pip install pyqtgraph
pip install pyaudio
pip install matplotlib
pip install zmq
pip install websocket-client

```
If `pip` is not found try using `python -m pip install` instead.

### Installing macOS dependencies
On macOS, python3 is required and `portaudio` must be used in place of `pyaudio`.
If you don't have brew installed you can get it here: https://brew.sh

```
export LDFLAGS=-L/opt/homebrew/lib
export CPPFLAGS=-I/opt/homebrew/include
brew install portaudio
brew install pyqt5
pip3 install numpy
pip3 install scipy
pip3 install pyqtgraph
pip3 install pyaudio
pip3 install matplotlib
pip3 install zmq
pip3 install websocket-client

```

Running the visualization can be done using the command below.

`python3 pipeline.py`

## Installing the Python dependencies
Install python dependencies using apt-get
```
sudo apt-get update
sudo apt-get install python-numpy python-scipy python-pyaudio
```

## Audio device configuration
For the Raspberry Pi, a USB audio device needs to be configured as the default audio device.

Create/edit `/etc/asound.conf`
```
sudo nano /etc/asound.conf
```
Set the file to the following text
```
pcm.!default {
    type hw
    card 1
}
ctl.!default {
    type hw
    card 1
}
```

Next, set the USB device to as the default device by editing `/usr/share/alsa/alsa.conf`
```
sudo nano /usr/share/alsa/alsa.conf
```
Change
```
defaults.ctl.card 0
defaults.pcm.card 0
```
To
```
defaults.ctl.card 1
defaults.pcm.card 1
```

## Running this project

#### Install MessageBroker 
```
cd messageBroker 
yarn 
```

#### Install Virtualization, this is only needed if you set your DEVICE to "virtual" or "espv"
```
cd light-designer
yarn 
```

#### Install the WebClient
```
cd light-client
yarn 
```

### Run everything
```
cd controller
yarn start
```
