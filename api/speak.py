# Vercel function for /api/speak - all the logic lives in app_sandhacks.py
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _shared import app  # noqa: E402


class handler(app.Handler, BaseHTTPRequestHandler):
    pass
