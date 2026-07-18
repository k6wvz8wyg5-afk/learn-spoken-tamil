import http.server
import os
import sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "src"))
handler = http.server.SimpleHTTPRequestHandler
server = http.server.HTTPServer(("", 3000), handler)
print("Serving on http://localhost:3000")
server.serve_forever()
