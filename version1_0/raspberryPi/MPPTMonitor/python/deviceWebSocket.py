#!/usr/bin/env python

import os, serial, threading
import json
import socket
from time import sleep
import datetime
import termios, sys
import atexit
import optparse
import random
import simulator
import RTC_DS1307 as RTC

global mysocketMessage
global mysocketMessageJSON
global myEvent


class socketMessage:
    def __init__(self):
        self.counter = 0
        self.text = 'idle'
        self.Line = ''
        self.status = 'idle'


class deviceWebSocket:
    def __init__(self, port, baudrate, parity, echo, simulation):
        global myEvent
        global mysocketMessage
        self.clientMessage = ''
        self.receivedString = ''

        # background or interactive mode?
        if os.isatty(sys.stdin.fileno()):
            # command line mode.
            print "started from command line"
            self.termTrueFalse = True
            self.RTCinstalled = 0
            pass
        else:
            # Cron mode.
            print "started from cron"
            self.termTrueFalse = False
            self.RTCinstalled = 1
            pass

        if self.RTCinstalled == 1:
            self.myrtc = RTC.RTC_DS1307()
        
        if self.RTCinstalled == 1:
             nowdatetime = self.myrtc.read_str()
        else:
             nowdatetime = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print nowdatetime
        

        myEvent = threading.Event()
        mysocketMessage = socketMessage()

        if self.termTrueFalse == True:
            # Save the terminal settings
            self.fd = sys.stdin.fileno()
            self.new_term = termios.tcgetattr(self.fd)
            self.old_term = termios.tcgetattr(self.fd)

            # New terminal setting unbuffered
            # self.new_term[3] = (self.new_term[3] & ~termios.ICANON & ~termios.ECHO)
            self.new_term[3] = (self.new_term[3] & ~termios.ICANON)
            termios.tcsetattr(self.fd, termios.TCSAFLUSH, self.new_term)

            # Support normal-terminal reset at exit
            atexit.register(self.set_normal_term)
        
        try:
            self.serial = serial.serial_for_url(port, baudrate, parity=parity, timeout=1)
        except AttributeError:
            # happens when the installed pyserial is older than 2.5. use the
            # Serial class directly then.
            self.serial = serial.Serial(port, baudrate, parity=parity, timeout=1)
            
        self.echo = echo
        self.counter = 0
        self.simulation = simulation
        self.previousdatetime="2016-09-11 00:37:41"

        print '--- deviceWebSocket on %s: %d,%s,%s,%s ---' % (
            self.serial.port,
            self.serial.baudrate,
            self.serial.bytesize,
            self.serial.parity,
            self.serial.stopbits,
        )
        self.consoleMessage('x:Exit ')
        

    def getch(self):
        # Returns a keyboard character after kbhit() has been called.
        # Should not be called in the same program as getarrow().
        s = ''
        return sys.stdin.read(1)

    def kbhit(self):
        # Returns True if keyboard character was hit, False otherwise.
        dr, dw, de = select([sys.stdin], [], [], 0)
        return dr != []
       
    def consoleMessage(self, message):
        if self.termTrueFalse == True:
            print message + chr(0x0D)
            # print '\n'
           
    def set_normal_term(self):
        print "set_normal_term()"
        termios.tcsetattr(self.fd, termios.TCSAFLUSH, self.old_term)

    def start(self):
        self.alive = True

        if self.simulation == True:
            self.simulate_thread = threading.Thread(target=self.simulate)
            self.simulate_thread.setDaemon(1)
            self.simulate_thread.start()              
        else:
            self.deviceReader_thread = threading.Thread(target=self.deviceReader)
            self.deviceReader_thread.setDaemon(1)
            self.deviceReader_thread.start()
        
        if self.termTrueFalse == True:
            self.consoleReader_thread = threading.Thread(target=self.consoleReader)
            self.consoleReader_thread.setDaemon(1)
            self.consoleReader_thread.start()              

        self.deviceWriter_thread = threading.Thread(target=self.deviceWriter)
        self.deviceWriter_thread.setDaemon(1)
        self.deviceWriter_thread.start()        

        self.socketServer_thread = threading.Thread(target=self.socketServer)
        self.socketServer_thread.setDaemon(1)
        self.socketServer_thread.start()        

        self.Timer_thread = threading.Thread(target=self.myTimer)
        self.Timer_thread.setDaemon(1)
        self.Timer_thread.start()
        
        if self.termTrueFalse == True:
            self.consoleReader_thread.join()
        if self.simulation == False:
            self.deviceReader_thread.join()
        # self.socketServer.join()
        # self.socketServer_thread.join()

    def stop(self):           
        self.alive = False
        self.serial.close()
        sys.exit(1)


    def simulate(self):
        while True:
            sleep(4.0)
            # self.consoleMessage("simulate")
            volt1 = random.uniform(7.9, 8.2)
            receivedString = "10190 11.15  151.2 1686.1   %f    0.0    0.0  0.00 199.00 200.00" % volt1
            self.consoleMessage('Received: %s' % receivedString.rstrip())
            evaluateString = "DATA: %s" % receivedString.rstrip()
            self.evaluateResponse(evaluateString)
            
            
    def myTimer(self):
        # keep socket connection alive
        global mysocketMessage
        global mysocketMessageJSON
        global myEvent
        

        while True:
            sleep(5)
            self.consoleMessage('keep socket connection alive timer event')
            mysocketMessage.counter = mysocketMessage.counter + 1
            mysocketMessage.text = 'idle'
            mysocketMessage.Line = ''
            mysocketMessage.status = 'idle'                   
            self.sendSocketMessage()

    def socketServer(self):
        global myEvent
        global mysocketMessage
        global mysocketMessageJSON

        s = socket.socket()  # Create a socket object
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        host = socket.gethostname()  # Get local machine name
        print 'Host name = %s' % host
        port = 12344  # Reserve a port for your service.
        # s.bind((host, port))        # Bind to the port
        # s.bind(('127.0.0.1', port))
        s.bind(('localhost', port))
        s.listen(5)  # Now wait for client connection.
        self.counter = 0

        while True:
           socketConn, addr = s.accept()  # Establish connection with client.
           # self.dump(addr)
           self.consoleMessage('Got connection from %s' % str(addr))
           # print 'Got connection from', addr
           recv = socketConn.recv(4096)
           self.clientMessage = recv
           if len(self.clientMessage) > 1:
               print "client message %s" % self.clientMessage
           if 'waits' in self.clientMessage:
                print 'client waits'
        
           # hold loop until new message ready to send
           myEvent.wait()
           
           socketConn.send(mysocketMessageJSON) 
           socketConn.close()  # Close the connection
           # sleep(2)

    def dump(self, obj):
        for attr in dir(obj):
            print "obj.%s = %s" % (attr, getattr(obj, attr))

    def sendSocketMessage(self):
        global mysocketMessage
        global mysocketMessageJSON
        global myEvent
        
        mysocketMessage.counter = mysocketMessage.counter + 1
        
        Line = mysocketMessage.Line
        counter = mysocketMessage.counter
        status = mysocketMessage.status
        
        mysocketMessageJSON = json.dumps({'status': status, 'counter':counter, 'Line':Line}, indent=0)
        
        myEvent.set()
        myEvent.clear()

    def deviceWriter(self):

        while True:
            self.counter += 1
            self.consoleMessage('deviceWriter thread alive %d\n' % self.counter)
            
            # the name of the pipe
            pipeNameIn = '/dev/shm/deviceWebSocketPipe'
            
            # we will get an error if the pipe exists
            # when creating a new one, so try removing it first
            try:
                    os.unlink(pipeNameIn)
            except:
                    pass
            
            # create the pipe and open it for reading
            os.mkfifo(pipeNameIn)
            os.chmod(pipeNameIn, 0777)
            pipe = open(pipeNameIn, 'r')
            
            # read forever and print anything written to the pipe
            data = pipe.readline()
            if data != '':

                print 'Received from pipe:'
                print data
                
                self.decoded = json.loads(data)
              
                if 'commands' in self.decoded:
                    mycommand = self.decoded['commands']
                    if 'param' in self.decoded:
                        param = self.decoded['param']
                    self.COMMAND(mycommand, param)
                   
            sleep(0.5)

    def COMMAND(self, command, param):
        
        #print 'Command:'
        #print command

        if 'PWM' in command:   
            #print 'PWM found %d' % param
            newPWM = int(param)
            
            arduinoMessageJSON = '{"PWM":%d}' % newPWM 
            
            self.serial.write(arduinoMessageJSON)
            # Wait for output buffer to drain.
            self.serial.flush()

        if self.simulation == True:            
            simulator.processCommands(self, command)
            

    def deviceReader(self):
        try:
            while self.alive:
                data = self.serial.read(1)

                if data is not '':
                    self.receivedString += data

                if data == '\x0A':
                    self.consoleMessage('Received: %s' % self.receivedString.rstrip())
                    evaluateString = "DATA: %s" % self.receivedString.rstrip()
                    self.evaluateResponse(evaluateString)
                    self.receivedString = ''
                                                
                sys.stdout.flush()

        except serial.SerialException, e:
            self.alive = False
            # would be nice if the console reader could be interruptted at this
            # point...
            raise

    def evaluateResponse(self, message):
        global mysocketMessage

        # print message

        if 'LINE' in message:   
            print 'LINE found'
            if self.RTCinstalled == 1:
                nowdatetime = self.myrtc.read_str()
                RTCTime = self.myrtc.read_str()
                RTCTimeShort = '%s%s' % (RTCTime[0:8], RTCTime[9:17])
                curdate = '20%s' % (RTCTime[0:8])
                curdatetime = '20' + RTCTime
            else:
                curdatetime = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            output = "%s %s" % (curdatetime, message.rstrip())
            mysocketMessage.status = 'measure'
            mysocketMessage.Line = output
            self.sendSocketMessage()


        if 'DATA' in message:
            # print 'DATA found'
            if self.RTCinstalled == 1:
                nowdatetime = self.myrtc.read_str()
                RTCTime = self.myrtc.read_str()
                RTCTimeShort = '%s%s' % (RTCTime[0:8], RTCTime[9:17])
                curdate = '20%s' % (RTCTime[0:8])
                curdatetime = '20' + RTCTime
            else:
                curdatetime = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                curdate = curdatetime[0:10]
            output = "%s %s" % (curdatetime, message.rstrip())
            mysocketMessage.status = 'measure'
            mysocketMessage.Line = output
            # print mysocketMessage.Line
            self.sendSocketMessage()
            
            #print curdatetime[5:7]
            #print curdatetime[8:10]

            yearc=int(curdatetime[0:4])
            monc=int(curdatetime[5:7])
            dayc=int(curdatetime[8:10])
            hourc=int(curdatetime[11:13])
            minc=int(curdatetime[14:16])
            secc=int(curdatetime[17:19])
            yearp=int(self.previousdatetime[0:4])
            monp=int(self.previousdatetime[5:7])
            dayp=int(self.previousdatetime[8:10])
            hourp=int(self.previousdatetime[11:13])
            minp=int(self.previousdatetime[14:16])
            secp=int(self.previousdatetime[17:19])
            
            a = datetime.datetime(yearc,monc,dayc,hourc,minc,secc)
            b = datetime.datetime(yearp,monp,dayp,hourp,minp,secp)
            diff=(a-b).total_seconds()
            #print a.strftime('%Y-%m-%d %H:%M:%S')
            #print diff

            if(diff>30):
                self.previousdatetime=curdatetime
                fileName = ("../writeFiles/ardData%s.txt" % curdate)
                fh = open(fileName, "a")
                fh.write(output+ "\n")
                fh.close


        if 'END_DATA' in message:   
            # print 'END_DATA found'
            mysocketMessage.status = 'complete'
            self.sendSocketMessage()

        pass


    def consoleReader(self):
        # loop until EXITCHARACTER character 
        try:
            while self.alive:
                try:
                    # c = self.getkey()
                    c = self.getch()
                except KeyboardInterrupt:
                    c = '\x03'

                if c == 'x':
                    print 'Exit'
                    if self.termTrueFalse == True:
                        self.set_normal_term()

                    self.stop()
                    break  # exit app
  
                # if c == 'i':
                    # mySocketMessage.status = 'idle'
                    # self.sendSocketMessage()
        except:
            self.alive = False
            raise  


def main():
    global deviceWebSocket

    parser = optparse.OptionParser(
        usage="%prog [options] [port [baudrate]]",
        description="deviceWebSocket"
    )

    parser.add_option("-p", "--port",
        dest="port",
        help="port, a number (default 0) or a device name (deprecated option)",
        default='/dev/ttyS0'
    )

    parser.add_option("-b", "--baud",
        dest="baudrate",
        action="store",
        type='int',
        help="set baud rate, default %default",
        default=9600
    )

    parser.add_option("--parity",
        dest="parity",
        action="store",
        help="set parity, one of [N, E, O, S, M], default=N",
        default='N'
    )

    parser.add_option("-s", "--sim",
        dest="simulation",
        action="store_true",
        help="simulation (default off)",
        default=False
    )

    parser.add_option("-e", "--echo",
        dest="echo",
        action="store_true",
        help="enable local echo (default off)",
        default=False
    )

    (options, args) = parser.parse_args()

    options.parity = options.parity.upper()
    if options.parity not in 'NEOSM':
        parser.error("invalid parity")

    port = options.port
    baudrate = options.baudrate
    if args:
        if options.port is not None:
            parser.error("no arguments are allowed, options only when --port is given")
        port = args.pop(0)
        if args:
            try:
                baudrate = int(args[0])
            except ValueError:
                parser.error("baud rate must be a number, not %r" % args[0])
            args.pop(0)
        if args:
            parser.error("too many arguments")
    else:
        if port is None: port = 0

    try:
        deviceWebSocket = deviceWebSocket(
            port,
            baudrate,
            options.parity,
            echo=options.echo,
            simulation=options.simulation
        )
    except serial.SerialException, e:
        sys.stderr.write("could not open port %r: %s\n" % (port, e))
        sys.exit(1)


    deviceWebSocket.start()

if __name__ == '__main__':
    main()
