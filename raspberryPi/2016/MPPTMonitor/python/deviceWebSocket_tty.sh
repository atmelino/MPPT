#!/bin/bash

# for simulation on computer without serial port
# may have to change permissions for /dev/tty

#sudo chmod 777 /dev/tty

python deviceWebSocket.py -p /dev/tty -s

echo press enter

read input

