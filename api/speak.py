# Vercel function for /api/speak - all the logic lives in app_sandhacks.py
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _shared import handler  # noqa: E402,F401
