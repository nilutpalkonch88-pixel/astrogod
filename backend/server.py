"""AstroGod backend — Flask: precise charts, Vimshottari, palm analysis, oracle AI."""
import os
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
from astro_engine import compute_chart, vimshottari, NAK, RASHIS
from palm_engine import analyze

app = Flask(__name__)
CORS(app)

@app.get("/api/health")
def health():
    return jsonify(ok=True, engine="swiss-ephemeris", time=datetime.now().isoformat())

@app.post("/api/chart")
def chart():
    b = request.get_json(force=True) or {}
    try:
        c = compute_chart(b.get("date", "2000-01-01"), b.get("time", "12:00"),
                          float(b.get("lat", 26.9)), float(b.get("lon", 75.8)))
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 400
    birth = datetime.strptime(b.get("date", "2000-01-01"), "%Y-%m-%d")
    moon = next(p["deg"] for p in c["planets"] if p["ab"] == "Mo")
    c["vimshottari"] = vimshottari(moon, birth)
    c["ok"] = True
    return jsonify(c)

@app.post("/api/palm")
def palm():
    if "image" not in request.files:
        return jsonify(ok=False, error="no image field 'image'"), 400
    data = request.files["image"].read()
    if len(data) > 6 * 1024 * 1024:
        return jsonify(ok=False, error="image too large (6MB max)"), 400
    try:
        r = analyze(data)
    except Exception as e:
        return jsonify(ok=False, error="vision failed: " + str(e)), 400
    return jsonify(ok=True, **r)

SYS = ("You are AstroGod, a friendly Vedic astrology teacher. Ground answers in "
"Parashara/Phaladeepika/Laghu-Parashari/Yogini-dasha/Goel-divisional principles, "
"name houses/lords/yogas, give timelines + remedies, under 220 words, "
"educational-only disclaimer for health.")

@app.post("/api/oracle")
def oracle():
    b = request.get_json(force=True) or {}
    q = (b.get("question") or "").strip()
    ctx = (b.get("context") or "").strip()
    if not q:
        return jsonify(ok=False, error="empty question"), 400
    # 1) MY API, built by me (no key needed): local chart-aware reasoning engine
    try:
        from oracle_engine import answer as local_answer
        t = local_answer(q, ctx)
        if t and len(t) > 10:
            return jsonify(ok=True, answer=t, via="astrogod-python")
    except Exception:
        pass
    # 2) Cloud LLM options — Gemini key (env GEMINI_KEY or user key), then keyless chain
    import urllib.request, json
    user_key = (b.get("key") or "").strip()
    gkey = user_key or os.environ.get("GEMINI_KEY", "")
    if gkey:
        try:
            url = ("https://generativelanguage.googleapis.com/v1beta/models/"
                   "gemini-1.5-flash:generateContent?key=" + gkey)
            gp = json.dumps({"contents": [{"parts": [
                {"text": SYS + "\n\n" + (ctx + "\n\n" + q)[:1500]}]}]}).encode()
            req = urllib.request.Request(url, data=gp,
                                         headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=25) as r:
                j = json.loads(r.read().decode())
                parts = (((j.get("candidates") or [{}])[0].get("content") or {})
                         .get("parts") or [])
                t = "".join(p.get("text", "") for p in parts)
                if t and len(t) > 10:
                    return jsonify(ok=True, answer=t, via="gemini-flash")
        except Exception:
            pass
    payload = json.dumps({"model": "openai", "messages": [
        {"role": "system", "content": SYS},
        {"role": "user", "content": (ctx + "\n\n" + q)[:1500]}],
        "max_tokens": 600}).encode()
    for url in ("https://text.pollinations.ai/openai",):
        try:
            req = urllib.request.Request(url, data=payload,
                                         headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=20) as r:
                j = json.loads(r.read().decode())
                t = (j.get("choices") or [{}])[0].get("message", {}).get("content", "")
                if t and len(t) > 10:
                    return jsonify(ok=True, answer=t, via="astrogod-python")
        except Exception:
            continue
    return jsonify(ok=False, error="AI unreachable (offline?)"), 502

@app.get("/")
def root():
    return _send("index.html", "text/html; charset=utf-8")

@app.get("/<path:fname>")
def static_files(fname):
    if ".." in fname or fname.startswith("/"):
        return jsonify(ok=False, error="bad path"), 400
    mime = ("text/css; charset=utf-8" if fname.endswith(".css") else
            "application/javascript; charset=utf-8" if fname.endswith(".js") else
            "text/html; charset=utf-8" if fname.endswith(".html") else
            "image/x-icon" if fname.endswith(".ico") else
            "application/octet-stream")
    return _send(fname, mime)

def _send(fname, mime):
    path = os.path.join(BASE, fname)
    if not os.path.isfile(path):
        return jsonify(ok=False, error=f"{fname} not found"), 404
    with open(path, "rb") as f:
        data = f.read()
    from flask import Response
    resp = Response(data, mimetype=mime)
    resp.headers["Cache-Control"] = "no-store"
    return resp

if __name__ == "__main__":
    print("AstroGod Python backend on http://localhost:5000 (serves ../ frontend too)")
    app.run(host="0.0.0.0", port=5000, debug=False)
