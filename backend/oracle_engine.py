"""AstroGod local AI reasoning engine — chart-aware answers (part 1)."""
import re
LORD = {"Mesha": "Mangal", "Vrishabha": "Shukra", "Mithuna": "Budha",
        "Karka": "Chandra", "Simha": "Surya", "Kanya": "Budha",
        "Tula": "Shukra", "Vrishchika": "Mangal", "Dhanu": "Guru",
        "Makara": "Shani", "Kumbha": "Shani", "Meena": "Guru"}
SIGNS = list(LORD)
YOGI = ["Mangala", "Pingala", "Dhanya", "Bhramari", "Bhadrika",
        "Ulka", "Siddha", "Sankata"]
CAREERS = {"Surya": "administration, government service, leadership, medicine",
           "Chandra": "care of people, hospitality, fluids/trade, healing arts",
           "Mangal": "engineering, defence/police, surgery, property, sport",
           "Budha": "IT, commerce, writing, analytics, accountancy",
           "Guru": "teaching, law, banking, counselling, priesthood",
           "Shukra": "arts, design, cinema, luxury trade, beauty",
           "Shani": "industry, labour management, mining, law, service",
           "Rahu": "foreign work, tech, media, unconventional startups",
           "Ketu": "research, occult sciences, healing, spiritual work"}
def _parse(ctx):
    out = {"lagna": None, "moon": None, "nak": None, "planets": {}}
    m = re.search(r"Lagna\s+(\w+)", ctx or "")
    if m and m.group(1) in LORD:
        out["lagna"] = m.group(1)
    m = re.search(r"Moon\s+(\w+)", ctx or "")
    if m and m.group(1) in LORD:
        out["moon"] = m.group(1)
    m = re.search(r"Nakshatra\s+([\w ]+?)(,|\)|$)", ctx or "")
    if m:
        out["nak"] = m.group(1).strip()
    for pm in re.finditer(r"(Surya|Chandra|Mangal|Budha|Guru|Shukra|Shani|Rahu|Ketu)\s*@\s*(\w+)", ctx or ""):
        if pm.group(2) in LORD:
            out["planets"][pm.group(1)] = pm.group(2)
    return out
def _house(p_sign, lagna):
    if not p_sign or not lagna:
        return None
    return (SIGNS.index(p_sign) - SIGNS.index(lagna)) % 12 + 1

def _nochart(s):
    base = ("Generate your kundali (section 01) first, then ask — with your "
            "chart I read Lagna, Moon, nakshatra, lords and yogas personally. ")
    if any(w in s for w in ("career", "job", "business", "profession")):
        return (base + "Classically (Phaladeepika/Parashara): 10th house, its "
                "lord, kendra planets, Budha/Guru/Shani strength decide "
                "service vs business. Dhanya/Siddha Yogini favour growth.")
    if any(w in s for w in ("marri", "spouse", "wife", "husband", "partner")):
        return (base + "Classically: 7th + lord + Shukra describe the partner; "
                "Mangal in 1/2/4/7/8/12 needs dosha-check with cancellations.")
    if any(w in s for w in ("health", "disease", "roga")):
        return (base + "Goel's method: Lagna, 6th/8th lords, dusthana planets "
                "+ Shashtiamsha (D-60). Educational only — doctors diagnose.")
    return ("Namaste, seeker. I reason from Parashara, Phaladeepika, "
            "Laghu-Parashari, Yogini Dasha and Goel's divisional method. "
            "Generate kundali, then ask: career? marriage? health? wealth?")

def answer(q, ctx=""):
    c = _parse(ctx)
    s = (q or "").lower()
    lag, moon, pl = c["lagna"], c["moon"], c["planets"]
    if not (lag and pl):
        return _nochart(s)
    me = "With %s Lagna" % lag + ("; Moon in %s" % moon if moon else "")
    if any(w in s for w in ("career", "job", "business", "profession", "future")):
        t10 = SIGNS[(SIGNS.index(lag) + 9) % 12]
        lord10 = LORD[t10]
        k10 = [p for p, sg in pl.items() if _house(sg, lag) == 10]
        t = ("%s: 10th house %s, lord %s — suiting %s. " % (me, t10, lord10, CAREERS[lord10]))
        if k10:
            t += "In 10th: " + ", ".join("%s (%s)" % (p, CAREERS[p]) for p in k10) + ". "
        for p in ("Budha", "Guru", "Shani", "Surya"):
            if p in pl:
                t += "%s in %s (house %s). " % (p, pl[p], _house(pl[p], lag))
        return t + "Dhanya/Bhadrika/Siddha Yogini windows favour rise."
    if any(w in s for w in ("marri", "spouse", "wife", "husband", "partner")):
        h7 = SIGNS[(SIGNS.index(lag) + 6) % 12]
        l7 = LORD[h7]
        k7 = [p for p, sg in pl.items() if _house(sg, lag) == 7]
        t = ("%s: 7th %s, lord %s in %s — partner carries %s nature. " % (me, h7, l7, pl.get(l7, "?"), l7))
        ma = pl.get("Mangal")
        if ma and _house(ma, lag) in (1, 2, 4, 7, 8, 12):
            t += "Mangal house %s hints dosha — match charts, check cancellations. " % _house(ma, lag)
        else:
            t += "No Mangal-dosha from Mars. "
        if k7:
            t += "In 7th: " + ", ".join(k7) + ". "
        return t + "Shukra in %s colours romance; Dhanya/Siddha aid marriage." % pl.get("Shukra", "?")
    if any(w in s for w in ("wealth", "rich", "money", "dhan")):
        l2 = LORD[SIGNS[(SIGNS.index(lag) + 1) % 12]]
        l9 = LORD[SIGNS[(SIGNS.index(lag) + 8) % 12]]
        return ("%s: 2nd lord %s in %s; 9th lord %s in %s. Their union forms "
                "Dhana Yoga (Laghu-Parashari). Dhanya/Siddha aid accumulation." % (me, l2, pl.get(l2, "?"), l9, pl.get(l9, "?")))
    if any(w in s for w in ("health", "disease", "roga")):
        h6 = SIGNS[(SIGNS.index(lag) + 5) % 12]
        dusty = ["%s house %s" % (p, _house(sg, lag)) for p, sg in pl.items() if _house(sg, lag) in (6, 8, 12)]
        t = "%s: Lagna lord %s in %s; 6th %s. " % (me, LORD[lag], pl.get(LORD[lag], "?"), h6)
        t += ("Dusthana: " + "; ".join(dusty) + ". ") if dusty else "No major dusthana load. "
        return t + "Goel lens: confirm via Shashtiamsha (D-60). Educational only."
    if any(w in s for w in ("character", "nature", "personality", "mind")):
        return ("%s: outer self %s (%s-ruled); mind %s; nakshatra %s. "
                "Best-placed planets dominate temperament." % (me, lag, LORD[lag], moon or "?", c["nak"] or "?"))
    if any(w in s for w in ("dasha", "period", "yogini", "time", "when")):
        return ("Yogini cycle: " + " > ".join(YOGI) + " (36 yrs). Dhanya/Bhadrika/"
                "Siddha growth; Ulka/Sankata patience. Exact period in 02/03.")
    return ("%s, Moon %s, nakshatra %s: ask career? marriage? wealth? health? "
            "character? dasha? — I read each from houses and lords." % (me, moon or "?", c["nak"] or "?"))
