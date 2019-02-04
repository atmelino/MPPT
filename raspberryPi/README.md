# raspberryPi

New Version 2019

<h2>Setup</h2>

<h4>Raspberry Pi Installation</h4>
On Ubuntu:<br>
download Raspbian Stretch<br>
install Raspbian on micro SD card using startup disk creator

<h4>Raspberry Pi Configuration</h4>
sudo raspi-config<br>
enable I2C<br>
enable serial port<br>
disable serial port shell<br>
enable built-in VNC Server (RealVNC)

<h4>VNC Server</h4>
in options, make sure authentication is set to VNC<br>
https://raspberrypi.stackexchange.com/questions/68838/i-failed-to-remote-connect-to-raspberry-pi-3-from-ubuntu<br>
On Ubuntu client side, using vinagre<br>
headless VNC server<br>
https://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/

<h4>File Sharing</h4>
<code>mkdir /home/user/sshfs_pi/<br></code><br>
<code>sudo sshfs -o allow_other pi@192.168.0.100:/ /home/user/sshfs_pi/</code>

<h4>Testing communication with Arduino</h4>
<code>minicom -b 9600 -o -D /dev/ttyAMA0</code>

Set fixed IP

<h4>Install Node.js</h4>
Zero requires different installation than biger RPi because it uses ARM 6 architecture<br>
https://eddielee.me/running-node-js-on-a-raspberry-pi-zero/<br>
Steps:<br>
<code>wget https://nodejs.org/dist/latest/node-v11.6.0-linux-armv6l.tar.gz</code><br>
<code>tar -xzf node-v11.6.0-linux-armv6l.tar.gz</code><br>
<code>sudo cp -R node-v11.6.0-linux-armv6l/* /usr/local/</code><br>
<code>nano ~/.profile</code><br>
Add<br>
PATH=$PATH:/usr/local/bin<br>
at the end then press ctrl + x to exit. Type yes to save.<br>


simple web server:<br>
<code>sudo npm install http-server -g</code><br>
http-server<br>
https://www.npmjs.com/package/http-server<br>

serial to web socket:<br>
<code>npm install express</code><br>
<code>npm install ws</code><br>
<code>npm install serialport</code><br>
<code>npm install ip</code><br>

(-g, module not found?)

<h4>Autostart node server on Pi startup</h4>
add the MPPT software as a service using systemd.<br>
add file MPPT.service to /etc/systemd/system.<br>
Start and stop:<br>
<code>sudo systemctl start MPPT.service</code><br>
<code>sudo systemctl stop MPPT.service</code><br>
check status:<br>
<code>sudo systemctl status MPPT.service</code><br>
during development</code><br>
<code>sudo systemctl daemon-reload</code><br>
<code>sudo systemctl restart MPPT.service</code><br>
To start automatically at boot:<br>
<code>sudo systemctl enable MPPT.service</code><br>
To list all services:<br>
<code>sudo systemctl list-unit-files</code><br>
or<br>
<code>sudo systemctl list-unit-files | grep MPPT.service </code><br>
To see output from service:<br>
<code>journalctl -u MPPT.service -b</code><br>
To shorten journal file:<br>
<code>sudo journalctl --rotate</code><br>
<code>sudo journalctl --vacuum-time=1s</code><br>

<h2>2016 Version</h2>

project-specific documentation readme:

MPPTMonitor Wiki
<a href="https://github.com/atmelino/raspberryPi/wiki">https://github.com/atmelino/raspberryPi/wiki</a>


old<br>
https://www.instructables.com/id/Nodejs-App-As-a-RPI-Service-boot-at-Startup/<br>
requires<br>
<code>sudo npm install forever -g</code><br>
to be able to run this as non-root user:<br>
https://raspberrypi.stackexchange.com/questions/40105/access-gpio-pins-without-root-no-access-to-dev-mem-try-running-as-root<br>
Three methods:<br>
SysVinit<br>
Systemd<br>
Upstart<br>
https://unix.stackexchange.com/questions/106656/how-do-services-in-debian-work-and-how-can-i-manage-them<br>
Preferred:<br>
Systemd<br>
Examples:<br>
https://www.raspberrypi.org/documentation/linux/usage/systemd.md<br>
https://learn.adafruit.com/running-programs-automatically-on-your-tiny-computer/systemd-writing-and-enabling-a-service<br>
https://nodesource.com/blog/running-your-node-js-app-with-systemd-part-1/<br>


<h4>Support</h4>
Q: PC simulation getting serialport version error<br>
A: Try completely removing node and reinstalling.<br>
sudo apt remove nodejs
delete .npm folder in home
delete .nvm folder in home
delete package json lock file
delete package.json file
sudo apt install nodejs
try running 
sudo node server.js
install node modules as requested
npm install express
etc



