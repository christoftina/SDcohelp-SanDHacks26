# BridgeSD — San Diego help, in your language

A parent picks their language (普通话, 廣東話, Español, Tagalog or English), types or **speaks**
a question, and gets a short, simple answer in their own language with links to the official
source. The answer can be read out loud.

```
 Parent asks (any language)
        │
        ▼
 Gemini: "what is this question in English?"  ──►  search OUR dataset (collected with Bright Data)
                                                           │
 Gemini: write a simple answer in the parent's language ◄──┘   (using ONLY those pages)
        │
        ▼
 Answer on screen + source links + 🔊 ElevenLabs voice
 Everything runs on a Vultr server.
```

## What's in this folder

| File | What it does |
|---|---|
| `app.py` | The server. Connects the website, the dataset, Gemini and ElevenLabs. |
| `scrape.py` | Uses **Bright Data** to download the websites in `sources.json` and save the text. |
| `sources.json` | The list of websites to collect (legal aid, CalFresh, Medi-Cal, housing, schools, adult school). |
| `static/index.html` | The website people see. |
| `data/` | Your collected dataset. `data/manual/` holds notes you type yourselves. |
| `deploy/setup_vultr.sh` | Sets up the Vultr server in one command. |
| `.env.example` | Template for your secret API keys. |

You do **not** need to install anything except what's already on a Vultr Ubuntu server (Python).

---

## Step 1 — Get your API keys (≈15 min, split this up among teammates)

**Gemini**
1. Go to https://aistudio.google.com and sign in with Google.
2. Click **Get API key** → **Create API key**. Copy it.

**Bright Data**
1. Sign up at https://brightdata.com (ask the sponsor table about hackathon credits).
2. In the dashboard, go to **Proxies & Scraping** → **Add** → **Web Unlocker API**. Give it a name
   (for example `web_unlocker1`) and create it. That name is your **zone**.
3. Get your **API key** under **Account settings → API keys** (the zone page also shows example code
   that includes it).

**ElevenLabs** (optional but great for the demo)
1. Sign up at https://elevenlabs.io → **Developers → API Keys** → create a key.
2. Open the **Voices** library, pick a voice that sounds good in your languages, and click
   **Copy voice ID**. (Test Cantonese and Tagalog in their website first — if a language sounds bad,
   the app can still use the browser's own voice as a backup.)

## Step 2 — Create the Vultr server (≈5 min)

1. Log in to https://my.vultr.com → **Deploy +** → **Cloud Compute (Shared CPU)**.
2. Location: **Los Angeles** or **Silicon Valley**. Image: **Ubuntu 24.04**. Plan: the smallest one is enough.
3. Click **Deploy**. When it's running, click the server and copy its **IP address** and **root password**.

## Step 3 — Put the code on the server

On your laptop, open **Terminal** (Mac) or **PowerShell** (Windows), go to the folder that has
`bridgesd.zip`, and run (replace `YOUR_IP`):

```bash
scp bridgesd.zip root@YOUR_IP:/root/
ssh root@YOUR_IP
```

It will ask for the root password (typing is invisible — that's normal). Now you're on the server:

```bash
apt-get update && apt-get install -y unzip
unzip /root/bridgesd.zip -d /opt/
cd /opt/bridgesd
cp .env.example .env
nano .env
```

Paste your keys after the `=` signs. Save with **Ctrl+O**, **Enter**, then exit with **Ctrl+X**.

## Step 4 — Collect the dataset with Bright Data

```bash
python3 scrape.py
```

You'll see each page with `ok`, `x` (failed) or `~` (almost empty). It takes a few minutes.
Read some files in `data/pages/` to check the text looks right.

## Step 5 — Launch the website

```bash
sudo bash deploy/setup_vultr.sh
```

At the end it prints your link, like `https://45-76-12-34.sslip.io`. Open it on your phone! 🎉
(https is needed for the microphone button, and the script sets it up for free.)

---

## Everyday commands (on the server, inside `/opt/bridgesd`)

| I want to… | Run |
|---|---|
| Re-collect data after editing `sources.json` | `python3 scrape.py && sudo bash deploy/setup_vultr.sh` |
| Restart after changing code or `.env` | `sudo systemctl restart bridgesd` |
| See errors / what the app is doing | `journalctl -u bridgesd -f` (Ctrl+C to stop) |
| Check the app status | open `https://YOUR-LINK/api/health` |

## Making the dataset better (this is what wins)

- **Add specific pages** to `sources.json` (for example the exact "How to enroll" page of a school
  district, or the San Diego Housing Commission waitlist page). Copy any line and change the URL.
  `crawl` = how many extra links on that site to follow; `keywords` decide which links.
- If a site comes back empty (`~`), it probably needs JavaScript. Copy the important text from the
  page into a `.txt` file in `data/manual/` (see the README there).
- Only use **official or trusted nonprofit** sources. Check a few answers against the real pages.
- Other districts families ask about: Chula Vista Elementary, Sweetwater Union High, Grossmont Union,
  Poway Unified — add their enrollment pages.

## Troubleshooting

- **"model not found" from Gemini** → In AI Studio, copy the current *Flash* model name into
  `GEMINI_MODEL` in `.env`, then restart.
- **Gemini error 429** → too many requests on the free tier; wait a minute.
- **Bright Data error 401/403** → wrong API key or zone name in `.env`.
- **Mic button doesn't work** → use Chrome, use the `https://` link, and allow the microphone.
- **Site won't load** → run `systemctl status bridgesd caddy` and `journalctl -u bridgesd -n 50`.

## Changing things with Claude

Send Claude the file you want changed (for example `static/index.html`) and say what you want:
"make the buttons bigger", "add Vietnamese", "add a 'find a food bank near me' feature".
Put the new file back on the server and run `sudo systemctl restart bridgesd`.

## Demo ideas for judges

1. Pick **廣東話**, tap the mic, ask *"點樣幫小朋友喺聖地牙哥報讀學校?"* → answer in Cantonese + 🔊.
2. Pick **Español**, ask about CalFresh and immigration worries → calm answer + free legal aid link.
3. Show the **source links**: every answer comes from real official pages your team collected
   with Bright Data, not made up by AI.
