#!/usr/bin/env python3
"""
verify_guidance_coverage.py — standing item-level coverage check for the ER playbook.

WHY THIS EXISTS
Earlier reconciliations checked whether each acceptance item's concept appeared
*somewhere in its C-chapter*. That altitude was too coarse: it counted partial
matches as covered (e.g., ESRP 2.2.2 asks for corridor "length and acreage to be
disturbed" but the guidance only stated "land-use category and acreage" — a
different quantity). This script checks, per item, whether the item's SPECIFIC
requirement appears in the guidance PROSE of the subsection that embeds it.

WHAT IT DOES
1. Renders ER_Guidance_Document.docx to text (via textutil).
2. For each acceptance item in tools/esrp_binary.json, finds the C-chapter that
   embeds its ESRP section, strips that chapter's acceptance-item bullets /
   authority lines / acceptance-basis notes to leave GUIDANCE PROSE, and probes
   for the item's distinctive phrase.
3. Prints items whose phrase is absent from their chapter's guidance prose.

IMPORTANT — this is a CANDIDATE flagger, not a pass/fail gate. Exact-phrase
probing yields false positives wherever the guidance uses a synonym. A flagged
item means "a human should confirm the guidance covers this," NOT "this is
broken." The last full run resolved 22 flags to 1 genuine gap. Treat output as a
worklist to eyeball, and update PROBE below when you rephrase guidance.

USAGE
    python3 tools/verify_guidance_coverage.py
Run after any edit to the guidance prose or the acceptance items.
"""
import json, re, subprocess, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Output was relocated out of the repo; keep verification pointed at the shipped file.
DOCX = "/Users/partha/Library/CloudStorage/OneDrive-AaloAtomics/Documents/Aalo/2026.07.17_ER/ER_Guidance_Document.docx"
BIN  = os.path.join(ROOT, "tools", "esrp_binary.json")

# ESRP section -> C-chapter (mirror of the embed_esrp() calls in generate_er_guidance.py)
CMAP = {
    "1.1": "C.1", "1.2": "C.1",
    "2.1": "C.2", "2.2.1": "C.2", "2.2.2": "C.2", "2.2.3": "C.2", "3.1": "C.2", "3.2": "C.2",
    "9.1": "C.3", "9.2": "C.3", "9.2.3": "C.3", "9.3": "C.3", "9.4": "C.3",
    "2.3.1": "C.4", "2.3.2": "C.4", "2.3.3": "C.4", "2.4.1": "C.4", "2.4.2": "C.4",
    "2.5.1": "C.4", "2.5.2": "C.4", "2.5.3": "C.4", "2.6": "C.4", "2.7": "C.4", "2.8": "C.4",
    "4.6": "C.5", "5.3": "C.5",
    "7.1": "C.6", "7.2": "C.6", "7.3": "C.6",
    "6.1": "C.7",
    "10.1": "C.8", "10.2": "C.8", "10.3": "C.8", "10.4": "C.8",
}

# Distinctive phrase per item. A phrase found in the chapter's guidance prose =
# covered. Keep phrases short and content-bearing. When guidance is rephrased,
# update the matching entry here. Order matters: first hit wins.
PROBE = [
    "length and acreage of each transmission-line corridor", "site map showing the property boundary",
    "publicly available", "public-involvement", "compliance or consultation status",
    "federal permit", "current land-use category", "percent by category for the region",
    "design-basis flood elevation", "sole-source aquifer", "consumptive water-use rate",
    "water-use permit", "water-quality classification", "npdes", "within its npdes effluent limit",
    "acreage of each terrestrial habitat", "federally listed terrestrial", "esa section 7",
    "aquatic species present", "magnuson", "low-population-zone", "population-center distance",
    "employment", "public-service, and infrastructure", "historic property", "section 106",
    "physiographic province", "capable tectonic", "design-basis ground motion",
    "dispersion factors", "design-basis severe-weather", "air-quality attainment",
    "connected, cumulative, or similar", "cooperating agency", "footprint dimensions",
    "plant-layout drawing", "rated thermal power", "table s-4", "construction workers",
    "occupational limit", "nonaquatic-environment monitoring", "intake flow",
    "thermal discharge is within", "cooling-system", "monitoring program", "permit governing",
    "set the geographic boundary", "cumulative-impact significance level", "cumulative", "sama",
    "no-action", "energy alternative", "screening criteria", "economic cost", "alternative-site",
    "obviously superior", "heat-dissipation", "npdes conditions", "unavoidable adverse",
    "irreversible", "short-term uses", "internal and external costs",
    "applicants who defer should state the election", "51.75(b)", "51.50(b)(2)",
]


def probe(text):
    t = text.lower()
    for kw in PROBE:
        if kw in t:
            return kw
    return None


def chapter_prose(D, cx):
    n = int(cx.split(".")[1])
    nxt = f"C.{n+1}  " if n < 8 else "APPENDIX A"
    m = re.search(re.escape(cx + "  ") + r".*?(?=" + re.escape(nxt) + ")", D, re.S)
    if not m:
        return ""
    keep = [l for l in m.group(0).split("\n")
            if "[Decision basis" not in l and "[Backup" not in l
            and "Governing authorities" not in l and "Acceptance items, ESRP" not in l
            and not l.strip().startswith("Acceptance basis:")]
    return re.sub(r"\s+", " ", " ".join(keep)).lower()


def main():
    if not os.path.exists(DOCX):
        print("ER_Guidance_Document.docx not found — run generate_er_guidance.py first.")
        return 2
    D = subprocess.run(["textutil", "-convert", "txt", "-stdout", DOCX],
                       capture_output=True, text=True).stdout
    b = json.load(open(BIN))
    prose = {}
    flags = []
    total = 0
    for s, v in b.items():
        if s.startswith("_"):
            continue
        cx = CMAP.get(s)
        if cx not in prose:
            prose[cx] = chapter_prose(D, cx)
        for t in v["tests"]:
            total += 1
            p = probe(t)
            if p and p not in prose[cx]:
                flags.append((cx, s, p, t))
    print(f"Checked {total} acceptance items across {len(set(CMAP.values()))} chapters.")
    if not flags:
        print("No coverage candidates flagged — every item's probe phrase is present "
              "in its chapter's guidance prose.")
        return 0
    print(f"\n{len(flags)} item(s) to CONFIRM BY EYE (probe phrase absent from chapter "
          f"guidance prose — may be a real gap OR a synonym the probe missed):\n")
    for cx, s, p, t in flags:
        print(f"  {cx}  ESRP {s}  [probe: {p!r}]")
        print(f"      {t}")
    print("\nReminder: flags are candidates, not failures. Confirm each against the "
          "guidance prose; if covered by a synonym, add that synonym to PROBE.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
