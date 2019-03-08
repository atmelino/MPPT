Welcome to the raspberryPi wiki!

<h2>Install lighttp web server</h2>

<a href="http://www.penguintutor.com/linux/light-webserver">http://www.penguintutor.com/linux/light-webserver</a>

<code>sudo apt-get install lighttpd</code>

Edit configuration (for example, location of web server root)

<code>sudo nano /etc/lighttpd/lighttpd.conf</code>

Restart after configuration change:

<code>sudo service lighttpd reload</code>

<h2>Install PHP</h2>
<code>sudo apt-get install php5-common php5-cgi php5</code><br>
<code>sudo lighty-enable-mod fastcgi-php</code><br>
<code>sudo service lighttpd force-reload</code><br>

<h2>Install Python Packages</h2>

sudo apt-get install python-serial

sudo apt-get install python-tornado


<h2>Access to Serial Port</h2>

On Pi: To be able to use the serial port as regular user "pi", add pi to dialout group

<code>usermod -aG dialout pi</code>

and reboot.

to check which groups you are member of:

<code>groups ${USER}</code>


On computer that is used for development:

To be able to use the simulator as regular user, add yourself to the tty group

<code>usermod -aG tty yourusername</code>

and reboot or logout and back in.

To find eligible tty ports:

<code>ls -la /dev/tty*</code>

crw--w---- 1 root tty     4,  0 Sep  1 17:56 /dev/tty0
crw-rw---- 1 root tty     4,  1 Sep  1 19:16 /dev/tty1

Note that tty0 cannot be read, but tty1 does.


<h2>autostart python script:</h2>

<code>sudo crontab -e</code>

add line

@reboot /home/pi/public_html/raspberryPi/projects/MPPTMonitor/script/autoStart_MPPT.sh >> $HOME/testpylog.txt 2>&1

check for running python script:

<code>ps -ef | grep python</code>


<h2>Folder Configurations</h2>
The project requires the web page to be able to write to a folder.
give www-data user write access
<br>
<a href="http://askubuntu.com/questions/244406/how-do-i-give-www-data-user-to-a-folder-in-my-home-folder">http://askubuntu.com/questions/244406/how-do-i-give-www-data-user-to-a-folder-in-my-home-folder</a>
<br>
<br> on the Raspberry Pi, your user name is "pi":
<br> <code>sudo usermod -a -G www-data (your username)</code>
<br>
change into the MPPTMonitor directory.
<br>
<br> <code>chgrp www-data writeFiles</code>
<br> <code>chmod g+rwxs writeFiles</code>
<br>
<a href="http://stackoverflow.com/questions/29331872/ioerror-errno-13-permission-denied">http://stackoverflow.com/questions/29331872/ioerror-errno-13-permission-denied</a>
<br> chmod 777 /var/www/path/to/file (may have to delete file if it already exists and belongs to a different
user)
<br>
<br>


<h2>Static IP Address</h2>
Since the Raspberry Pi does not have a monitor, it can be inconvenient of the Pi has changing IP adresses, especially if you have multiple Pi's. 
To set a static IP:<br>
<code>sudo nano /etc/network/interfaces</code><br>

Change<br>
<code>allow-hotplug wlan0</code><br>
<code>iface wlan0 inet manual</code><br>
<code>    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf</code><br>
    
to<br>
<code>allow-hotplug wlan0</code><br>
<code>iface wlan0 inet static</code><br>
<code>        address 192.168.0.100</code><br>
<code>        netmask 255.255.255.0</code><br>
<code>        gateway 192.168.0.1</code><br>
<code>    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf</code><br>



allow-hotplug wlan0
iface wlan0 inet static
    #address 192.168.0.101
    #netmask 255.255.255.0
    #gateway 192.168.0.1
    address 192.168.0.101
    network 192.168.0.0
    netmask 255.255.255.0
    broadcast 192.168.0.255
    gateway 192.168.0.1
    dns-nameservers 8.8.8.8
    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf





(if that is the desired IP and gateway)<br>
to get Internet, adds the name server of google     
    
    
then<br>
<code>sudo systemctl disable dhcpcd</code><br>
<code>sudo systemctl enable networking</code><br>
<code>sudo reboot</code><br>


<a href="http://raspberrypi.stackexchange.com/questions/37920/how-do-i-set-up-networking-wifi-static-ip">http://raspberrypi.stackexchange.com/questions/37920/how-do-i-set-up-networking-wifi-static-ip</a><br>




