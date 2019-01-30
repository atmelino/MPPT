#!/usr/bin/python
import SocketServer
from BaseHTTPServer import BaseHTTPRequestHandler

class MyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write('<:3)~~~\n')

httpd = SocketServer.TCPServer(("", 8888), MyHandler)
httpd.serve_forever()