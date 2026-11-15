#!/usr/bin/env python3
"""
Collect the dataset with Bright Data.

  python3 scrape.py                  # uses Bright Data Web Unlocker (needs .env keys)
  python3 scrape.py --no-brightdata  # quick test that fetches pages directly

Reads the list of websites in sources.json, downloads each page through
Bright Data, keeps only the readable text, and saves:
  data/docs.json      <- what the app searches
  data/pages/*.txt    <- one file per page so your team can read/check it
After scraping, restart the app so it loads the new data.
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urldefrag, urlparse

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
PAGES = DATA / "pages"


def load_env(path=ROOT / ".env"):
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_env()
BRIGHTDATA_API_KEY = os.environ.get("BRIGHTDATA_API_KEY", "")
BRIGHTDATA_ZONE = os.environ.get("BRIGHTDATA_ZONE", "")


# ---------------------------------------------------------- page fetching --
def fetch_with_brightdata(url):
    """Bright Data Web Unlocker: we send a URL, Bright Data sends back the page."""
    body = {"zone": BRIGHTDATA_ZONE, "url": url, "format": "raw"}
    req = urllib.request.Request(
        "https://api.brightdata.com/request",
        data=json.dumps(body).encode("utf-8"), method="POST",
        headers={"Authorization": f"Bearer {BRIGHTDATA_API_KEY}",
                 "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read().decode("utf-8", "replace")


def fetch_direct(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (BridgeSD hackathon project)"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", "replace")


# ------------------------------------------------------ HTML -> clean text --
class PageReader(HTMLParser):
    SKIP = {"script", "style", "noscript", "svg", "template", "iframe", "nav", "footer", "select"}
    BLOCK = {"p", "div", "li", "br", "tr", "td", "section", "article", "main", "dd", "dt",
             "h1", "h2", "h3", "h4", "h5", "h6", "table", "ul", "ol", "blockquote"}

    def __init__(self, base_url):
        super().__init__(convert_charrefs=True)
        self.base_url = base_url
        self.parts, self.links = [], []
        self.title = ""
        self._skip = 0
        self._in_title = False
        self._link = None

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self._skip += 1
        elif tag == "title":
            self._in_title = True
        elif tag == "a":
            href = dict(attrs).get("href")
            if href:
                self._link = [urldefrag(urljoin(self.base_url, href))[0], []]
        if tag in self.BLOCK:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.SKIP and self._skip:
            self._skip -= 1
        elif tag == "title":
            self._in_title = False
        elif tag == "a" and self._link:
            self.links.append((self._link[0], " ".join(self._link[1]).strip()))
            self._link = None
        if tag in self.BLOCK:
            self.parts.append("\n")

    def handle_data(self, data):
        if self._in_title:
            self.title += data
            return
        if self._link is not None:
            self._link[1].append(data.strip())
        if not self._skip:
            self.parts.append(data)

    def text(self):
        lines, seen = [], set()
        for line in "".join(self.parts).split("\n"):
            line = re.sub(r"\s+", " ", line).strip()
            # keep real sentences, drop menu words and repeated lines
            if len(line.split()) < 4 or line in seen:
                continue
            seen.add(line)
            lines.append(line)
        return "\n".join(lines)


def same_site(a, b):
    host = lambda u: urlparse(u).netloc.lower().removeprefix("www.")
    return host(a) == host(b)


def pick_links(page_url, links, keywords, limit, seen):
    """Choose the most useful links on the same website (for 'crawl' sources)."""
    scored = []
    for href, label in links:
        if not href.startswith("http") or not same_site(href, page_url) or href in seen:
            continue
        if re.search(r"\.(pdf|jpg|jpeg|png|gif|zip|docx?|xlsx?|mp4)$", href, re.I):
            continue
        hay = (href + " " + label).lower()
        score = sum(1 for k in keywords if k.lower() in hay)
        if score:
            scored.append((score, href))
    scored.sort(key=lambda x: -x[0])
    chosen = []
    for _, href in scored:
        if href not in chosen:
            chosen.append(href)
        if len(chosen) >= limit:
            break
    return chosen


# --------------------------------------------------------------------- main --
def main():
    direct = "--no-brightdata" in sys.argv
    if not direct and not (BRIGHTDATA_API_KEY and BRIGHTDATA_ZONE):
        sys.exit("Missing BRIGHTDATA_API_KEY or BRIGHTDATA_ZONE in .env "
                 "(or run:  python3 scrape.py --no-brightdata  to test).")
    fetch = fetch_direct if direct else fetch_with_brightdata
    print("Fetching pages", "directly (test mode)" if direct else "through Bright Data", "...\n")

    sources = json.loads((ROOT / "sources.json").read_text(encoding="utf-8"))
    PAGES.mkdir(parents=True, exist_ok=True)
    docs, seen, failed = [], set(), []

    def grab(url, topic, fallback_title):
        seen.add(url)
        try:
            html = fetch(url)
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            print(f"  x  {url}  ({e})")
            failed.append(url)
            return None
        reader = PageReader(url)
        try:
            reader.feed(html)
        except Exception as e:
            print(f"  x  {url}  (could not read page: {e})")
            failed.append(url)
            return None
        text = reader.text()
        title = re.sub(r"\s+", " ", reader.title).strip() or fallback_title
        if len(text) < 200:
            print(f"  ~  {url}  (almost no text - site may need JavaScript; add notes in data/manual/)")
            failed.append(url)
        else:
            docs.append({"title": title, "url": url, "topic": topic, "text": text})
            print(f"  ok {url}  ({len(text):,} characters)")
        time.sleep(0.5)
        return reader

    for src in sources:
        reader = grab(src["url"], src["topic"], src["title"])
        crawl = int(src.get("crawl", 0))
        if reader and crawl:
            for link in pick_links(src["url"], reader.links, src.get("keywords", []), crawl, seen):
                grab(link, src["topic"], src["title"])

    (DATA / "docs.json").write_text(json.dumps(docs, ensure_ascii=False, indent=1), encoding="utf-8")
    for old in PAGES.glob("*.txt"):
        old.unlink()
    for i, d in enumerate(docs, 1):
        slug = re.sub(r"[^a-z0-9]+", "-", d["title"].lower())[:50].strip("-")
        (PAGES / f"{i:03d}_{slug}.txt").write_text(
            f"Title: {d['title']}\nSource: {d['url']}\nTopic: {d['topic']}\n\n{d['text']}",
            encoding="utf-8")

    print(f"\nSaved {len(docs)} pages to data/docs.json")
    if failed:
        print(f"{len(failed)} pages failed or were empty (listed above with x or ~).")
    print("Now restart the app so it loads the new data.")


if __name__ == "__main__":
    main()
