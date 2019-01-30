#!/usr/bin/python

import RTC_DS1307 as RTC


print " set time on RTC from computer"
myrtc = RTC.RTC_DS1307()


print "before set:"
a=myrtc.read_str()
print a

print "setting time:"
myrtc.write_now()

print "after set:"
c=myrtc.read_str()
print c

