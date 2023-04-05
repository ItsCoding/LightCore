# Midi Adapter

To easly integrate existing software/hardware with LightCore you can use the Midi Adapter. Its a simple script that connects to the MessageBroker.

To run just type `npx ts-node src/index.ts {HOSTNAME/IP of MessageBroker}`

### Windows fuckups

If you are using Windows you might have to install the following programm:

- [loopMidi](https://www.tobias-erichsen.de/software/loopmidi.html)

Sinde easymidi is not working on windows, we need a different software to create our virtual device.
In there create a virtual midi device and name it `LC-Midi`.

### Commands

The Midi Adapter supports the following commands:

- [CH0] Beat detected: note on/note off (flips for every beat)
- [CLOCK] Beat as clock signal
- [START] Randomizer changed composition
