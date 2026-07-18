#!/usr/bin/env python3
"""
apply_proposed_rule_tracked.py — post-process the COPY of the ER playbook to
insert REAL tracked changes reflecting the proposed-rule impact matrix. The
original .docx is never opened. All edits are genuine tracked insertions/
deletions (not margin notes).

Edit classes:
  WHOLE-SECTION REMOVE  : every run in the section wrapped as tracked deletion.
  PARA REPLACE          : an existing paragraph's runs are tracked-deleted and a
                          tracked-inserted replacement paragraph follows (used
                          for prose rewrites and citation renumbers).
  PARA DELETE           : an existing paragraph fully tracked-deleted (obsolete
                          sentence citing a removed concept).

Paragraphs are single-run clean text (verified), matched by a distinctive
substring. Citation mapping is verbatim-verified against the proposed rule
(2026-13687): (b)(3)/(b)(4) -> 51.75(b); bare (b) -> 51.45 or 51.75(b) by
context; (b)(1)/(b)(2) -> REMOVED (no successor), so those sentences are
tracked-deleted per user instruction.
"""
import re, zipfile, shutil, os
try:
    from proposed_cfr_text import PROPOSED, LABEL_SUFFIX
except Exception:
    PROPOSED, LABEL_SUFFIX = {}, ""

AUTHOR = "Proposed Rule (RIN 3150-AL38)"
DATE = "2026-07-17T00:00:00Z"
DOCX = "/Users/partha/Library/CloudStorage/OneDrive-AaloAtomics/Documents/Aalo/2026.07.17_ER/ER_Guidance_Document_ProposedRule_TrackedChanges.docx"

# Whole-section tracked deletions: (heading prefix, outline level)
REMOVE_SECTIONS = [
    ("C.1.4  Need for Power", 3),
    ("C.3.4  Guidance: Alternative Energy Sources", 3),
    ("C.5.5  Category 2 Issues", 3),
    ("APPENDIX F", 1),
]

# Full-paragraph tracked deletions (obsolete: cite removed concepts).
# Matched by distinctive substring.
DELETE_PARAS = [
    "If included, the economic-cost comparison of alternative energy sources",
    "If deferred, does the ER state the election and cite 10 CFR 51.50(b)(2)",
    "Benefit-cost balance (optional for an ESP): Under 10 CFR 51.50(b)(2)",
    "If the applicant elects to include it, the benefit-cost balance",
    "Because 10 CFR 51.50(b)(2) lets an ESP applicant defer",
    # --- C.3 per-type alternatives content (removed; alternatives = no-action only) ---
    # C.3.2 acceptance-item blocks for energy / alt-sites / system-design (keep 9.1 no-action):
    "Acceptance items, ESRP 9.2 (Energy Alternatives):",
    "Does the ER list each energy alternative carried forward",
    "Does the ER assign each energy alternative",
    "Governing authorities (NUREG-1555 ESRP 9.2):",
    "Acceptance items, ESRP 9.2.3 (Assessment of Alternative Energy Sources",
    "Does the ER compare the alternative energy sources on impact",
    "If included, does the ER tabulate the economic cost of each alternative energy source",
    "Governing authorities (NUREG-1555 ESRP 9.2.3):",
    "Acceptance items, ESRP 9.3 (Alternative Sites):",
    "Does the ER state the alternative-site screening criteria",
    "Does the ER state, yes or no, whether any alternative site is obviously superior",
    "Governing authorities (NUREG-1555 ESRP 9.3):",
    "Acceptance items, ESRP 9.4 (System Design Alternatives):",
    "Does the ER state, for each heat-dissipation and intake/discharge alternative",
    "Does the ER cite the NPDES conditions applicable to each cooling alternative",
    "Governing authorities (NUREG-1555 ESRP 9.4):",
    # C.3.3 guidance per-type bullets (energy, system-design; alt-sites already replaced):
    "Energy alternatives: alternative generating technologies and combinations",
    "System design alternatives: principally alternative heat-dissipation",
    # C.3.3 Include-list per-type bullets:
    "The alternative-site screening criteria and result for each candidate",
    "The system-design (heat-dissipation and intake/discharge) comparison with the NPDES",
    "Alternative sites: the candidate sites that pass the screening test",
    # C.3.5 data rows for removed types:
    "Candidate-site screening criteria and results;",
    "Cooling-system alternatives and their water-use/impact profiles.",
    # Appendix I non-resource rows (removed from ESP scope under the proposed rule):
    "Purpose and Need (GEIS 1.3.3.2.3; Category 2)",
    "Need for Power (GEIS 1.3.3.2.3; Category 2)",
    "Site Alternatives (GEIS 1.3.3.2.3; Category 2)",
    "Energy Alternatives (GEIS 1.3.3.2.3; Category 2)",
    "System Design Alternatives (GEIS 1.3.3.2.3; Category 2)",
]

# Prose replacements: (match_substring, new_full_paragraph_text).
# The matched paragraph is tracked-deleted; the new text is tracked-inserted.
REPLACE_PARAS = [
    # A.3 — EIS-basis sentence -> effects-based test
    ("Issuance of an early site permit is one of the actions that 10 CFR 51.20(b) lists",
     "Under the proposed revision to 10 CFR Part 51, 10 CFR 51.20 determines the "
     "appropriate level of NEPA review by an effects-based test rather than a fixed "
     "list: the NRC prepares a categorical exclusion, an environmental assessment, "
     "or an environmental impact statement according to whether the action is likely "
     "to have reasonably foreseeable significant effects. Issuance of an early site "
     "permit is no longer on a mandatory-EIS list (only a uranium enrichment facility "
     "retains a statutory EIS mandate), so an ESP may be supported by an environmental "
     "assessment, or a categorical exclusion under 10 CFR 51.22, where the plant and "
     "site are bounded and no new and significant information exists; the tiered "
     "Category 1 / Category 2 framework in this playbook otherwise follows from the "
     "NR GEIS."),
    # A.1 — the 51.50(b) ER-filing sentence -> 51.45 + 51.75(b)
    ("Under 10 CFR 51.50(b), the ER must be filed as a separate document",
     "Under 10 CFR 51.45, the ER must be filed as a separate document titled "
     "“Applicant’s Environmental Report, Early Site Permit Stage” and must "
     "contain the information specified in 10 CFR 51.45 and, for the early site permit "
     "stage, the matters addressed in 10 CFR 51.75(b) (including 10 CFR 51.51, Table "
     "S-3, and 10 CFR 51.52, Table S-4)."),
    # B.2 — the "need not include (51.50(b)(2))" deferral paragraph -> removed-concept statement
    ("Items the ESP ER need not include (10 CFR 51.50(b)(2)):",
     "Under the proposed revision to 10 CFR Part 51, the alternatives analysis is "
     "limited to the no-action alternative, and the benefit-cost, need-for-power, and "
     "energy-alternatives-cost analyses are no longer within the ESP ER scope; the "
     "prior deferral election under former 10 CFR 51.50(b)(2) is therefore obsolete "
     "and no longer applies."),
    # B.8 — the 51.45/51.50(b) content-exemption sentence -> 51.45 only
    ("For a specific content element of 10 CFR 51.45 or 51.50(b) that the applicant contends",
     "For a specific content element of 10 CFR 51.45 that the applicant contends "
     "should not apply to its project, 10 CFR 51.6 provides the pathway. Verbatim: the "
     "Commission “may, upon application of any interested person or upon its own "
     "initiative, grant such exemptions from the requirements of the regulations in "
     "this part as it determines are authorized by law and are otherwise in the public "
     "interest.”"),
    # C.3.3 — alternative-sites bullet: DELETE (no-action bullet 305 is kept; the
    # per-type bullets are removed, so no replacement text is needed here)
    # (handled in DELETE_PARAS)
    # Preparation Workflow step 1 — drop the deferral-election clause
    ("Define the proposed action, purpose, and need (Section C.1). Output: the one-to-two-sentence",
     "Define the proposed action, purpose, and need (Section C.1). Output: the "
     "one-to-two-sentence purpose-and-need statement."),
    # --- Residual Category 2 operative instructions -> no Category 2 under appendix C ---
    ("Analyze the Category 2 impacts for both the construction and operation phases",
     "Under the proposed revision to 10 CFR Part 51, proposed appendix C identifies "
     "no Category 2 issues; the site-specific Category 2 impact analysis previously "
     "performed at this step is no longer required."),
    ("The Category 2 issues requiring site-specific treatment typically include",
     "Under the proposed revision to 10 CFR Part 51, proposed appendix C identifies "
     "no Category 2 issues, so no issues require site-specific Category 2 treatment; "
     "the formerly Category 2 resource issues (surface-water quality, thermal and "
     "cooling-water effects on aquatic biota, ESA-listed species, historic and "
     "cultural resources, climate change, and cumulative impacts) are addressed "
     "generically unless new and significant information exists."),
    ("For a resource governed by a Category 2 issue, provide the quantitative baseline",
     "Under the proposed revision to 10 CFR Part 51, proposed appendix C identifies "
     "no Category 2 issues, so no resource requires a Category 2 quantitative "
     "baseline for a site-specific analysis at this step."),
    ("The site-specific Category 2 analyses and their significance conclusions;",
     "The Category 1 bounding findings and their significance conclusions (proposed "
     "appendix C identifies no Category 2 issues);"),
    ("The significance conclusions for all Category 1 and Category 2 issues;",
     "The significance conclusions for all Category 1 issues (proposed appendix C "
     "identifies no Category 2 issues);"),
    ("Aquatic and terrestrial resource data for Category 2 analyses;",
     "Aquatic and terrestrial resource data for any new-and-significant-information "
     "review (proposed appendix C identifies no Category 2 issues);"),
    ("Category 2 site-specific analyses (the 17 issues)",
     "Category 2 site-specific analyses (none under proposed appendix C)"),
    # B.2 definition bullet still reads as an active requirement -> conditional
    ("Category 2 issues: issues that depend on site-specific factors and therefore require the applicant to perform",
     "Category 2 issues: issues that would depend on site-specific factors and, if "
     "any were designated in the future, would require a project-specific analysis "
     "(under the proposed revision to 10 CFR Part 51, proposed appendix C identifies "
     "no Category 2 issues)."),
    # A.1 purpose bullet still asserting Category 2 work -> reframed
    ("Provides the site-specific analysis needed to resolve the Category 2 issues",
     "Provides any site-specific analysis needed for issues the NR GEIS does not "
     "resolve generically (under the proposed revision to 10 CFR Part 51, proposed "
     "appendix C identifies no Category 2 issues, so this is limited to any new and "
     "significant information)."),
    # B.2 "For Category 2 issues, the ER should:" bold lead-in -> revised lead-in
    ("For Category 2 issues, the ER should:",
     "Under the proposed revision to 10 CFR Part 51, proposed appendix C identifies "
     "no Category 2 issues; the following Category 2 treatment applies only if a "
     "future issue is designated Category 2:"),
    # Appendix I intro -> proposed-rule note with condensed-table caveat
    ("Transcribed from NR GEIS (NUREG-2249) Table 1-1: all environmental issues",
     "Transcribed from NR GEIS (NUREG-2249) Table 1-1: all environmental issues with "
     "the GEIS section where each is discussed and its category under the current "
     "rule (100 Category 1, 17 Category 2, and 2 electromagnetic-field entries "
     "marked not applicable). NOTE (proposed rule, NRC-2025-0478): the proposed "
     "revision to 10 CFR Part 51 states there would be no Category 2 issues in "
     "appendix C; the non-resource entries below (purpose and need, need for power, "
     "and the alternatives) are removed from ESP scope, and the formerly Category 2 "
     "resource issues would be resolved generically. The individual category tags "
     "below reflect the current rule and are retained for reference; the proposed "
     "appendix C table printed in the Federal Register is a condensed version, so "
     "confirm each issue's proposed category against the final codified table."),
    # C.5.8 non-LWR fuel cycle citation (b)(3) -> 51.75(b) : handled by citation pass below
]

# Simple verified citation renumbers applied to any REMAINING kept paragraph
# text (after the above). (b)(3),(b)(4) -> 51.75(b). Bare (b) handled above by
# replacement; (b)(1)/(b)(2) removed above. Applied as tracked replace on the
# containing paragraph.
CITATION_FIX = [
    ("51.50(b)(3)", "51.75(b)"),
    ("51.50(b)(4)", "51.75(b)"),
]

# Residual bare-51.50(b) citations in KEPT sections that mean "applicant ER
# content" -> 51.45. Matched by distinctive full-paragraph substring so each is
# targeted, not blanket. EXCLUDES the verbatim CFR quote heading (#5) and the
# already-inserted replacement (#3), which must not be touched.
BARE_B_TO_51_45 = [
    "Satisfies the content requirements of 10 CFR 51.45, 51.50(b), and 51.75;",
    "including the ER content requirements of 51.45, the ESP-spe",  # A.2 bullet
    "10 CFR 51.50(b): ESP application content;",
    "10 CFR 51.45(b), 51.50(b);",                       # C.2.2 and C.4.2 (both identical)
    "10 CFR 51.45(b)(1), (b)(2), (c); 51.50(b);",       # C.5.2
    "10 CFR 51.45(b),(d); 51.50(b); 51.75(b)",          # App E
    "10 CFR 51.45(b), 51.50(b); RG 4.7 factors",        # App E
    "10 CFR 51.45(b), 51.50(b)",                        # App E (bare)
    "10 CFR 51.50(b)",                                   # App G row (exact)
]

# Appendix G checklist rows citing removed (b)(1)/(b)(2): tracked-delete.
DELETE_PARAS_EXTRA = [
    "Because the regulator makes the decision on the",   # App G intro row w/ (b)(2)
    # the three bare-citation App G cells:
]
# exact (b)(1)/(b)(2) App G cells handled by CITE_DELETE below

PSTYLE_LEVEL = {"Heading1": 1, "Heading2": 2, "Heading3": 3, "Heading4": 4}


def split_paragraphs(body):
    return re.findall(r'<w:p\b.*?</w:p>|<w:p/>', body)

def level(p):
    m = re.search(r'<w:pStyle w:val="(Heading\d)"/>', p)
    return PSTYLE_LEVEL.get(m.group(1)) if m else None

def text(p):
    return "".join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', p))

def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

def del_wrap(p, rid):
    def repl(m):
        run = m.group(0)
        run2 = (run.replace("<w:t ", "<w:delText ")
                   .replace("<w:t>", "<w:delText>")
                   .replace("</w:t>", "</w:delText>"))
        out = f'<w:del w:id="{rid[0]}" w:author="{AUTHOR}" w:date="{DATE}">{run2}</w:del>'
        rid[0] += 1
        return out
    body = re.sub(r'<w:r\b.*?</w:r>', repl, p)
    # delete the paragraph mark
    tag = f'<w:del w:id="{rid[0]}" w:author="{AUTHOR}" w:date="{DATE}"/>'
    rid[0] += 1
    if '<w:pPr>' in body:
        if re.search(r'<w:pPr>.*?<w:rPr>', body, re.S):
            body = body.replace('<w:rPr>', '<w:rPr>' + tag, 1)
        else:
            body = body.replace('<w:pPr>', '<w:pPr><w:rPr>' + tag + '</w:rPr>', 1)
    else:
        body = body.replace('<w:p>', '<w:p><w:pPr><w:rPr>' + tag + '</w:rPr></w:pPr>', 1)
    return body

def ins_para(new_text, rid, style=None):
    ppr_style = f'<w:pStyle w:val="{style}"/>' if style else ''
    p = (f'<w:p><w:pPr>{ppr_style}<w:rPr>'
         f'<w:ins w:id="{rid[0]}" w:author="{AUTHOR}" w:date="{DATE}"/></w:rPr></w:pPr>'
         f'<w:ins w:id="{rid[0]+1}" w:author="{AUTHOR}" w:date="{DATE}">'
         f'<w:r><w:t xml:space="preserve">{esc(new_text)}</w:t></w:r></w:ins></w:p>')
    rid[0] += 2
    return p

def ppr_of(p):
    """Return the raw <w:pPr>...</w:pPr> of a paragraph, or '' if none."""
    m = re.search(r'<w:pPr>.*?</w:pPr>', p, re.S)
    return m.group(0) if m else ''

def ins_box_para(ppr_xml, run_text, rid, bold=False, size="18"):
    """Insert a tracked paragraph that reuses a captured box <w:pPr> so it
    renders inside the same shaded/bordered box. The paragraph mark and the run
    are both marked as insertions."""
    # inject <w:ins> into the pPr's rPr (mark paragraph-mark inserted)
    tag = f'<w:ins w:id="{rid[0]}" w:author="{AUTHOR}" w:date="{DATE}"/>'
    if '<w:rPr>' in ppr_xml:
        ppr2 = ppr_xml.replace('<w:rPr>', '<w:rPr>' + tag, 1)
    else:
        ppr2 = ppr_xml.replace('</w:pPr>', '<w:rPr>' + tag + '</w:rPr></w:pPr>', 1)
    rpr = '<w:rPr>' + ('<w:b/>' if bold else '') + f'<w:sz w:val="{size}"/></w:rPr>'
    out = (f'<w:p>{ppr2}'
           f'<w:ins w:id="{rid[0]+1}" w:author="{AUTHOR}" w:date="{DATE}">'
           f'<w:r>{rpr}<w:t xml:space="preserve">{esc(run_text)}</w:t></w:r></w:ins></w:p>')
    rid[0] += 2
    return out

def main():
    tmp = os.path.join(os.environ.get("TMPDIR", "/tmp"), "prtc2")
    if os.path.exists(tmp): shutil.rmtree(tmp)
    os.makedirs(tmp)
    with zipfile.ZipFile(DOCX) as z: z.extractall(tmp)
    dpath = os.path.join(tmp, "word", "document.xml")
    x = open(dpath, encoding="utf-8").read()

    m = re.search(r'(<w:body>)(.*)(</w:body>)', x, re.S)
    pre, body, post = x[:m.start(2)], m.group(2), x[m.end(2):]
    ms = re.search(r'(<w:sectPr\b.*?</w:sectPr>)\s*$', body, re.S)
    sectpr = ms.group(1) if ms else ""
    src = body[:ms.start(1)] if ms else body

    paras = split_paragraphs(src)
    rid = [2000]
    log = []

    # 1) whole-section removes
    for prefix, lv in REMOVE_SECTIONS:
        s = None
        for i, p in enumerate(paras):
            if level(p) == lv and text(p).strip().startswith(prefix):
                s = i; break
        if s is None:
            log.append(f"WARN section not found: {prefix}"); continue
        e = len(paras)
        for j in range(s+1, len(paras)):
            lj = level(paras[j])
            if lj is not None and lj <= lv: e = j; break
        for k in range(s, e):
            paras[k] = del_wrap(paras[k], rid)
        log.append(f"REMOVE section {prefix}: {e-s} paras")

    # helper: is a paragraph already fully deleted? (avoid double-processing)
    def is_deleted(p): return '<w:delText' in p and '<w:t ' not in p and '<w:t>' not in p

    # 2) prose replacements (delete old para, insert new after it)
    for match, new in REPLACE_PARAS:
        for i, p in enumerate(paras):
            if is_deleted(p): continue
            if match in text(p):
                sty = re.search(r'<w:pStyle w:val="(\w+)"/>', p)
                paras[i] = del_wrap(p, rid) + ins_para(new, rid, sty.group(1) if sty else None)
                log.append(f"REPLACE: {match[:40]}...")
                break
        else:
            log.append(f"WARN replace target not found: {match[:40]}")

    # 3) full-paragraph deletes
    for match in DELETE_PARAS:
        for i, p in enumerate(paras):
            if is_deleted(p): continue
            if match in text(p):
                paras[i] = del_wrap(p, rid)
                log.append(f"DELETE para: {match[:40]}...")
                break
        else:
            log.append(f"WARN delete target not found: {match[:40]}")

    # 4) citation renumbers on remaining kept paras ((b)(3)/(b)(4) -> 51.75(b))
    for old, new in CITATION_FIX:
        for i, p in enumerate(paras):
            if is_deleted(p): continue
            t = text(p)
            if old in t:
                sty = re.search(r'<w:pStyle w:val="(\w+)"/>', p)
                paras[i] = del_wrap(p, rid) + ins_para(t.replace(old, new), rid,
                                                       sty.group(1) if sty else None)
                log.append(f"CITATION {old}->{new} in para")

    # 5) Appendix G checklist cells citing removed (b)(1)/(b)(2): tracked-delete
    #    FIRST (before the bare-(b) substring replace, so exact cells aren't
    #    partially rewritten).
    for i, p in enumerate(paras):
        if is_deleted(p): continue
        t = text(p).strip()
        if t in ("10 CFR 51.50(b)(1)", "10 CFR 51.50(b)(2)"):
            paras[i] = del_wrap(p, rid)
            log.append(f"DELETE App G cell: {t}")
        elif "Because the regulator makes the decision on the" in t and "51.50(b)(2)" in t:
            sty = re.search(r'<w:pStyle w:val="(\w+)"/>', p)
            paras[i] = del_wrap(p, rid) + ins_para(
                "Every element the ESP ER must contain, drawn from 10 CFR Part 51, "
                "NUREG-1555, RG 4.2, and the NR GEIS.", rid,
                sty.group(1) if sty else None)
            log.append("MODIFY App G intro (drop (b)(2) clause)")

    # 6) residual bare 51.50(b) -> 51.45 (ER content), targeted by substring.
    #    Skip the verbatim CFR quote heading and any already-deleted para.
    for match in BARE_B_TO_51_45:
        for i, p in enumerate(paras):
            if is_deleted(p): continue
            t = text(p)
            if "verbatim; 10 CFR Part 51" in t:   # never edit a verbatim CFR quote
                continue
            if match in t and "51.50(b)" in t:
                sty = re.search(r'<w:pStyle w:val="(\w+)"/>', p)
                paras[i] = del_wrap(p, rid) + ins_para(
                    t.replace("51.50(b)", "51.45"), rid, sty.group(1) if sty else None)
                log.append(f"BARE (b)->51.45: {match[:34]}")
                # no break: fix ALL paragraphs with this identical text

    # 7) Rewrite verbatim CFR boxes to proposed-rule text (delete current-law
    #    label + boxed body; insert proposed label + body reusing box styling).
    box_labels = {
        "51.45": "§ 51.45 Environmental report.",
        "51.50b": "§ 51.50(b) Early site permit stage.",
        "51.51": "§ 51.51 Uranium fuel cycle environmental data",
    }
    for key, label_start in box_labels.items():
        prop = PROPOSED.get(key)
        if not prop:
            continue
        # find label paragraph
        li = None
        for i, p in enumerate(paras):
            if is_deleted(p):
                continue
            if text(p).strip().startswith(label_start):
                li = i
                break
        if li is None:
            log.append(f"WARN box label not found: {label_start}")
            continue
        # boxed body = following consecutive paragraphs that carry pBdr/shd
        bi = li + 1
        box_ppr = ""
        while bi < len(paras) and ("pBdr" in paras[bi] or "<w:shd" in paras[bi]):
            if not box_ppr:
                box_ppr = ppr_of(paras[bi])
            bi += 1
        # tracked-delete label + body
        for k in range(li, bi):
            paras[k] = del_wrap(paras[k], rid)
        # build inserted replacement: label (plain para) + proposed body (boxed)
        new_label = prop["title"] + LABEL_SUFFIX
        inserted = ins_para(new_label, rid)  # label as normal inserted para
        for chunk in prop["text"].split("||"):
            chunk = chunk.strip()
            if chunk:
                inserted += ins_box_para(box_ppr or "<w:pPr></w:pPr>", chunk, rid)
        paras[bi-1] = paras[bi-1] + inserted
        log.append(f"BOX rewrite {key}: deleted {bi-li} paras, inserted proposed text")

    new_body = "".join(paras) + sectpr
    open(dpath, "w", encoding="utf-8").write(pre + new_body + post)

    tz = DOCX + ".tmp"
    with zipfile.ZipFile(tz, "w", zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(tmp):
            for f in files:
                full = os.path.join(root, f)
                z.write(full, os.path.relpath(full, tmp))
    os.replace(tz, DOCX)
    print("\n".join(log))
    print("Saved:", DOCX)

if __name__ == "__main__":
    main()
