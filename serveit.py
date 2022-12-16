#!/usr/bin/env python3

# From https://stackoverflow.com/a/28708920/2631441
# @author DBrown

import http.server

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_my_headers()
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')


if __name__ == '__main__':
    http.server.test(HandlerClass=MyHTTPRequestHandler, port=8080)
