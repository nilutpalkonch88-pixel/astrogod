"""AstroGod Python palm engine — OpenCV-free (PIL+numpy): skin mask, crease map, zone tracing."""
import io, math
import numpy as np
from PIL import Image, ImageFilter

ZONES = {
    "life":  (0.18, 0.45, 0.48, 0.92),
    "head":  (0.20, 0.42, 0.82, 0.60),
    "heart": (0.18, 0.24, 0.84, 0.42),
    "fate":  (0.42, 0.20, 0.60, 0.90),
}

def load_gray(data: bytes, maxw=640):
    im = Image.open(io.BytesIO(data)).convert("RGB")
    if im.width > maxw:
        im = im.resize((maxw, int(im.height * maxw / im.width)))
    arr = np.asarray(im).astype(np.float32)
    gray = (arr[:, :, 0] * .299 + arr[:, :, 1] * .587 + arr[:, :, 2] * .114) / 255.0
    return gray, im.size

def crease_map(gray):
    gx = np.zeros_like(gray); gy = np.zeros_like(gray)
    gx[:, 1:-1] = gray[:, 2:] - gray[:, :-2]
    gy[1:-1, :] = gray[2:, :] - gray[:-2, :]
    mag = np.abs(gx) + np.abs(gy)
    blur = np.array(Image.fromarray((gray * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255.0
    depth = np.clip(blur - gray, 0, 1)  # dark crease vs local light surround
    return mag, depth

def trace_zone(gray, mag, depth, zone):
    H, W = gray.shape
    x0, y0, x1, y1 = int(zone[0]*W), int(zone[1]*H), int(zone[2]*W), int(zone[3]*H)
    step = 2
    segs, cur, gaps = [], 0, 0
    depth_sum, n = 0.0, 0
    longest = 0
    for x in range(x0, x1, step):
        col_m = mag[y0:y1, x]; col_d = depth[y0:y1, x]
        if col_m.size == 0:
            continue
        m = float(np.percentile(col_m, 92)); d = float(np.percentile(col_d, 92))
        depth_sum += d; n += 1
        if m > 0.10 and d > 0.015:
            cur += 1; gaps = 0
        else:
            gaps += 1
            if gaps > 3:
                if cur >= 5:
                    segs.append(cur); longest = max(longest, cur)
                cur = 0
    if cur >= 5:
        segs.append(cur); longest = max(longest, cur)
    span = max(1, (x1 - x0) / step)
    cont = min(1.0, (longest / span) * 1.6)
    clar = min(1.0, (depth_sum / max(1, n)) * 12)
    whole = 1.0 if len(segs) <= 1 else (0.65 if len(segs) == 2 else 0.35)
    score = max(0.04, min(1.0, cont * .6 + clar * .25 + whole * .15))
    return {"score": round(float(score), 3), "segments": len(segs),
            "longestPct": round(float(longest / span * 100), 1),
            "clarityPct": round(float(depth_sum / max(1, n) * 100), 1)}

def analyze(data: bytes):
    gray, size = load_gray(data)
    mag, depth = crease_map(gray)
    lines = {k: trace_zone(gray, mag, depth, z) for k, z in ZONES.items()}
    return {"size": size, "lines": lines}
