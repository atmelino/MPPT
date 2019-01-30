#!/bin/bash

# for simulation on computer without serial port
# may have to change permissions for /dev/ttyAMA0

#sudo chmod 777 /dev/ttyAMA0

python deviceWebSocket.py -p /dev/ttyAMA0

echo press enter

read input

