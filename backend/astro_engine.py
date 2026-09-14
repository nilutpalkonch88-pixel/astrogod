"""AstroGod Python engine — precise Swiss Ephemeris sidereal charts + Vimshottari."""
import swisseph as swe
from datetime import datetime

swe.set_sid_mode(swe.SIDM_LAHIRI)

PLANETS = [
    ("Surya", "Su", swe.SUN), ("Chandra", "Mo", swe.MOON),
    ("Mangal", "Ma", swe.MARS), ("Budha", "Me", swe.MERCURY),
    ("Guru", "Ju", swe.JUPITER), ("Shukra", "Ve", swe.VENUS),
    ("Shani", "Sa", swe.SATURN),
]
NAK = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu",
"Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra",
"Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha",
"Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"]
NAK_LORD = {"Ashwini":"Ketu","Bharani":"Shukra","Krittika":"Surya","Rohini":"Chandra",
"Mrigashira":"Mangal","Ardra":"Rahu","Punarvasu":"Guru","Pushya":"Shani","Ashlesha":"Budha",
"Magha":"Ketu","Purva Phalguni":"Shukra","Uttara Phalguni":"Surya","Hasta":"Chandra",
"Chitra":"Mangal","Swati":"Rahu","Vishakha":"Guru","Anuradha":"Shani","Jyeshtha":"Budha",
"Mula":"Ketu","Purva Ashadha":"Shukra","Uttara Ashadha":"Surya","Shravana":"Chandra",
"Dhanishta":"Mangal","Shatabhisha":"Rahu","Purva Bhadrapada":"Guru",
"Uttara Bhadrapada":"Shani","Revati":"Budha"}
RASHIS = ["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula",
"Vrishchika","Dhanu","Makara","Kumbha","Meena"]
VIM_SEQ = [("Ketu",7),("Shukra",20),("Surya",6),("Chandra",10),("Mangal",7),
("Rahu",18),("Guru",16),("Shani",19),("Budha",17)]

def compute_chart(date_str, time_str, lat=26.9, lon=75.8):
    dt = datetime.strptime(date_str + " " + time_str, "%Y-%m-%d %H:%M")
    jd = swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60.0)
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    out = []
    for name, ab, pid in PLANETS:
        res = swe.calc_ut(jd, pid, flags)
        lon_ = res[0][0] if isinstance(res[0], (list, tuple)) else res[0]
        out.append({"n": name, "ab": ab, "deg": round(lon_ % 360, 3)})
    rres = swe.calc_ut(jd, swe.MEAN_NODE, flags)
    rahu = (rres[0][0] if isinstance(rres[0], (list, tuple)) else rres[0]) % 360
    out.append({"n": "Rahu", "ab": "Ra", "deg": round(rahu, 3)})
    out.append({"n": "Ketu", "ab": "Ke", "deg": round((rahu + 180) % 360, 3)})
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b'P', flags)
    asc = ascmc[0] % 360
    moon = out[1]["deg"]
    nak_idx = int((moon % 360) / 13.3333333) % 27
    pada = int(((moon % 360) % 13.3333333) / 3.3333333) + 1
    ay = swe.get_ayanamsa_ut(jd)
    return {
        "planets": out, "asc": round(asc, 3),
        "lagna": RASHIS[int(asc / 30) % 12],
        "moonSign": RASHIS[int(moon / 30) % 12],
        "nakshatra": NAK[nak_idx], "nakLord": NAK_LORD[NAK[nak_idx]],
        "pada": pada, "ayanamsa": round(ay, 3), "jd": round(jd, 4),
    }

def vimshottari(moon_deg, birth: datetime, years=60):
    nak_idx = int((moon_deg % 360) / 13.3333333) % 27
    frac = (((moon_deg % 360) % 13.3333333) / 13.3333333)
    start = nak_idx % 9
    seq = [(VIM_SEQ[(start + i) % 9]) for i in range(9)]
    first_left = seq[0][1] * (1 - frac)
    periods, cursor_y = [], birth.year + (birth.month - 1) / 12
    cursor_y += 0  # periods anchored at birth below
    from datetime import timedelta
    cur = birth
    spans = [(seq[0][0], first_left)] + [(n, y) for n, y in seq[1:]]
    # extend cycles to cover `years`
    full = 120.0
    out, cur = [], birth
    cyc = 0
    while (cur - birth).days < years * 365.25:
        for n, y in (spans if cyc == 0 else seq):
            s = cur
            e = datetime(s.year + int(y), s.month, min(s.day, 28))
            # fractional-year add
            e = s + timedelta(days=y * 365.25)
            out.append({"lord": n, "years": round(y, 2),
                        "from": s.strftime("%b %Y"), "to": e.strftime("%b %Y")})
            cur = e
            if (cur - birth).days >= years * 365.25:
                break
        cyc += 1
        spans = seq
    return {"startNak": NAK[nak_idx], "balance": round(first_left, 2), "periods": out[:14]}
