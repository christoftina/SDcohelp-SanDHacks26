#!/usr/bin/env python3
"""
SDcohelp - plain-language help for immigrant families in San Diego.

How it works:
  1. A parent asks a question in Mandarin, Cantonese, Spanish, Tagalog or English.
  2. Gemini turns the question into English search words.
  3. We search OUR dataset (pages collected with Bright Data -> data/docs.json).
  4. Gemini writes a short, simple answer in the parent's language,
     using only those pages, and we show the source links.
  5. ElevenLabs reads the answer out loud (the browser's voice is the backup).

Run it:   python3 app.py      then open  http://localhost:8000
Needs only Python 3.9+ (no extra packages).
"""
import json
import math
import os
import re
import time
import urllib.error
import urllib.request
from collections import Counter
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

VERSION = "sdcohelp-6"
ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
DATA = ROOT / "data"


# ---------------------------------------------------------------- settings --
def load_env(path=ROOT / ".env"):
    """Read KEY=VALUE lines from the .env file (where your API keys live)."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
# One model, or several separated by commas: the app tries them in order and
# moves on to the next one if a model is busy or too slow.
GEMINI_MODELS = [m.strip() for m in os.environ.get(
    "GEMINI_MODEL", "gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.5-flash").split(",") if m.strip()]
GEMINI_MODEL = GEMINI_MODELS[0]
GEMINI_TIMEOUT = int(os.environ.get("GEMINI_TIMEOUT", "25"))
# Models used to read screenshots (the bigger flash model is better at finding buttons).
GEMINI_VISION_MODELS = [m.strip() for m in os.environ.get(
    "GEMINI_VISION_MODEL", "gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite").split(",") if m.strip()]
ELEVEN_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
ELEVEN_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "")  # default voice for any language
# One voice per language (leave a line empty to use the browser's voice for that language).
ELEVEN_VOICES = {
    "zh-mandarin": os.environ.get("ELEVENLABS_VOICE_MANDARIN", ""),
    "zh-cantonese": os.environ.get("ELEVENLABS_VOICE_CANTONESE", ""),
    "es": os.environ.get("ELEVENLABS_VOICE_SPANISH", ""),
    "tl": os.environ.get("ELEVENLABS_VOICE_TAGALOG", ""),
    "en": os.environ.get("ELEVENLABS_VOICE_ENGLISH", ""),
}
ELEVEN_MODEL = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))

LANGUAGES = {
    "zh-mandarin": {
        "name": "Mandarin Chinese",
        "write": "Write in Mandarin Chinese using Simplified Chinese characters (简体中文).",
        "voice": "Mandarin Chinese",
    },
    "zh-cantonese": {
        "name": "Cantonese",
        "write": ("Write in natural spoken Cantonese (粵語/廣東話) using Traditional Chinese "
                  "characters, the way people write Cantonese in Hong Kong "
                  "(use words like 係, 唔, 嘅, 喺, 點樣). Do NOT write standard Mandarin."),
        "voice": "Cantonese",
    },
    "es": {"name": "Spanish", "write": "Write in clear, friendly Spanish (use 'tú').", "voice": "Spanish"},
    "tl": {"name": "Tagalog", "write": "Write in clear, everyday Tagalog (Filipino). Common English terms used by Filipinos in the US are fine.", "voice": "Tagalog"},
    "en": {"name": "English", "write": "Write in simple English.", "voice": "English"},
}


# ------------------------------------------------------- the knowledge base --
STOP_WORDS = set("""a an and are as at be but by can do does for from get got has have how i if in
into is it its me my of on or our so than that the their them then there these they this to us
was we what when where which who why will with would you your about any some need want please
help know tell""".split())


def tokenize(text):
    return [w for w in re.findall(r"[a-z0-9]+", text.lower()) if len(w) > 1 and w not in STOP_WORDS]


def split_text(text, size=1500):
    """Cut a long page into pieces of about `size` characters, on paragraph breaks."""
    pieces, current = [], ""
    for para in re.split(r"\n\s*\n|\n", text):
        para = para.strip()
        if not para:
            continue
        if len(current) + len(para) > size and current:
            pieces.append(current)
            current = ""
        current += para + "\n"
    if current.strip():
        pieces.append(current)
    return pieces


class KnowledgeBase:
    """Holds every collected page, cut into chunks, with a simple BM25 search."""

    def __init__(self):
        self.chunks = []
        self.doc_freq = Counter()
        self.avg_len = 1.0
        self.load()

    def load(self):
        docs = []
        docs_file = DATA / "docs.json"
        if docs_file.exists():
            docs += json.loads(docs_file.read_text(encoding="utf-8"))

        # Hand-written notes: any .txt file in data/manual/.
        # Optional first lines:  Title: ...   Source: https://...   Topic: ...
        for path in sorted((DATA / "manual").glob("*.txt")):
            meta = {"title": path.stem.replace("_", " "), "url": "", "topic": "general"}
            body = []
            for line in path.read_text(encoding="utf-8").splitlines():
                m = re.match(r"^(Title|Source|Topic):\s*(.+)$", line.strip(), re.I)
                if m and not body:
                    key = {"title": "title", "source": "url", "topic": "topic"}[m.group(1).lower()]
                    meta[key] = m.group(2).strip()
                else:
                    body.append(line)
            meta["text"] = "\n".join(body)
            docs.append(meta)

        self.chunks = []
        for doc in docs:
            for piece in split_text(doc.get("text", "")):
                tokens = tokenize(doc.get("title", "") + " " + piece)
                self.chunks.append({
                    "title": doc.get("title", "Untitled"),
                    "url": doc.get("url", ""),
                    "topic": doc.get("topic", ""),
                    "text": piece.strip(),
                    "tf": Counter(tokens),
                    "len": len(tokens) or 1,
                })
        self.doc_freq = Counter()
        for c in self.chunks:
            self.doc_freq.update(c["tf"].keys())
        self.avg_len = sum(c["len"] for c in self.chunks) / max(len(self.chunks), 1)
        self.page_count = len(docs)

    def search(self, query, k=6, per_page=2):
        terms = set(tokenize(query))
        n = len(self.chunks)
        scored = []
        for c in self.chunks:
            score = 0.0
            for t in terms:
                tf = c["tf"].get(t, 0)
                if not tf:
                    continue
                idf = math.log(1 + (n - self.doc_freq[t] + 0.5) / (self.doc_freq[t] + 0.5))
                score += idf * tf * 2.5 / (tf + 1.5 * (0.25 + 0.75 * c["len"] / self.avg_len))
            if score > 0:
                scored.append((score, c))
        scored.sort(key=lambda x: x[0], reverse=True)
        results, used = [], Counter()
        for _, c in scored:
            if used[c["url"] or c["title"]] >= per_page:
                continue
            used[c["url"] or c["title"]] += 1
            results.append(c)
            if len(results) >= k:
                break
        return results


KB = None  # created in main()


# --------------------------------------------------------------- activity log --
def log_event(text):
    """Write a short line to logs/app.log (never the person's question or answers)."""
    try:
        (ROOT / "logs").mkdir(exist_ok=True)
        with open(ROOT / "logs" / "app.log", "a", encoding="utf-8") as f:
            f.write(time.strftime("%H:%M:%S ") + text + "\n")
    except OSError:
        pass


# ------------------------------------------------------------------ Gemini --
GEMINI_THINKING = os.environ.get("GEMINI_THINKING", "low")  # low = faster answers
_thinking_supported = True


def _gemini_request(body, model, timeout=None):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    req = urllib.request.Request(
        url, data=json.dumps(body).encode("utf-8"), method="POST",
        headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
    )
    with urllib.request.urlopen(req, timeout=timeout or GEMINI_TIMEOUT) as resp:
        return json.load(resp)


def _extract_json(text):
    """Pull the JSON object out of Gemini's reply, even if it added extra words."""
    text = re.sub(r"^```(?:json)?|```$", "", text.strip()).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end > start:
            return json.loads(text[start:end + 1])
        raise


def ask_gemini(system_prompt, user_text, temperature=0.2, image_b64=None, models=None, timeout=None):
    """Send one request to Gemini and get JSON back."""
    global _thinking_supported
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is missing. Add it to the .env file.")
    config = {"temperature": temperature, "responseMimeType": "application/json"}
    if _thinking_supported and GEMINI_THINKING:
        config["thinkingConfig"] = {"thinkingLevel": GEMINI_THINKING}
    body = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": (
            [{"inline_data": {"mime_type": "image/jpeg", "data": image_b64}}] if image_b64 else []
        ) + [{"text": user_text}]}],
        "generationConfig": config,
    }
    started = time.time()
    data, problems = None, []
    for model in (models or GEMINI_MODELS):
        try:
            try:
                data = _gemini_request(body, model, timeout)
            except urllib.error.HTTPError as e:
                detail = e.read().decode("utf-8", "replace")
                if e.code == 400 and "thinking" in detail.lower() and "thinkingConfig" in config:
                    # this model doesn't accept the speed setting - retry without it
                    _thinking_supported = False
                    del config["thinkingConfig"]
                    data = _gemini_request(body, model, timeout)
                else:
                    raise RuntimeError(f"error {e.code}: {detail[:300]}") from None
            break
        except urllib.error.HTTPError as e:
            problems.append(f"{model}: error {e.code}: {e.read().decode('utf-8', 'replace')[:200]}")
        except RuntimeError as e:
            problems.append(f"{model}: {e}")
        except (TimeoutError, OSError) as e:
            problems.append(f"{model}: too slow or unreachable ({e})")
        print(f"  {problems[-1][:160]}  -> trying next model")
    if data is None:
        raise RuntimeError("All Gemini models failed: " + " | ".join(problems))
    print(f"  Gemini ({model}) answered in {time.time() - started:.1f}s")

    try:
        parts = data["candidates"][0]["content"]["parts"]
        text = "".join(p.get("text", "") for p in parts if not p.get("thought"))
        result = _extract_json(text)
    except (KeyError, IndexError, ValueError):
        raise RuntimeError(f"Gemini sent an answer we could not read: {json.dumps(data)[:400]}") from None
    return result


UNDERSTAND_PROMPT = """You help a search engine for San Diego community, government, legal and
education resources. The user may write in Chinese (Mandarin or Cantonese), Spanish, Tagalog or English.
Return JSON with exactly these keys:
  "english_question": the question translated into clear English,
  "keywords": 5 to 10 English search keywords. Include official program names when they fit
              (for example CalFresh, Medi-Cal, CalWORKs, WIC, Section 8, housing voucher,
              legal aid, immigration, eviction, tenant, school enrollment, adult school, ESL, GED),
  "topic": one of "legal", "benefits", "housing", "education", "other",
  "is_emergency": true only if someone may be in danger right now,
  "form": which application the person could get ready for, or "none":
          "calfresh" (food stamps / CalFresh / EBT), "medi-cal" (Medi-Cal / health insurance),
          "school-enrollment" (enrolling a child in a K-12 school), "legal-help" (wants a lawyer
          or legal aid for a problem: eviction, immigration, family, benefits denied, debt, wages)."""

ANSWER_PROMPT = """LANGUAGE: Your whole answer MUST be written in {language_name}. The documents
are in English, but you always answer in {language_name}.

You are SDcohelp, a kind and patient helper for immigrant families in
San Diego County, California. Many users are new to the US and are not used to government systems.

RULES
1. Use ONLY the facts in the DOCUMENTS. Never invent phone numbers, addresses, dollar amounts,
   dates, office hours or eligibility rules. If the documents do not answer the question,
   say so honestly and suggest calling 2-1-1 San Diego (dial 211, free, help in many languages).
2. Use very simple words (about 6th-grade level) and short sentences. The first time you use a
   program name, explain it in a few words (for example: "CalFresh - money each month for food").
3. Shape: one or two sentences that answer directly, then "next steps" as a short numbered list
   (1., 2., 3.). Keep the whole answer under about 170 words. Plain text only - no **, no #.
4. If the question involves immigration status, deportation or fear of using benefits, be calm
   and reassuring, do not guess about how it affects their case, and point them to a free legal
   aid organization from the DOCUMENTS.
5. If is_emergency is true, start by telling them to call 911.
6. End with one short sentence saying this is general information, not legal advice.
7. {language_rule}

Return JSON with exactly these keys:
  "answer": the full answer text, written in {language_name},
  "used_sources": list of the document numbers you used, like [1, 3],
  "found_in_documents": true or false"""


def answer_question(question, lang_code):
    lang = LANGUAGES.get(lang_code, LANGUAGES["en"])

    # Step 1 - understand the question (in any language) as English search words.
    understood = ask_gemini(UNDERSTAND_PROMPT, question)
    english = str(understood.get("english_question") or question)
    keywords = " ".join(str(k) for k in understood.get("keywords", []))

    # Step 2 - search our collected Bright Data dataset.
    hits = KB.search(english + " " + keywords, k=6)
    if hits:
        documents = "\n\n".join(
            f"[{i}] {h['title']} ({h['url'] or 'team notes'})\n{h['text']}"
            for i, h in enumerate(hits, 1)
        )
    else:
        documents = "(No matching documents were found.)"

    # Step 3 - write the simple answer in the parent's language.
    result = ask_gemini(
        ANSWER_PROMPT.format(language_rule=lang["write"], language_name=lang["name"]),
        f"is_emergency: {bool(understood.get('is_emergency'))}\n"
        f"Parent's question (their words): {question}\n"
        f"Same question in English: {english}\n\nDOCUMENTS:\n{documents}\n\n"
        f"Remember: write the answer in {lang['name']}.",
        temperature=0.3,
    )
    answer = str(result.get("answer", "")).strip()
    if lang_code in LANGUAGES and lang_code != "en" and wrong_language(answer, lang_code):
        log_event(f"answer came back in the wrong language -> translating to {lang['name']}")
        answer = translate_text(answer, lang)

    sources, seen = [], set()
    for n in result.get("used_sources") or []:
        try:
            hit = hits[int(n) - 1]
        except (ValueError, IndexError, TypeError):
            continue
        key = hit["url"] or hit["title"]
        if key not in seen:
            seen.add(key)
            sources.append({"title": hit["title"], "url": hit["url"]})

    form = pick_form(understood, question, english, keywords)
    log_event(f"question answered | language={lang_code} | form={form} | gemini_form={understood.get('form')!r}")
    return {
        "answer": answer,
        "sources": sources,
        "english_question": english,
        "topic": understood.get("topic"),
        "found_in_documents": bool(result.get("found_in_documents")),
        "form": form,
    }


ENGLISH_WORDS = set("the and you your to for is are of can this with that will need apply if".split())


def wrong_language(text, lang_code):
    """Rough check: does an answer that should be Chinese/Spanish/Tagalog look like English?"""
    if not text:
        return False
    # ignore quoted button names like "Apply for benefits" - those stay in English on purpose
    text = re.sub(r'"[^"]*"|“[^”]*”|「[^」]*」|『[^』]*』', " ", text)
    if lang_code.startswith("zh"):
        cjk = sum(1 for ch in text if "\u4e00" <= ch <= "\u9fff")
        return cjk < len(text) * 0.15
    words = re.findall(r"[a-z]+", text.lower())
    if not words:
        return False
    return sum(w in ENGLISH_WORDS for w in words) / len(words) > 0.12


def translate_text(text, lang):
    result = ask_gemini(
        f"Translate the text into {lang['name']}. {lang['write']} Keep the numbered steps, "
        "line breaks, program names, phone numbers and website names. "
        'Return JSON: {"text": "the translation"}',
        text, temperature=0.1)
    return str(result.get("text") or text).strip()


# --------------------------------------------- "Get ready to apply" forms --
FORM_IDS = {"calfresh", "medi-cal", "school-enrollment", "legal-help"}

# Backup in case Gemini doesn't name a form: look for these words in the question.
FORM_WORDS = {
    "calfresh": ["calfresh", "cal fresh", "food stamp", "snap", "ebt", "food assistance", "food help",
                 "food benefit", "食物", "食品", "comida", "pagkain"],
    "medi-cal": ["medi-cal", "medical", "medicaid", "health insurance", "health coverage", "医疗", "醫療",
                 "seguro médico", "seguro medico", "health care"],
    "school-enrollment": ["enroll", "school registration", "register my child", "sign up for school",
                          "报名", "報名", "報讀", "上学", "上學", "inscrib", "matricul", "i-enroll"],
    "legal-help": ["lawyer", "attorney", "legal aid", "legal help", "eviction", "evict", "律师", "律師",
                   "法律援助", "abogado", "ayuda legal", "desalojo", "abogado", "tulong legal"],
}


def pick_form(understood, *texts):
    form = str(understood.get("form") or "").strip().lower()
    if form in FORM_IDS:
        return form
    hay = " ".join(str(t) for t in texts).lower()
    for form_id, words in FORM_WORDS.items():
        if any(w in hay for w in words):
            return form_id
    return None

FORM_PROMPT = """You help immigrant families in San Diego get ready to fill out an official
application. You get the questions and the person's answers. Answers may be in Chinese
(Mandarin or Cantonese), Spanish, Tagalog or English.

Translate each answer into clear, simple English that can be copied into an official form.
RULES
- Keep names, street addresses, email addresses, phone numbers, amounts and dates exactly as
  written. If a name or address is written in Chinese characters, keep the characters and add a
  romanized version in parentheses ({romanization}).
- Write amounts of money like "$1,200 per month" when the meaning is clear.
- Never add facts, never guess, never give advice. If an answer is unclear, translate it as it is.
{summary_rule}
Return JSON with exactly these keys:
  "answers": an object mapping each question id to its English answer,
  "summary_en": {summary_en_desc},
  "summary_native": {summary_native_desc}"""


GOALS = {
    "calfresh": "start a NEW application for CalFresh (food benefits), for example on BenefitsCal.com or GetCalFresh.org",
    "medi-cal": "start a NEW application for Medi-Cal (health coverage), for example on BenefitsCal.com or CoveredCA.com",
    "school-enrollment": "start enrolling a NEW student in San Diego Unified School District (the Online Enrollment Portal on sandiegounified.org)",
    "legal-help": "ask the Legal Aid Society of San Diego (lassd.org) for free legal help: the apply-for-help / online intake form or contact page",
}

LOCATE_PROMPT = """You help a parent who does not read English well use a website.
You get a screenshot of the page they see right now. Their goal: {goal}.

Find the ONE thing they should click or tap next to move toward that goal (a button, link,
menu, tab or menu icon). Prefer the most direct path. Ignore ads and unrelated links.
- If the screenshot already shows the application form asking for their information, status is "done".
- If the right thing is probably further down the page, status is "scroll".
- If you cannot find anything useful, or the page is unrelated, status is "not_found".
- Otherwise status is "click".

Return JSON with exactly these keys:
  "status": "click", "scroll", "done" or "not_found",
  "box_2d": for "click": [ymin, xmin, ymax, xmax] of the element, each 0-1000 relative to the image; otherwise null,
  "label": the exact visible text of the element (or "" if none),
  "instruction_en": one short, friendly sentence in English, for example: Tap the blue "Apply Now" button at the top right.,
  "instruction_native": the same sentence in {language}. {language_rule} Keep the button's English text in quotes exactly as it appears on the screen,
  "sensitive": true if this page asks for private information such as a Social Security number, password, bank or card number"""


def locate_next_step(form_id, lang_code, image_b64):
    """Look at a screenshot and find what to click next. The image is never saved."""
    lang = LANGUAGES.get(lang_code, LANGUAGES["en"])
    result = ask_gemini(
        LOCATE_PROMPT.format(goal=GOALS[form_id], language=lang["name"], language_rule=lang["write"]),
        "Here is the screenshot. What should they press next?",
        temperature=0.1, image_b64=image_b64, models=GEMINI_VISION_MODELS, timeout=45)
    status = result.get("status") if result.get("status") in ("click", "scroll", "done", "not_found") else "not_found"
    box = result.get("box_2d")
    if status == "click":
        try:
            box = [max(0.0, min(1000.0, float(v))) for v in box][:4]
            if len(box) != 4 or box[2] <= box[0] or box[3] <= box[1]:
                raise ValueError
        except (TypeError, ValueError):
            status, box = "not_found", None
    else:
        box = None
    instruction = str(result.get("instruction_native") or "")
    if lang_code != "en" and instruction and wrong_language(instruction, lang_code):
        instruction = translate_text(instruction, lang)
    log_event(f"screenshot checked | form={form_id} | language={lang_code} | status={status}")
    return {
        "status": status, "box": box, "label": str(result.get("label") or ""),
        "instruction": instruction, "instruction_en": str(result.get("instruction_en") or ""),
        "sensitive": bool(result.get("sensitive")),
    }


def prepare_form(form_id, lang_code, items):
    """Translate form answers to English. Nothing here is stored anywhere."""
    lang = LANGUAGES.get(lang_code, LANGUAGES["en"])
    legal = form_id == "legal-help"
    prompt = FORM_PROMPT.format(
        romanization="Jyutping / Hong Kong style for Cantonese speakers" if lang_code == "zh-cantonese"
        else "pinyin",
        summary_rule=("- Also write a short, factual summary (3 to 5 sentences) of the person's legal "
                      "problem for a legal aid intake worker: what happened, any deadlines or court "
                      "dates, and papers received. Only use what the person wrote." if legal else ""),
        summary_en_desc="the summary in English" if legal else 'an empty string ""',
        summary_native_desc=(f"the same summary in {lang['name']}. {lang['write']}" if legal
                             else 'an empty string ""'),
    )
    lines = [f'[{it["id"]}] Question: {it["question"]}\nAnswer: {it["answer"]}' for it in items]
    result = ask_gemini(prompt, "\n\n".join(lines) or "(no answers)", temperature=0.1)
    answers = result.get("answers") if isinstance(result.get("answers"), dict) else {}
    return {
        "answers": {str(k): str(v) for k, v in answers.items()},
        "summary_en": str(result.get("summary_en") or ""),
        "summary_native": str(result.get("summary_native") or ""),
    }


# -------------------------------------------------------------- ElevenLabs --
def voice_for(lang_code):
    return ELEVEN_VOICES.get(lang_code) or ELEVEN_VOICE_ID


def text_to_speech(text, voice_id):
    url = (f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
           "?output_format=mp3_44100_128")
    body = {"text": text[:2500], "model_id": ELEVEN_MODEL}
    req = urllib.request.Request(
        url, data=json.dumps(body).encode("utf-8"), method="POST",
        headers={"xi-api-key": ELEVEN_API_KEY, "Content-Type": "application/json",
                 "Accept": "audio/mpeg"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.read()
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:300]
        raise RuntimeError(f"ElevenLabs returned error {e.code}: {detail}") from None
    except urllib.error.URLError as e:
        raise RuntimeError(f"Could not reach ElevenLabs: {e.reason}") from None


# ------------------------------------------------------------- web server --
CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
    ".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json",
}


class Handler(BaseHTTPRequestHandler):
    server_version = "SDcohelp"

    def send(self, code, body, content_type="application/json; charset=utf-8"):
        if isinstance(body, (dict, list)):
            body = json.dumps(body, ensure_ascii=False).encode("utf-8")
        elif isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/health":
            return self.send(200, {
                "version": VERSION, "pages": KB.page_count, "chunks": len(KB.chunks),
                "gemini_ready": bool(GEMINI_API_KEY), "gemini_model": GEMINI_MODEL,
                "voices": {k: bool(ELEVEN_API_KEY and voice_for(k)) for k in LANGUAGES},
            })
        if path == "/":
            path = "/index.html"
        file = (STATIC / path.lstrip("/")).resolve()
        if STATIC not in file.parents or not file.is_file():
            return self.send(404, {"error": "Not found"})
        self.send(200, file.read_bytes(),
                  CONTENT_TYPES.get(file.suffix, "application/octet-stream"))

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length > (8_000_000 if path == "/api/locate" else 100000):
                return self.send(413, {"error": "Request too large"})
            body = json.loads(self.rfile.read(length) or b"{}")
        except (ValueError, json.JSONDecodeError):
            return self.send(400, {"error": "Bad request"})

        if path == "/api/ask":
            question = str(body.get("question", "")).strip()[:1000]
            if not question:
                return self.send(400, {"error": "Please type a question."})
            try:
                return self.send(200, answer_question(question, str(body.get("language", "en"))))
            except RuntimeError as e:
                print("ERROR:", e)
                return self.send(502, {"error": str(e)})
            except Exception as e:  # keep the server alive no matter what
                import traceback
                traceback.print_exc()
                return self.send(500, {"error": f"Server problem: {e!r}"})

        if path == "/api/prepare-form":
            form_id = str(body.get("form", ""))
            items = body.get("items") or []
            if form_id not in FORM_IDS or not isinstance(items, list) or len(items) > 30:
                return self.send(400, {"error": "Bad form request"})
            clean = []
            for it in items:
                if isinstance(it, dict) and str(it.get("answer", "")).strip():
                    clean.append({"id": str(it.get("id", ""))[:40],
                                  "question": str(it.get("question", ""))[:300],
                                  "answer": str(it.get("answer", ""))[:2000]})
            try:
                return self.send(200, prepare_form(form_id, str(body.get("language", "en")), clean))
            except RuntimeError as e:
                print("ERROR (form):", str(e)[:200])
                return self.send(502, {"error": "Could not prepare the form right now."})
            except Exception as e:
                print("UNEXPECTED ERROR (form):", type(e).__name__)
                return self.send(500, {"error": "Server problem"})

        if path == "/api/locate":
            form_id = str(body.get("form", ""))
            image = str(body.get("image", ""))
            if image.startswith("data:"):
                image = image.split(",", 1)[-1]
            if form_id not in GOALS or len(image) < 100:
                return self.send(400, {"error": "Bad screenshot request"})
            try:
                return self.send(200, locate_next_step(form_id, str(body.get("language", "en")), image))
            except RuntimeError as e:
                print("ERROR (screenshot):", str(e)[:200])
                return self.send(502, {"error": "Could not read the screenshot right now."})
            except Exception as e:
                print("UNEXPECTED ERROR (screenshot):", type(e).__name__)
                return self.send(500, {"error": "Server problem"})

        if path == "/api/speak":
            voice_id = voice_for(str(body.get("language", "")))
            if not (ELEVEN_API_KEY and voice_id):
                return self.send(503, {"error": "No ElevenLabs voice for this language."})
            text = str(body.get("text", "")).strip()
            if not text:
                return self.send(400, {"error": "No text"})
            try:
                return self.send(200, text_to_speech(text, voice_id), "audio/mpeg")
            except RuntimeError as e:
                print("ERROR:", e)
                return self.send(502, {"error": str(e)})

        self.send(404, {"error": "Not found"})

    def log_message(self, fmt, *args):
        print(f"{self.address_string()} {fmt % args}")


def main():
    global KB
    KB = KnowledgeBase()
    print(f"SDcohelp version: {VERSION}")
    log_event(f"server started, version {VERSION}")
    print(f"Loaded {KB.page_count} pages ({len(KB.chunks)} chunks) from data/")
    if not KB.chunks:
        print("  -> No data yet. Run:  python3 scrape.py")
    print(f"Gemini: {'ready' if GEMINI_API_KEY else 'MISSING KEY'} (models: {', '.join(GEMINI_MODELS)})")
    for code, info in LANGUAGES.items():
        print(f"Voice for {info['name']}: {'ElevenLabs' if ELEVEN_API_KEY and voice_for(code) else 'browser voice'}")
    print(f"Open http://localhost:{PORT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
