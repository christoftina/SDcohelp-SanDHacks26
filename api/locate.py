# Vercel function for /api/locate - all the logic lives in app_sandhacks.py
import json
import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from _shared import app
    _Base = app.Handler
    _startup_error = None
except Exception:  # show why it failed instead of a blank 500
    _Base = type("_StartupFailed", (BaseHTTPRequestHandler,), {})
    _startup_error = traceback.format_exc()


class handler(_Base, BaseHTTPRequestHandler):
    if _startup_error:
        def _fail(self):
            body = json.dumps({"error": "startup failed", "detail": _startup_error[-1500:]}).encode()
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        do_GET = do_POST = _fail
