#!/usr/bin/env python3
"""
build_impact_matrix.py — writes the proposed-rule change-impact matrix to .xlsx.

Source: NRC proposed rule "Implementation of NEPA" (Federal Register Vol. 91
No. 128, July 7 2026; RIN 3150-AL38; document 2026-13687), revising 10 CFR
Part 51. Every row is backed by a verbatim quote with section number and PDF
page index, extracted from the source PDF (not from memory). "Change status"
is relative to the current/effective Part 51 the ER playbook is built on.

This is a STANDALONE analysis artifact. The playbook itself remains on the
current effective Part 51; this workbook shows what WOULD change if the
proposed rule is finalized as written.
"""
from xlsx_builder import write_xlsx

HEADER = [
    "#", "Group", "Playbook topic affected",
    "Verbatim quote from proposed rule (with section / PDF page index)",
    "Change status vs. current Part 51",
    "Impact on the ER playbook / action if finalized",
]

# group, topic, quote, status, impact
R = [
 # A. Administrative / deadlines
 ("A. Admin/dates", "Comment period deadline",
  "\"Comments must be submitted electronically ... by 11:59 p.m. eastern time on August 21, 2026.\" (DATES, p.0)",
  "NEW (this rulemaking)",
  "If you want to influence the rule, comment by Aug 21 2026. No playbook edit; awareness only."),
 ("A. Admin/dates", "Effective date",
  "\"The requirements proposed in this rule would take effect 30 days from the date of publication of the final rule.\" (Sec. IV.D, p.11)",
  "NEW",
  "Playbook stays on current Part 51 until a final rule is effective. Re-baseline then."),
 ("A. Admin/dates", "Transition - new applications",
  "\"New applications submitted to the NRC must comply with the requirements within six months from the effective date of the final rule.\" (Sec. IV.D, p.11)",
  "NEW",
  "An ESP filed >6 months after a final rule would follow the new scheme; time the filing vs. the rule."),
 ("A. Admin/dates", "Transition - grandfathering",
  "\"No environmental report ... and no EA, or EIS or finding of no significant impact ... issued prior to the effective date ... need be redone ... solely by reason of the promulgation of these revisions.\" (Sec. IV.D, p.11)",
  "NEW (preserves prior work)",
  "An ER already docketed need not be redone. Reduces risk of building to current rule now."),

 # B. EIS vs EA - core change
 ("B. EIS vs EA", "Fixed EIS list eliminated",
  "\"the NRC is proposing to revise 10 CFR part 51 to eliminate the list of specific agency actions requiring the preparation of an EIS in Sec. 51.20 ... except where an EIS is required by statute.\" (Sec. IV.4, p.4)",
  "CHANGES",
  "Foundational: undercuts the playbook's 'ESP always requires an EIS' basis (A.3, B.8). Would need rewrite if finalized."),
 ("B. EIS vs EA", "Review sequence",
  "\"if the NRC cannot apply a categorical exclusion ... the NRC will ... prepare, as appropriate, an environmental assessment or environmental impact statement in accordance with paragraphs (b)(1) or (b)(2) ...\" (Sec. 51.20(b), p.21)",
  "NEW",
  "New CatX -> EA -> EIS ladder. Playbook's fixed-EIS framing becomes one branch of three."),
 ("B. EIS vs EA", "EA trigger",
  "\"The NRC will prepare an environmental assessment ... if the proposed agency action is not likely to have reasonably foreseeable significant effects or the significance of the effects is unknown.\" (Sec. 51.20(b)(1), p.21)",
  "NEW",
  "An ESP with all-SMALL (bounded) impacts could land in EA territory, not EIS."),
 ("B. EIS vs EA", "EIS trigger",
  "\"The NRC will prepare an environmental impact statement ... if the proposed agency action is likely to have reasonably foreseeable significant effects.\" (Sec. 51.20(b)(2), p.21)",
  "NEW",
  "EIS now turns on significant effects, not on being an ESP."),
 ("B. EIS vs EA", "ESP no longer guaranteed an EIS",
  "Only statutory mandate retained: \"(d) Issuance of a license for a uranium enrichment facility requires preparation of an [EIS] pursuant to Atomic Energy Act Sec. 193(a)(1).\" ESP not listed. (Sec. 51.20(d), p.21)",
  "CHANGES (ESP could get an EA)",
  "Directly reverses the current-law answer captured in A.3/B.8. Biggest single impact."),
 ("B. EIS vs EA", "Preamble confirms ESP-EA is intended",
  "removing the old list \"would eliminate the need for exemptions to allow the preparation of an EA where an EIS is currently required ... The exception is ... a uranium enrichment facility.\" (Sec. IV.4, p.4)",
  "CHANGES",
  "Confirms the exemption pathway B.8 describes would become unnecessary for the EIS/EA choice."),
 ("B. EIS vs EA", "New reactor categorical exclusion (may avoid EA/EIS)",
  "\"Actions under part 50, part 52, or part 53 ... early site permit ... normally do not significantly affect ... provided that the facility and site ... are bounded by ... Table C-1 of appendix C ... and no new and significant information ... for any ... Category 1 ... in NUREG-2249.\" (Sec. 51.22(i), p.23)",
  "NEW (CatX for ESP)",
  "If fully bounded with no new-and-significant info, an ESP could be categorically excluded - even leaner than an EA."),
 ("B. EIS vs EA", "SMALL = FONSI / CatX bridge",
  "\"a SMALL conclusion ... means that there is no significant impact ... actions that fall within the bounds of those generic analyses would meet the criteria for a categorical exclusion, or the basis for a finding of no significant impact if the NRC prepares an EA.\" (Sec. IV.10, p.9)",
  "NEW (interpretive)",
  "Ties the playbook's SMALL/MODERATE/LARGE framework directly to CatX/FONSI eligibility."),

 # C. Table naming / GEIS tiering
 ("C. Tables/GEIS", "New-reactor table = Table C-1 / appendix C / NUREG-2249",
  "\"Appendix C of Part 51 ... Table C-1 ... Data supporting this table are contained in NUREG-2249, 'Generic Environmental Impact Statement for Licensing of New Nuclear Reactors.'\" (App. C intro + fn.1, pp.38,43)",
  "NEW (codifies NUREG-2249)",
  "Confirms the playbook's Table B-1 references should be to appendix C Table C-1 for new reactors. Verify naming in playbook appendix B."),
 ("C. Tables/GEIS", "Renewal table B-1 is separate",
  "\"Appendix B ... Table B-1 summarizes the Commission's findings on ... renewing the operating license ...\"; CatX Sec. 51.22(j) keys to \"Table B-1 of appendix B ... NUREG-1437, Revision 2.\" (App. B p.36; Sec. 51.22(j) p.23)",
  "PRESERVES (distinct from C-1)",
  "Do NOT conflate: renewal uses B-1/NUREG-1437; new reactors use C-1/NUREG-2249. Check playbook doesn't cross them."),
 ("C. Tables/GEIS", "Table C-1 has PPE/SPE column",
  "column header \"Plant parameter envelope/site parameter envelope values and assumptions\"; fn.2 \"provided that the applicant's proposed reactor facility and site meet or are bounded by relevant values and assumptions in the PPE and SPE.\" (Table C-1, pp.39-43)",
  "NEW",
  "The PPE/SPE bounding method the playbook teaches is now codified in the appendix C table. Reinforces the approach."),
 ("C. Tables/GEIS", "No Category 2 issues in appendix C currently",
  "\"there would no longer be any Category 2 issues in Appendix C. Nonetheless, the NRC proposes to retain references to Category 2 issues in Appendix C ... to account for the possibility that future updates may identify Category 2 issues.\" (Sec. IV.10, p.9)",
  "CHANGES (significant)",
  "The playbook's 17 Category 2 issues may collapse to zero under appendix C - the site-specific-analysis burden would shrink dramatically. Re-check the Cat-2 list."),
 ("C. Tables/GEIS", "TRISO / advanced fuel in C-1",
  "\"A maximum peak rod burnup of 80 [GWd]/MTU for UO2 fuel and peak pellet burnup of 133 GWd/MTU for TRi-structural ISOtropic (TRISO) fuel.\" (Table C-1, p.43)",
  "NEW",
  "Advanced-reactor fuel forms explicitly bounded - supports the technology-inclusive posture for a non-LWR ESP."),

 # D. ESP-stage tiering (51.75)
 ("D. ESP 51.75", "ESP-stage provision consolidated into 51.75(b)",
  "\"Early site permit stage. If an environmental document is required under Sec. 51.20 ... the environmental document must meet the requirements of this paragraph.\" (Sec. 51.75(b), p.31)",
  "CHANGES (51.50/51.75 consolidated)",
  "Playbook citations to 51.50(b) for ESP content would move to 51.75(b). Update citations if finalized."),
 ("D. ESP 51.75", "ESP evaluates bounded reactor only to ER extent",
  "\"an evaluation of the environmental effects of construction and operation of a reactor ... which have design characteristics that fall within the site characteristics and design parameters ... but only to the extent addressed in the early site permit environmental report.\" (Sec. 51.75(b), p.31)",
  "PRESERVES (PPE approach)",
  "The PPE-bounded ESP approach the playbook uses survives intact."),
 ("D. ESP 51.75", "Non-LWR fuel-cycle basis (no Table S-3 mandate)",
  "\"For other than light-water-cooled nuclear power reactors, the environmental document will address the basis for evaluating the contribution of the environmental effects of fuel cycle activities ...\" (Sec. 51.75(b), p.31)",
  "PRESERVES/CHANGES",
  "Matches playbook C.5.8 non-LWR handling: a reactor-specific fuel-cycle basis, not Table S-3. Good alignment."),
 ("D. ESP 51.75", "Tiering = supplement to NUREG-2249",
  "\"if the applicant's environmental report relied upon the findings of one or more of the issues identified as Category 1 issues in appendix C ... the environmental document must be prepared as a supplement to NUREG-2249.\" (Sec. 51.75(d), p.32)",
  "NEW (codifies tiering)",
  "Confirms the tiering mechanism the playbook assumes; now explicit in rule text."),
 ("D. ESP 51.75", "Applicant analyzes only unmet-Cat-1 + Cat-2",
  "\"an analysis for those issues identified as Category 1 for which the applicant could not demonstrate that the applicable values and assumptions were met or for which any new and significant information was identified ... and for any issues identified as Category 2.\" (Sec. 51.75(d), p.32)",
  "NEW",
  "Exactly the right-sizing logic in the playbook's C.5.4 Category 1 proof. Reinforces it."),
 ("D. ESP 51.75", "No alternatives for met Category 1 issues",
  "\"No such consideration [of alternatives] is required for Category 1 issues in appendix C ... that meet the applicable values and assumptions.\" (Sec. 51.75(d), p.32)",
  "NEW",
  "Further narrows alternatives - consistent with the alternatives-narrowing in item 31."),
 ("D. ESP 51.75", "New-and-significant-info process required",
  "\"The supplemental environmental document will describe the process used to identify new and significant information regarding the ... Category 1 issues ... for which the applicant relied on the findings.\" (Sec. 51.75(d), p.32)",
  "NEW/PRESERVES",
  "Matches playbook B.4 new-and-significant test. Aligned."),
 ("D. ESP 51.75", "Decision integrates NUREG-2249 findings",
  "\"the final decision ... must integrate: (i) The conclusions in NUREG-2249 for issues designated as Category 1 ... (ii) Information developed for those Category 1 issues for which the applicant could not demonstrate ... and those Category 2 issues.\" (Sec. 51.75(e), p.32)",
  "NEW",
  "Codifies how the staff uses the ER; no direct applicant action."),
 ("D. ESP 51.75", "COL referencing ESP may omit resolved matters",
  "\"The environmental document need not address information or analyses contained in the environmental report the applicant submitted ... for the early site permit stage or resolved in the ... early site permit environmental document.\" (Sec. 51.75(c)(1), p.31)",
  "PRESERVES",
  "ESP work carries forward to the COL - preserves the value of a lean, well-scoped ESP ER."),

 # E. ER content (51.45)
 ("E. ER content 51.45", "ER still required unless CatX",
  "\"each applicant ... must submit with its application ... a separate document entitled 'Applicant's ... Environmental Report.'\" (Sec. 51.45(a), p.25)",
  "PRESERVES",
  "The ER remains the core deliverable. Playbook stays relevant."),
 ("E. ER content 51.45", "New: CatX justification in lieu of ER",
  "\"Applicants ... who believe that a categorical exclusion applies ... must include ... a justification for the application of a categorical exclusion ... the rationale and bases ... including any supporting analyses.\" (Sec. 51.45(b), p.25)",
  "NEW",
  "If the ESP qualifies for the new CatX (item 11), the applicant files a CatX justification instead of a full ER - the leanest path. Consider adding as an option."),
 ("E. ER content 51.45", "ER must support EA or EIS",
  "\"An environmental report ... must contain environmental information necessary for the NRC to prepare an environmental assessment ... or an environmental impact statement.\" (Sec. 51.45(a)(2), p.25)",
  "CHANGES (now EA-capable)",
  "The ER may now feed an EA. Playbook's EIS-only framing broadens."),
 ("E. ER content 51.45", "ER content narrowed by 'effects' definition",
  "\"information regarding environmental considerations ... in Sec. 51.45 would be removed ... or ... no longer required consistent with the definition of 'effects' in Sec. 51.4 (e.g., impacts of preconstruction activities or other impacts without a reasonable nexus to radiological health and safety ...).\" (Sec. IV.8, p.7)",
  "CHANGES",
  "Preconstruction-activity impacts and non-radiological-nexus items may drop out - further right-sizing. Re-scope C.4/C.5 if finalized."),
 ("E. ER content 51.45", "Alternatives narrowed to no-action only",
  "\"the reasonable range of alternatives ... would be defined as and limited to the no-action alternative ... the NRC would not consider alternatives ... it does not have the authority to implement (e.g., facility siting and other technology or energy alternatives).\" (Sec. IV.3, p.4)",
  "CHANGES (major)",
  "Would gut playbook C.3: no energy-alternatives, no alternative-sites, no obviously-superior-site test. Alternatives shrink to no-action. Large scope reduction."),
 ("E. ER content 51.45", "Quantify factors (retained)",
  "\"The analyses for environmental reports ... for ... early site permits ... must, to the fullest extent practicable, quantify the various factors considered.\" (Sec. 51.45(f), p.26)",
  "PRESERVES",
  "The playbook's objective/quantified-item discipline still applies."),
 ("E. ER content 51.45", "Adverse information (retained)",
  "\"The information submitted ... should not be confined to information supporting the proposed agency action ... but should also include adverse information.\" (Sec. 51.45(h), p.26)",
  "PRESERVES",
  "Playbook C.8.5 adverse-information section stays valid."),

 # F. Need for power
 ("F. Need for power", "No standalone need-for-power provision for ESP",
  "The term \"need for power\" does not appear in the reviewed text. Only manufacturing-license ER \"need not address ... the benefits and impacts of utilizing the reactor in a nuclear power plant, or an evaluation of alternative energy sources.\" (Sec. 51.45(d), p.26)",
  "CHANGES (indirect / inference)",
  "With alternatives limited to no-action (item 31), the traditional need-for-power / benefit-cost role largely disappears. INFERENCE, not a direct quote - verify against final rule."),

 # G. Table S-3 / S-4
 ("G. Fuel cycle S-3/S-4", "Table S-3 LWR-only",
  "\"Every environmental report ... for the ... early site permit stage ... of a light-water-cooled nuclear power reactor, must take Table S-3 ... as the basis.\" (Sec. 51.51(a), p.27)",
  "PRESERVES (LWR-only)",
  "Confirms a non-LWR ESP is not bound to Table S-3 - matches playbook C.5.8."),
 ("G. Fuel cycle S-3/S-4", "Table S-3 '1979' caveat removed",
  "\"The proposed Sec. 51.51 would also remove the caveat that only environmental reports submitted 'on or after September 4, 1979' must use Table S-3.\" (Sec. IV.10, p.9)",
  "CHANGES",
  "Minor; affects only the historical caveat text, not the ESP substance."),
 ("G. Fuel cycle S-3/S-4", "Table S-4 transport LWR-stage scope",
  "\"An applicant-prepared draft environmental document ... of a light-water-cooled nuclear power reactor ... must contain a statement concerning transportation of fuel and radioactive wastes ... Sec. 51.52(a) ... or ... Sec. 51.52(b).\" (Sec. 51.46(d), p.27)",
  "PRESERVES",
  "Table S-4 stays LWR-scoped; non-LWR provides a reactor-specific transport basis (playbook C.5.8)."),
 ("G. Fuel cycle S-3/S-4", "Codified tables retained",
  "\"retain codified environmental impact conclusions ... Sec. 51.51 ... Table S-3 ... Sec. 51.52 ... Table S-4 ... appendix B ... and appendix C ... 'Environmental Effect of Issuing a Permit or License for a New Nuclear Reactor.'\" (Sec. IV.10, p.8)",
  "PRESERVES",
  "The codified-table structure the playbook relies on remains."),

 # H. Continued storage
 ("H. Continued storage", "NUREG-2157 deemed incorporated",
  "\"If the impacts of continued storage of spent fuel are relevant ... the impact determinations in NUREG-2157 ... shall be deemed incorporated into the environmental documents.\" (Sec. 51.23(b), p.24)",
  "PRESERVES",
  "Continued-storage impacts remain generically resolved; ER cites NUREG-2157."),
 ("H. Continued storage", "EA reliance on NUREG-2157",
  "\"For the purposes of an environment assessment that relies on the impact determinations in NUREG-2157, a SMALL impact determination means that the impacts are not significant.\" (Sec. 51.23(b), p.24)",
  "NEW",
  "Ties SMALL to non-significant for the EA path; consistent with item 12."),

 # I. Other structural
 ("I. Other structural", "Applicant may prepare draft environmental document",
  "\"In lieu of the environmental report ... in accordance with NEPA section 107(f), the NRC may ... authorize an applicant-hired ... contractor to prepare a draft environmental document.\" (Sec. 51.46(a), p.26)",
  "NEW",
  "A new option: applicant/contractor drafts the environmental document itself. Could change who writes what - strategic choice."),
 ("I. Other structural", "ER content sections consolidated",
  "\"combine ... the environmental report requirements in Sec.Sec. 51.49, 51.50, and 51.53 ... The resulting new regulations would be housed under Sec.Sec. 51.75, 51.76, and 51.95.\" (Sec. IV.9, p.8)",
  "CHANGES",
  "All playbook citations to 51.49/51.50/51.53 would need renumbering to 51.75/51.76/51.95."),
 ("I. Other structural", "NEPA deadlines codified (2 yr EIS / 1 yr EA)",
  "\"the NRC must publish EAs no later than one year, and EISs no later than two years, after ... when the NRC determines that NEPA requires the preparation ... or the date the NRC issues a notice of intent.\" (Sec. IV.7, p.6; Sec. 51.15)",
  "NEW",
  "Schedule certainty; supports planning the ER submittal and consultations timeline."),
 ("I. Other structural", "Draft EIS + public comment discontinued",
  "\"the NRC would discontinue preparation and publication of draft EISs ... including the routine solicitation of public comments on draft EISs under Sec. 51.73.\" (Sec. IV.9, p.7)",
  "CHANGES",
  "Process change on the staff side; affects the playbook's description of the review process (B.1)."),
 ("I. Other structural", "EIS/EA length limits",
  "\"Environmental impact statements will be analytic, concise, and no longer than necessary ...\" (Sec. 51.71(d), p.31); EAs \"must not exceed 75 pages\" (Sec. 51.30(e), p.24)",
  "NEW",
  "Reinforces the right-sizing ethos; a leaner ER feeds a leaner staff document."),
]

ROWS = [[str(i + 1), g, topic, quote, status, impact]
        for i, (g, topic, quote, status, impact) in enumerate(R)]

# ---------------------------------------------------------------------------
# Sheet 2: per-playbook-section STAYS / CHANGES / GOES verdict.
# Verdict legend:
#   STAYS   = section survives substantially intact under the proposed rule.
#   CHANGES = section survives but its basis, citations, or scope shifts.
#   GOES    = section (or most of its content) would fall out of scope / no
#             longer be required.
# Each verdict cites the driving impact row(s) above (by #) so it is traceable.
# ---------------------------------------------------------------------------
S_HEADER = ["Playbook section", "Verdict", "Driving proposed-rule provision(s)",
            "Why", "Impact-matrix row(s)"]

S = [
 ("A.1 Purpose of This Guidance", "STAYS",
  "n/a", "Purpose statement is framework-neutral; still describes ESP ER preparation.", "-"),
 ("A.1.1 Right-Sizing the ER", "STAYS",
  "Sec. 51.20 CatX/EA ladder; Sec. 51.45(b)",
  "Right-sizing is reinforced: the rule adds even leaner paths (EA, CatX justification).", "11,28,30"),
 ("A.2 Regulatory Framework", "CHANGES",
  "Sec. 51.20 rewrite; section renumbering",
  "Citations to the fixed-EIS Sec. 51.20 and to 51.49/51.50/51.53 must be updated.", "5,42"),
 ("A.3 Relationship to NR GEIS (why EIS)", "CHANGES",
  "Sec. 51.20(b)-(d); Sec. IV.4",
  "The 'ESP requires an EIS' basis is removed; becomes effects-based (EA/EIS/CatX).", "5,9,10"),
 ("A.4 Document Organization", "STAYS",
  "n/a", "Structural overview; unaffected by substance changes.", "-"),

 ("B.1 Tiered Review Process", "CHANGES",
  "Sec. 51.75(d) supplement-to-NUREG-2249; Sec. IV.9 (no draft EIS)",
  "Tiering is preserved and codified, but the staff process changes (draft EIS discontinued).", "21,44"),
 ("B.2 Category 1 and Category 2 Issues", "CHANGES",
  "Sec. IV.10 (no Cat 2 in appendix C); Sec. 51.75(d)",
  "Framework stays, but appendix C currently has NO Category 2 issues - Cat-2 workload may vanish.", "16,22"),
 ("B.3 PPE/SPE Bounding Demonstration", "STAYS",
  "Table C-1 PPE/SPE column; Sec. 51.75(b)",
  "Bounding method is now codified in appendix C Table C-1. Fully preserved.", "15,19"),
 ("B.4 New and Significant Information", "STAYS",
  "Sec. 51.75(d) N&S process",
  "The new-and-significant test is explicitly required in the proposed rule.", "24"),
 ("B.5 Coordination with Other Requirements", "STAYS",
  "n/a (consultations statutory)",
  "NHPA/ESA consultations are statutory and independent of this rule.", "-"),
 ("B.6 Maximizing Owner-Controlled Documents", "STAYS",
  "Sec. 51.45(f),(h) retained",
  "Owner-controlled allocation is a document-strategy choice, not rule-dependent.", "32,33"),
 ("B.7 Summary-Report Tier", "STAYS",
  "n/a", "Internal document model; unaffected.", "-"),
 ("B.8 Exemptions", "CHANGES",
  "Sec. IV.4 (EA no longer needs exemption)",
  "The EIS->EA exemption rationale disappears (EA becomes available directly); Sec. 52.7/50.12 pathway note still valid for technical exemptions.", "9,10"),

 ("C.1 Introduction, Purpose, and Need", "CHANGES",
  "Sec. IV.3 (alternatives->no-action); Sec. 51.45(d)",
  "Purpose/need survives; the optional need-for-power framing weakens as energy alternatives leave scope.", "31,34"),
 ("C.2 Proposed Action: Site and Plant", "STAYS",
  "Sec. 51.75(b); Table C-1",
  "PPE/SPE plant+site description is preserved and codified.", "15,19"),
 ("C.3 Alternatives to the Proposed Action", "GOES (mostly)",
  "Sec. IV.3; Sec. 51.75(d)",
  "Alternatives narrowed to no-action only: energy alternatives, alternative-sites, and the obviously-superior-site test fall out of scope.", "23,31"),
 ("C.4 Affected Environment", "CHANGES",
  "Sec. IV.8 ('effects' definition narrows content)",
  "Baseline stays, but preconstruction-activity and non-radiological-nexus items may drop; re-scope.", "30"),
 ("C.5 Environmental Consequences", "CHANGES",
  "Sec. IV.10 (no Cat 2); Sec. 51.75(d); Sec. IV.8",
  "Category 1 bounding preserved; Category 2 site-specific analyses may largely disappear; content narrowed by 'effects'.", "16,22,30"),
 ("C.5.8 Uranium Fuel Cycle & Transportation", "STAYS",
  "Sec. 51.51(a) LWR-only; Sec. 51.75(b) non-LWR basis",
  "Non-LWR reactor-specific fuel-cycle basis (not Table S-3) is exactly what the rule provides.", "20,35,37"),
 ("C.6 Cumulative Effects", "STAYS",
  "n/a (cumulative remains an effects analysis)",
  "Cumulative effects remain part of the environmental analysis; no removal found.", "-"),
 ("C.7 Environmental Monitoring", "STAYS",
  "n/a (Sec. 50.36b conditions retained)",
  "Monitoring conditions for the ESP are unaffected by the reviewed changes.", "-"),
 ("C.8 Summary and Conclusions", "CHANGES",
  "Sec. IV.3 (no benefit-cost via alternatives); Sec. 51.45(h) retained",
  "Findings summary and adverse-info stay; the benefit-cost balance weakens with alternatives narrowing.", "31,33,34"),
 ("C.9 References and Supporting Information", "STAYS",
  "n/a", "Reference discipline is unaffected.", "-"),

 ("Appendix A: Laws/Authorizations", "STAYS",
  "Sec. 51.45(g); p25-26 (consultations not relieved)",
  "Federal-permit/consultation matrix is required by statute and expressly retained; but NRC seeks comment (p11) on whether narrowed 'effects' affects NHPA Sec. 106 - open question.", "-"),
 ("Appendix B: PPE/SPE (Table)", "CHANGES",
  "Table C-1 of appendix C; NUREG-2249",
  "Confirm the appendix and table naming align to 'Table C-1 / appendix C' for new reactors (not B-1).", "13,14,15"),
 ("Appendix C: GHG Methodology", "STAYS",
  "n/a", "GHG estimation method is not altered by the reviewed provisions.", "-"),
 ("Appendix D: Severe-Accident Framework", "STAYS",
  "n/a", "Severe-accident framework unaffected by the reviewed provisions.", "-"),
 ("Appendix E: NUREG-1555 Cross-Reference", "CHANGES",
  "Sec. IV.10 (Cat 2 -> possibly none)",
  "ESRP crosswalk stays useful, but the Category 2 rows it maps may no longer exist under appendix C.", "16"),
 ("Appendix F: Category 2 Issues", "GOES (possibly)",
  "Sec. IV.10 ('no longer any Category 2 issues in Appendix C')",
  "This appendix lists the 17 Category 2 issues; if appendix C has none, this appendix may become empty/placeholder.", "16"),
 ("Appendix G: Master Checklist", "CHANGES",
  "Multiple (renumbering; EA/CatX; alternatives)",
  "Checklist items tied to EIS, alternatives, and Cat-2 need revision to match the new scheme.", "5,16,31,42"),
 ("Appendix H: Summary-Report Model", "STAYS",
  "n/a", "Document-layer model is rule-independent.", "-"),
 ("Appendix I: NR GEIS Issue List (Table 1-1)", "CHANGES",
  "Table C-1 / appendix C; NUREG-2249",
  "The issue list stays authoritative, but its Category 1/2 split should be reconciled to appendix C (all Cat 1).", "13,16"),
]

SHEET2_ROWS = [list(row) for row in S]

# ---------------------------------------------------------------------------
# Sheet 3: actionable worklist - ONLY the affected sections (CHANGES/GOES),
# what you would do to each IF the proposed rule is finalized as written.
# NOT a do-now list: the playbook stays on current effective Part 51 until a
# final rule is effective. Action types:
#   REMOVE   = delete the section/content (out of scope under the new rule).
#   TRIM     = delete part of the section; keep the rest.
#   REVISE   = keep the section; change its basis, wording, or scope.
#   RENUMBER = citation/section-number update only.
# Ordered REMOVE/TRIM first (biggest deletions), then REVISE, then RENUMBER.
# ---------------------------------------------------------------------------
W_HEADER = ["Order", "Action", "Playbook location", "What to do",
            "Driving proposed-rule provision", "Detail row(s)"]

W = [
 ("REMOVE", "C.3 Alternatives - energy alternatives (C.3.3 energy bullet, C.3.4)",
  "Delete the energy-alternatives evaluation and the alternative-energy cost comparison; the NRC would not consider technology/energy alternatives.",
  "Sec. IV.3 (alternatives limited to no-action); Sec. 51.75(d)", "23,31"),
 ("REMOVE", "C.3 Alternatives - alternative sites & obviously-superior test (C.3.3 sites bullet)",
  "Delete the alternative-site screening and the 'obviously superior site' determination; siting alternatives are out of NRC authority scope.",
  "Sec. IV.3", "31"),
 ("REMOVE", "C.3 Alternatives - system-design alternatives (C.3.3 system bullet)",
  "Delete the heat-dissipation/cooling-system alternatives comparison unless retained for another basis.",
  "Sec. IV.3", "31"),
 ("REMOVE", "Appendix F - Category 2 issue list",
  "Remove or convert to a placeholder: appendix C would have no Category 2 issues, so the 17-issue list has nothing to populate it.",
  "Sec. IV.10 ('no longer any Category 2 issues in Appendix C')", "16"),
 ("REMOVE", "C.5.5 Category 2 site-specific analysis (within C.5)",
  "Remove or shrink to a conditional stub: with no Category 2 issues in appendix C, the site-specific-analysis path largely disappears.",
  "Sec. IV.10; Sec. 51.75(d)", "16,22"),
 ("TRIM", "C.1 Need for Power (C.1.4)",
  "Delete or downgrade the optional need-for-power framework; energy alternatives (its basis) leave scope.",
  "Sec. IV.3; Sec. 51.45(d)", "31,34"),
 ("TRIM", "C.4 Affected Environment (C.4.3 baseline scope)",
  "Remove preconstruction-activity impacts and any baseline item without a reasonable nexus to radiological health/safety, per the narrowed 'effects' definition.",
  "Sec. IV.8 (definition of 'effects' in Sec. 51.4)", "30"),
 ("TRIM", "C.8 Summary - benefit-cost balance (C.8.3)",
  "Delete or downgrade the benefit-cost balance; with alternatives narrowed, the balancing role largely disappears. (Adverse-info C.8.5 stays.)",
  "Sec. IV.3; Sec. 51.45(h) retained", "31,33,34"),

 ("REVISE", "A.3 Relationship to NR GEIS - the 'why EIS' basis",
  "Replace the 'ESP requires an EIS' statement with the effects-based test: CatX -> EA -> EIS; only uranium enrichment keeps a statutory EIS.",
  "Sec. 51.20(b)-(d); Sec. IV.4", "5,7,8,9,10"),
 ("REVISE", "B.8 Exemptions",
  "Remove the 'EIS-not-exemptible / EA needs an exemption' framing (EA becomes directly available). Keep the technical-exemption pathway (Sec. 52.7/50.12) note.",
  "Sec. IV.4", "9,10"),
 ("REVISE", "B.1 Tiered Review Process",
  "Update the staff-process description: NRC would discontinue draft EIS and its public comment; add supplement-to-NUREG-2249 mechanism.",
  "Sec. IV.9; Sec. 51.75(d)", "21,44"),
 ("REVISE", "B.2 Category 1 / Category 2 Issues",
  "Note that appendix C currently has no Category 2 issues; keep the framework but flag Cat-2 as latent/future.",
  "Sec. IV.10; Sec. 51.75(d)", "16,22"),
 ("REVISE", "A.1.1 Right-Sizing the ER",
  "Add the two new leaner paths: an EA-supporting ER, and a categorical-exclusion justification in lieu of a full ER.",
  "Sec. 51.20 CatX/EA; Sec. 51.45(b)", "11,28,30"),
 ("REVISE", "C.5 Environmental Consequences",
  "Keep Category 1 bounding; remove/condition Category 2; narrow content per 'effects' definition; tie SMALL to FONSI/CatX eligibility.",
  "Sec. IV.10; Sec. IV.8; Sec. 51.20(b); Sec. IV.10 (SMALL=no significant impact)", "12,16,22,30"),
 ("REVISE", "Appendix E - NUREG-1555 Cross-Reference",
  "Flag that mapped Category 2 rows may no longer exist under appendix C; keep for Category 1 acceptance-basis use.",
  "Sec. IV.10", "16"),
 ("REVISE", "Appendix G - Master Checklist",
  "Rework checklist items tied to EIS-mandate, alternatives, and Category 2; add EA/CatX-path items.",
  "Sec. 51.20; Sec. IV.3; Sec. IV.10; renumbering", "5,16,31,42"),
 ("REVISE", "Appendix I - NR GEIS Issue List",
  "Reconcile the Category 1/2 split to appendix C (all Category 1 currently); keep as the authoritative issue list.",
  "Table C-1 / appendix C; Sec. IV.10", "13,16"),
 ("REVISE", "Appendix B - PPE/SPE table naming",
  "Confirm/relabel to 'Table C-1 of appendix C' for new reactors (not Table B-1, which is license renewal).",
  "App. C intro; Sec. 51.22(i)", "13,14,15"),

 ("RENUMBER", "A.2 Regulatory Framework + all ESP citations",
  "Update citations: Sec. 51.20 (new title), and Sec.Sec. 51.49/51.50/51.53 -> Sec.Sec. 51.75/51.76/51.95; ESP content now under Sec. 51.75(b).",
  "Sec. IV.9 consolidation; Sec. 51.75", "18,42"),
]

SHEET3_ROWS = [[str(i + 1)] + list(row) for i, row in enumerate(W)]

# ---------------------------------------------------------------------------
# Sheet 4: RESULTING ER SCOPE after removing everything affected by the
# proposed rule. This is the "after" picture, spreadsheet-only. The Word
# playbook is NOT modified. Disposition:
#   KEPT          = section remains in the ER scope unchanged.
#   REMOVED       = section (or its content) is dropped from the ER scope.
#   KEPT (REVISED)= section remains but with reduced/updated content.
# "Remaining ER content" states what the ER still contains for that section
# after the removal.
# ---------------------------------------------------------------------------
E_HEADER = ["Playbook section", "Disposition in slimmed ER",
            "Remaining ER content after removal", "Driving provision"]

E = [
 ("A.1 Purpose of This Guidance", "KEPT", "Full section retained.", "-"),
 ("A.1.1 Right-Sizing the ER", "KEPT (REVISED)",
  "Retained; add the EA-supporting-ER and categorical-exclusion-justification paths.", "Sec. 51.20; Sec. 51.45(b)"),
 ("A.2 Regulatory Framework", "KEPT (REVISED)",
  "Retained; citations updated (Sec. 51.20 new title; 51.49/51.50/51.53 -> 51.75/51.76/51.95).", "Sec. IV.9"),
 ("A.3 Relationship to NR GEIS", "KEPT (REVISED)",
  "Retained; the 'ESP requires an EIS' basis replaced by the effects-based CatX/EA/EIS test.", "Sec. 51.20(b)-(d)"),
 ("A.4 Document Organization", "KEPT", "Retained (updated to reflect removed sections).", "-"),

 ("B.1 Tiered Review Process", "KEPT (REVISED)",
  "Retained; describe supplement-to-NUREG-2249 tiering; drop draft-EIS/public-comment step.", "Sec. 51.75(d); Sec. IV.9"),
 ("B.2 Category 1 / Category 2 Issues", "KEPT (REVISED)",
  "Retained; note appendix C currently has no Category 2 issues (framework kept as latent).", "Sec. IV.10"),
 ("B.3 PPE/SPE Bounding Demonstration", "KEPT", "Full section retained (now codified in Table C-1).", "Table C-1"),
 ("B.4 New and Significant Information", "KEPT", "Full section retained (explicitly required).", "Sec. 51.75(d)"),
 ("B.5 Coordination with Other Requirements", "KEPT", "Full section retained.", "-"),
 ("B.6 Maximizing Owner-Controlled Documents", "KEPT", "Full section retained.", "-"),
 ("B.7 Summary-Report Tier", "KEPT", "Full section retained.", "-"),
 ("B.8 Exemptions", "KEPT (REVISED)",
  "Retained; remove the EIS-not-exemptible / EA-needs-exemption framing; keep the technical-exemption (Sec. 52.7/50.12) note.", "Sec. IV.4"),

 ("C.1 Introduction, Purpose, and Need", "KEPT (REVISED)",
  "Introduction/purpose kept; C.1.4 Need for Power REMOVED.", "Sec. IV.3; Sec. 51.45(d)"),
 ("C.1.4 Need for Power", "REMOVED",
  "Dropped from ER scope (energy alternatives, its basis, leave scope).", "Sec. IV.3"),
 ("C.2 Proposed Action: Site and Plant", "KEPT", "Full section retained (PPE/SPE plant+site description).", "Sec. 51.75(b)"),
 ("C.3 Alternatives - energy alternatives", "REMOVED",
  "Dropped from ER scope.", "Sec. IV.3"),
 ("C.3 Alternatives - alternative sites & obviously-superior test", "REMOVED",
  "Dropped from ER scope.", "Sec. IV.3"),
 ("C.3 Alternatives - system-design (cooling) alternatives", "REMOVED",
  "Dropped from ER scope.", "Sec. IV.3"),
 ("C.3 Alternatives - no-action alternative", "KEPT",
  "The no-action alternative is the ONLY alternative retained in the ER.", "Sec. IV.3"),
 ("C.4 Affected Environment", "KEPT (REVISED)",
  "Baseline kept; remove preconstruction-activity and non-radiological-nexus items per narrowed 'effects'.", "Sec. IV.8"),
 ("C.5 Environmental Consequences", "KEPT (REVISED)",
  "Category 1 bounding, GHG (C.5.6), accidents (C.5.7), and fuel cycle (C.5.8) all kept; only C.5.5 Category 2 removed (below).", "Sec. 51.75(d)"),
 ("C.5.5 Category 2 site-specific analysis", "REMOVED",
  "Dropped/conditional: appendix C has no Category 2 issues to analyze.", "Sec. IV.10"),
 ("C.6 Cumulative Effects", "KEPT", "Retained.", "-"),
 ("C.7 Environmental Monitoring", "KEPT", "Retained.", "-"),
 ("C.8 Summary and Conclusions", "KEPT (REVISED)",
  "Findings summary and adverse info kept; C.8.3 benefit-cost balance REMOVED (below).", "Sec. IV.3"),
 ("C.8.3 Benefit-Cost Balance", "REMOVED",
  "Dropped from ER scope (alternatives narrowing removes the balancing role).", "Sec. IV.3"),
 ("C.9 References and Supporting Information", "KEPT", "Retained.", "-"),

 ("Appendix A: Laws/Authorizations", "KEPT",
  "Retained; Sec. 51.45(g) still requires listing all Federal permits/licenses/approvals, and consultations (ESA, NHPA, CWA, CAA) are 'not relieved' (p25-26). CAVEAT: NRC seeks comment (p11) on whether narrowing 'effects' affects NHPA Sec. 106 consultations - status KEPT but under open question.", "-"),
 ("Appendix B: PPE/SPE Table", "KEPT (REVISED)",
  "Retained; relabel to 'Table C-1 of appendix C' for new reactors.", "App. C"),
 ("Appendix C: GHG Methodology", "KEPT", "Retained.", "-"),
 ("Appendix D: Severe-Accident Framework", "KEPT", "Retained.", "-"),
 ("Appendix E: NUREG-1555 Cross-Reference", "KEPT (REVISED)",
  "Retained for Category 1 use; flag that mapped Category 2 rows may no longer exist.", "Sec. IV.10"),
 ("Appendix F: Category 2 Issues", "REMOVED",
  "Dropped/placeholder: appendix C has no Category 2 issues to list.", "Sec. IV.10"),
 ("Appendix G: Master Checklist", "KEPT (REVISED)",
  "Retained; remove EIS-mandate/alternatives/Category-2 checklist items; add EA/CatX items.", "Sec. 51.20; Sec. IV.3; Sec. IV.10"),
 ("Appendix H: Summary-Report Model", "KEPT", "Retained.", "-"),
 ("Appendix I: NR GEIS Issue List", "KEPT (REVISED)",
  "Retained; reconcile Category 1/2 split to appendix C (all Category 1).", "App. C; Sec. IV.10"),
]

SHEET4_ROWS = [list(row) for row in E]

# ---------------------------------------------------------------------------
# Sheet 0 (leads): SECTIONS TO REMOVE - the "go do" removal list. Every item
# that would be dropped from the ER scope under the proposed rule, listed at
# its own subsection line (nothing rolled up under a parent). Spreadsheet-only;
# the Word playbook is not modified.
# ---------------------------------------------------------------------------
G_HEADER = ["Order", "Playbook section to remove", "What is removed",
            "Driving proposed-rule provision", "Detail row(s)"]

G = [
 ("C.1.4 Need for Power (Optional for an ESP)",
  "The entire optional need-for-power assessment framework.",
  "Sec. IV.3 (alternatives limited to no-action); Sec. 51.45(d)", "31,34"),
 ("C.3.3 Guidance - energy-alternatives evaluation",
  "The energy/technology alternatives comparison within the screening-and-evaluation guidance.",
  "Sec. IV.3", "23,31"),
 ("C.3.3 Guidance - alternative sites & obviously-superior-site determination",
  "The alternative-site screening and the obviously-superior-site determination.",
  "Sec. IV.3", "31"),
 ("C.3.3 Guidance - system-design (cooling) alternatives",
  "The heat-dissipation / intake-discharge alternatives comparison.",
  "Sec. IV.3", "31"),
 ("C.3.4 Guidance: Alternative Energy Sources and Cost",
  "The entire optional alternative-energy cost-comparison subsection.",
  "Sec. IV.3", "31"),
 ("C.5.5 Category 2 Issues: Site-Specific Analysis",
  "The Category 2 site-specific analysis path (appendix C has no Category 2 issues).",
  "Sec. IV.10; Sec. 51.75(d)", "16,22"),
 ("C.8.3 Guidance - benefit-cost balance",
  "The benefit-cost balance within the summary guidance (adverse-info C.8.5 stays).",
  "Sec. IV.3", "31,33,34"),
 ("Appendix F: Category 2 Issues",
  "The entire appendix listing the 17 Category 2 issues (nothing left to list).",
  "Sec. IV.10 ('no longer any Category 2 issues in Appendix C')", "16"),
]

SHEET0_ROWS = [[str(i + 1)] + list(row) for i, row in enumerate(G)]

# ---------------------------------------------------------------------------
# MASTER sheet (leads): every playbook section and every affected subsection in
# one place, with a single Disposition column: REMOVE / MODIFY / KEEP.
#   REMOVE = dropped from ER scope under the proposed rule.
#   MODIFY = kept, but revised / trimmed / renumbered.
#   KEEP   = unchanged.
# Subsections are listed only where they carry a different disposition than
# their parent chapter (that is where a partial REMOVE/MODIFY happens).
# Spreadsheet-only; the Word playbook is not modified.
# ---------------------------------------------------------------------------
M_HEADER = ["Playbook section", "Disposition", "What happens / what to do",
            "Driving proposed-rule provision", "Detail rows", "Go to detail"]

M = [
 ("A.1 Purpose of This Guidance", "KEEP", "Unchanged.", "-", "-"),
 ("A.1.1 Right-Sizing the ER", "MODIFY",
  "Add the EA-supporting-ER and categorical-exclusion-justification paths.", "Sec. 51.20; Sec. 51.45(b)", "11,28,30"),
 ("A.2 Regulatory Framework", "MODIFY",
  "Renumber citations (Sec. 51.20 new title; 51.49/51.50/51.53 -> 51.75/51.76/51.95).", "Sec. IV.9", "18,42"),
 ("A.3 Relationship to NR GEIS", "MODIFY",
  "Replace the 'ESP requires an EIS' basis with the effects-based CatX/EA/EIS test.", "Sec. 51.20(b)-(d); Sec. IV.4", "5,9,10"),
 ("A.4 Document Organization", "KEEP", "Unchanged (reflect removed sections).", "-", "-"),

 ("B.1 Tiered Review Process", "MODIFY",
  "Describe supplement-to-NUREG-2249 tiering; drop draft-EIS/public-comment step.", "Sec. 51.75(d); Sec. IV.9", "21,44"),
 ("B.2 Category 1 / Category 2 Issues", "MODIFY",
  "Note appendix C currently has no Category 2 issues (framework kept as latent).", "Sec. IV.10", "16,22"),
 ("B.3 PPE/SPE Bounding Demonstration", "KEEP", "Unchanged (now codified in Table C-1).", "Table C-1", "15"),
 ("B.4 New and Significant Information", "KEEP", "Unchanged (explicitly required).", "Sec. 51.75(d)", "24"),
 ("B.5 Coordination with Other Requirements", "KEEP", "Unchanged.", "-", "-"),
 ("B.6 Maximizing Owner-Controlled Documents", "KEEP", "Unchanged.", "-", "-"),
 ("B.7 Summary-Report Tier", "KEEP", "Unchanged.", "-", "-"),
 ("B.8 Exemptions", "MODIFY",
  "Remove the EIS-not-exemptible / EA-needs-exemption framing; keep the technical-exemption (Sec. 52.7/50.12) note.", "Sec. IV.4", "9,10"),

 ("C.1 Introduction, Purpose, and Need", "MODIFY",
  "Intro/purpose kept; C.1.4 removed (below).", "Sec. IV.3", "31,34"),
 ("C.1.4 Need for Power (Optional for an ESP)", "REMOVE",
  "Delete the optional need-for-power assessment framework.", "Sec. IV.3; Sec. 51.45(d)", "31,34"),
 ("C.2 Proposed Action: Site and Plant", "KEEP", "Unchanged (PPE/SPE plant+site description).", "Sec. 51.75(b)", "19"),
 ("C.3 Alternatives to the Proposed Action", "MODIFY",
  "Chapter kept only for the no-action alternative; all other alternatives removed (below).", "Sec. IV.3", "23,31"),
 ("C.3.3 Guidance - energy alternatives", "REMOVE",
  "Delete the energy/technology alternatives comparison.", "Sec. IV.3", "23,31"),
 ("C.3.3 Guidance - alternative sites & obviously-superior test", "REMOVE",
  "Delete alternative-site screening and the obviously-superior-site determination.", "Sec. IV.3", "31"),
 ("C.3.3 Guidance - system-design (cooling) alternatives", "REMOVE",
  "Delete the heat-dissipation/cooling alternatives comparison.", "Sec. IV.3", "31"),
 ("C.3.4 Alternative Energy Sources and Cost", "REMOVE",
  "Delete the entire optional alternative-energy cost-comparison subsection.", "Sec. IV.3", "31"),
 ("C.4 Affected Environment", "MODIFY",
  "Remove preconstruction-activity and non-radiological-nexus baseline items per narrowed 'effects'.", "Sec. IV.8", "30"),
 ("C.5 Environmental Consequences", "MODIFY",
  "Category 1 bounding, GHG, accidents, fuel cycle all kept; C.5.5 removed (below); content narrowed by 'effects'.", "Sec. IV.10; Sec. IV.8", "16,22,30"),
 ("C.5.5 Category 2 Issues: Site-Specific Analysis", "REMOVE",
  "Delete the Category 2 site-specific analysis path (appendix C has no Category 2 issues).", "Sec. IV.10; Sec. 51.75(d)", "16,22"),
 ("C.6 Cumulative Effects", "KEEP", "Unchanged.", "-", "-"),
 ("C.7 Environmental Monitoring", "KEEP", "Unchanged.", "-", "-"),
 ("C.8 Summary and Conclusions", "MODIFY",
  "Findings summary and adverse info kept; C.8.3 benefit-cost removed (below).", "Sec. IV.3", "31,33,34"),
 ("C.8.3 Guidance - benefit-cost balance", "REMOVE",
  "Delete the benefit-cost balance (adverse-info C.8.5 stays).", "Sec. IV.3", "31,34"),
 ("C.9 References and Supporting Information", "KEEP", "Unchanged.", "-", "-"),

 ("Appendix A: Laws/Authorizations", "KEEP",
  "Kept; Sec. 51.45(g) still requires the permit list, consultations 'not relieved'. Open question (p11): whether narrowed 'effects' affects NHPA Sec. 106.", "Sec. 51.45(g)", "-"),
 ("Appendix B: PPE/SPE Table", "MODIFY",
  "Relabel to 'Table C-1 of appendix C' for new reactors (not Table B-1).", "App. C; Sec. 51.22(i)", "13,14,15"),
 ("Appendix C: GHG Methodology", "KEEP", "Unchanged.", "-", "-"),
 ("Appendix D: Severe-Accident Framework", "KEEP", "Unchanged.", "-", "-"),
 ("Appendix E: NUREG-1555 Cross-Reference", "MODIFY",
  "Keep for Category 1 use; flag that mapped Category 2 rows may no longer exist.", "Sec. IV.10", "16"),
 ("Appendix F: Category 2 Issues", "REMOVE",
  "Delete the entire appendix (appendix C has no Category 2 issues to list).", "Sec. IV.10", "16"),
 ("Appendix G: Master Checklist", "MODIFY",
  "Remove EIS-mandate/alternatives/Category-2 items; add EA/CatX items; renumber.", "Sec. 51.20; Sec. IV.3; Sec. IV.10", "5,16,31,42"),
 ("Appendix H: Summary-Report Model", "KEEP", "Unchanged.", "-", "-"),
 ("Appendix I: NR GEIS Issue List", "MODIFY",
  "Reconcile Category 1/2 split to appendix C (all Category 1 currently).", "App. C; Sec. IV.10", "13,16"),
]

MASTER_ROWS = [list(row) for row in M]

DETAIL_SHEET = "Full impact detail"
MASTER_SHEET = "MASTER - all sections"

# Fix for the multi-value-cell bug: a cell can hold only ONE hyperlink, so we
# never link a cell that lists several detail rows. Instead:
#   col 5 "Detail rows"   = plain text, the full "31, 34" reference list (no link)
#   col 6 "Go to detail"  = a single link to the PRIMARY (first) detail row only
# Add the "Go to detail" display value to each master row and link only col 6.
master_links = []
for i, row in enumerate(MASTER_ROWS, start=1):  # i = 1-based data row
    ref = row[4]
    if ref and ref != "-":
        first = ref.split(",")[0].strip()
        if first.isdigit():
            tgt_ws_row = int(first) + 1  # detail item #k sits at worksheet row k+1
            row.append(f"open #{first}")  # col 6 display
            master_links.append({
                "row": i, "col": 6,
                "location": f"'{DETAIL_SHEET}'!A{tgt_ws_row}",
                "display": f"open #{first}",
            })
        else:
            row.append("")
    else:
        row.append("")

# Detail tab: one "Go to" column, one link per row back to MASTER (single value,
# so no ambiguity).
DETAIL_HEADER = HEADER + ["Go to"]
DETAIL_ROWS = [r + ["MASTER"] for r in ROWS]
detail_link_col = len(DETAIL_HEADER)
detail_links = [
    {"row": i, "col": detail_link_col,
     "location": f"'{MASTER_SHEET}'!A1", "display": "MASTER"}
    for i in range(1, len(DETAIL_ROWS) + 1)
]

# ---------------------------------------------------------------------------
# CROSSWALK tab: one row per (section -> single detail reference) pair. A
# section that cites 4 detail rows becomes 4 crosswalk rows, each with ONE
# clickable link to that exact detail row. No multi-value cells anywhere, so
# every detail reference is individually reachable. This is the click-through
# map that fixes the "multiple values in one cell" problem.
# ---------------------------------------------------------------------------
CROSSWALK_SHEET = "Crosswalk (section <-> detail)"
X_HEADER = ["Playbook section", "Disposition", "Detail #",
            "Detail topic", "Go to detail"]

# index detail rows by their # (col 0) for topic lookup
detail_by_num = {r[0]: r for r in ROWS}  # r[0]=#, r[2]=topic

X_ROWS = []
x_links = []
for m in M:
    section, disp, _what, _prov, ref = m
    if not ref or ref == "-":
        continue
    for token in [t.strip() for t in ref.split(",") if t.strip()]:
        if not token.isdigit():
            continue
        d = detail_by_num.get(token)
        topic = d[2] if d else ""
        X_ROWS.append([section, disp, f"#{token}", topic, f"open #{token}"])
        tgt_ws_row = int(token) + 1
        x_links.append({
            "row": len(X_ROWS), "col": 5,
            "location": f"'{DETAIL_SHEET}'!A{tgt_ws_row}",
            "display": f"open #{token}",
        })

OUT = "/Users/partha/Library/CloudStorage/OneDrive-AaloAtomics/Documents/Aalo/2026.07.17_ER/ER_Playbook_Proposed_Rule_Impact_Matrix.xlsx"

from xlsx_builder import write_xlsx_multi
write_xlsx_multi(OUT, [
    {"name": MASTER_SHEET, "header": M_HEADER, "rows": MASTER_ROWS,
     "col_widths": [50, 14, 64, 40, 12, 12], "links": master_links},
    {"name": CROSSWALK_SHEET, "header": X_HEADER, "rows": X_ROWS,
     "col_widths": [50, 14, 9, 30, 12], "links": x_links},
    {"name": DETAIL_SHEET, "header": DETAIL_HEADER, "rows": DETAIL_ROWS,
     "col_widths": [4, 18, 30, 70, 24, 55, 10], "links": detail_links},
])
print("Saved:", OUT)
print("Master rows:", len(MASTER_ROWS), "| master->detail links:", len(master_links))
print("Crosswalk rows:", len(X_ROWS), "| crosswalk->detail links:", len(x_links))
print("Detail rows:", len(DETAIL_ROWS), "| detail->master links:", len(detail_links))
from collections import Counter
print("Disposition tally:", dict(Counter(m[1] for m in M)))
