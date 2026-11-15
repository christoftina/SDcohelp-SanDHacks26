"""Shared setup for the Vercel functions: loads the SDcohelp app once per cold start."""
import importlib.util
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

_spec = importlib.util.spec_from_file_location("sdcohelp_app", os.path.join(ROOT, "app_sandhacks.py"))
app = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(app)
if app.KB is None:
    app.KB = app.KnowledgeBase()      # the Bright Data dataset in data/docs.json


class handler(app.Handler):
    """Vercel calls this class for each request; the app decides what to do by the path."""
    pass
