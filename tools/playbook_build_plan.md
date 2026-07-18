# Standalone ER Playbook — build plan (paused, awaiting 10 CFR Part 51 source)

## Trigger to resume
User provides a readable 10 CFR Part 51 source (§§ 51.45, 51.50, 51.51, 51.52):
a text-layer PDF dropped in the ESP folder, pasted text, or a .txt/.md file.
Then build the WHOLE playbook in one pass (do not build piecemeal — user chose
"wait, then build all at once").

## What the playbook is (decided)
- Transform the CURRENT document (ER_Guidance_Document.docx / generate_er_guidance.py)
  into a standalone one-stop-shop playbook. It does NOT need to be lean itself;
  the lean-ER *advice to the applicant* stays, but the playbook embeds sources.
- Full VERBATIM inline source content.
- Scaffolding: step-by-step preparation WORKFLOW + master CHECKLIST (no timeline, no RACI).

## Build steps (one pass)
1. Embed verbatim 10 CFR 51.45, 51.50(b), 51.51, 51.52 text (from the source the
   user supplies) into a new front section (e.g., "D. Governing Regulatory Text")
   or inline in each C-section's Regulatory Basis.
2. Embed verbatim "II. ACCEPTANCE CRITERIA" block for every ESRP section mapping to
   C.1–C.9 (see mapping below). Extractor is proven:
     swiftc tools/pdfpage.swift -o "$TMPDIR/pdfpage"
     PDF="…/2026.04.02_ESP/sr1555 (1).pdf"
     for p in <pages>; do "$TMPDIR/pdfpage" "$PDF" $p x.png | sed '1d'; done \
       | tr -s ' ' | awk '/II\. ACCEPTANCE CRITERIA/{f=1} /III\. REVIEW PROCEDURES/{f=0} f'
   Section→page index: tools/esrp_section_index.json (134 sections).
3. Add step-by-step preparation workflow (new section, e.g., B.0 or a "How to Use").
4. Add master checklist: every required element (reg + ESRP + Cat-2) with a status column.
5. Retitle document "Environmental Report Playbook …"; update TOC intro/organization.

## C-section → ESRP section mapping (for verbatim criteria embedding)
- C.1 Introduction/Purpose/Need   → ESRP 1.0, 1.1, 1.2 (and 8.x if need-for-power included)
- C.2 Site & Plant                → ESRP 2.1, 2.2/2.2.1/2.2.2/2.2.3, 3.1, 3.2; RG 4.7
- C.3 Alternatives                → ESRP 9.1, 9.2, 9.2.3, 9.3, 9.4
- C.4 Affected Environment        → ESRP 2.3(.1/.2/.3), 2.4(.1/.2), 2.5(.1/.2/.3/.4), 2.6, 2.7, 2.8
- C.5 Environmental Consequences  → ESRP 4.1–4.6 (construction), 5.1–5.11 (operation)
- C.6 Cumulative Effects          → ESRP 7.x
- C.7 Monitoring                  → ESRP 6.1
- C.8 Summary & Conclusions       → ESRP 10.1–10.4 (incl. 10.4.2)
- C.9 References                  → n/a

## Style rules to preserve (audited clean — do not regress)
- Max 1 em dash in the whole doc (the verbatim reg title "Applicant's Environmental
  Report — Early Site Permit Stage"); everywhere else use colon/comma/parens.
- No subjective applicant instructions: every "state/assign/confirm" must terminate
  in a number, a defined level (SMALL/MODERATE/LARGE per C.5.3), or a Table B-1/CFR
  comparison. Verbatim regulatory text is exempt (it is a quote).
- NUREG-1379 conformance (lowercase in-text section/appendix/table refs; capitalize
  Federal/State; Author-Year style; must/should usage).

## Already done (do not redo)
- 10 CFR Part 51 reconciliation (8 gaps fixed).
- NUREG-1555 ESRP structure crosswalk (3 gaps fixed).
- RG 4.2 Rev 3 crosswalk (EMF gap fixed).
- GEIS NUREG-2249: framework confirmed; Appendix F Table F-1 = exact 17 Category 2 issues.

## Tools
tools/pdfpage.swift (text-layer or rasterize), tools/render.swift (force raster),
tools/ocr.swift (Vision OCR), tools/esrp_section_index.json, tools/README.md.
Sandbox write grant for the Swift toolchain is in .claude/settings.local.json.
