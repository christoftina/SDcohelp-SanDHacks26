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
| `docs/index.html` | The website people see. |
| `data/` | Your collected dataset. `data/manual/` holds notes you type yourselves. |
| `deploy/setup_vultr.sh` | Sets up the Vultr server in one command. |
| `.env.example` | Template for your secret API keys. |

