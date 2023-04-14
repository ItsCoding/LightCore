#!/usr/bin/env bash

echo "Installing NodeJS dependencies..."
echo "🪢 Light-Client deps..."
cd light-client
npm ci --force
cd -
echo "🪢 Light-Designer deps..."
cd light-designer
npm ci --force
cd -
echo "🪢 Message Broker deps..."
cd messageBroker
npm ci
cd -
echo "🪢 ArtNet deps..."
cd connectoren/artnetToLightCore
npm ci
cd -

if [ "$(uname)" == "Darwin" ]; then
    export LDFLAGS=-L/opt/homebrew/lib
    export CPPFLAGS=-I/opt/homebrew/include
    brew install portaudio
fi
echo "Installing Python dependencies..."
pip3 install numpy pyaudio matplotlib zmq websocket-client scipy
echo "✅ Finsihed installing dependencies"