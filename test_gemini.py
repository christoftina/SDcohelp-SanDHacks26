#!/usr/bin/env python3
"""Quick Gemini check: tries several models at once. Run:  python3 test_gemini.py"""
import json, os, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

for line in (Path(__file__).resolve().parent / ".env").read_text(encoding="utf-8").splitlines():
    if "=" in line and not line.strip().startswith("#"):
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())
KEY = os.environ.get("GEMINI_API_KEY", "")
BASE = "https://generativelanguage.googleapis.com/v1beta"
MODELS = ["gemini-flash-latest", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash",
          "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-flash-lite-latest", "gemini-3.8-flash"]
BODY = {"contents": [{"role": "user", "parts": [{"text": 'Say hi in Spanish. Reply as JSON like {"text": "..."}'}]}],
        "generationConfig": {"responseMimeType": "application/json"}}


def try_model(model):
    started = time.time()
    req = urllib.request.Request(f"{BASE}/models/{model}:generateContent", data=json.dumps(BODY).encode(),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": KEY}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            data = json.load(r)
        text = "".join(p.get("text", "") for p in data["candidates"][0]["content"]["parts"] if not p.get("thought"))
        return f"[OK]   {model:28} {time.time()-started:5.1f}s   reply: {text.strip()[:60]}"
    except urllib.error.HTTPError as e:
        return f"[FAIL] {model:28} error {e.code}: {e.read().decode()[:150]}"
    except Exception as e:
        return f"[FAIL] {model:28} {time.time()-started:5.1f}s  {e}"


print("Trying models at the same time (up to 45 seconds)...\n")
with ThreadPoolExecutor(len(MODELS)) as pool:
    for line in pool.map(try_model, MODELS):
        print(line)
print("\nDone - send a screenshot.")
