#!/usr/bin/env python3
"""
CSI GRIET — SPA Dev Server
Serves static files; falls back to index.html for all unknown paths.

Usage:
  python3 server.py         # runs on port 8080
  python3 server.py 3000    # runs on port 3000
"""
import sys, os
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT = Path(__file__).parent

class SPAHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Use the project root, not cwd
        parsed = urlparse(path)
        clean = parsed.path
        full = ROOT / clean.lstrip('/')
        return str(full)

    def do_GET(self):
        parsed = urlparse(self.path)
        clean  = parsed.path
        target = ROOT / clean.lstrip('/')

        # Serve real files/dirs as-is
        if target.is_file():
            return super().do_GET()
        if (target / 'index.html').is_file():
            return super().do_GET()

        # SPA fallback → index.html (preserve query string for legacy ?page= support)
        self.path = '/index.html'
        return super().do_GET()

    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} {fmt % args}")

    def end_headers(self):
        # Add CORS for local dev
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(ROOT)
    server = HTTPServer(('', PORT), SPAHandler)
    print(f"\n  CSI GRIET Dev Server")
    print(f"  ➜  http://localhost:{PORT}\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  Stopped.')
