'''
Created on 2016-09-01

@author: user
'''

import random
from time import sleep
import deviceWebSocket



def deviceReader(main):
    while main.alive:
        receivedString = "2016-09-08T17:02:05 DATA: 10190 11.15  151.2 1686.1   8.18    0.0    0.0  0.00 199.00 200.00"

        main.consoleMessage('Received: %s' % receivedString.rstrip())
        evaluateString = "DATA: %s" % receivedString.rstrip()
        main.evaluateResponse(evaluateString)
        sleep(2.0)


def getSerial(main):
    str= 'SERIAL bla'
    main.evaluateResponse(str)
    sleep(1.0)
    sendEnd(main)    


def processCommands(main,command):
    #delay=.01
    delay=.8
    #print 'processCommands'
    print "simulator"
    print command


    if command=='GETLINE':
                volt = random.randint(1, 20)
                str="LINE 2016-09-01   %d 360mW" % volt
                main.evaluateResponse(str)
                sleep(delay)
    sendEnd(main)    




def sendEnd(main):
        print 'simulator: End of data'
        str="END_DATA"
        main.evaluateResponse(str)





