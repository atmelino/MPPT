#!/usr/bin/python

import RTC_DS1307 as RTC


print "read time rtc"
myrtc = RTC.RTC_DS1307()



a=myrtc.read_all()
print a


c=myrtc.read_str()
print c

