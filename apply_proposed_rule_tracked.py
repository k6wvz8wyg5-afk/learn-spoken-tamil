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
    # --- Category 2 "do" items whose action is eliminated: delete, don't reword ---
    "Analyze the Category 2 impacts for both the construction and operation phases",  # Prep step 6
    "Evaluate alternatives and make the obviously-superior-site determination",       # Prep step 7
    "The Category 2 issues requiring site-specific treatment typically include",       # B.2 sentence
    "For a resource governed by a Category 2 issue, provide the quantitative baseline", # C.4.3 rule
    # --- Full-scan batch: C.8.2 ESRP 10.4 (benefit-cost) acceptance block ---
    "Acceptance items, ESRP 10.4 (Benefit-Cost Balance):",
    "Governing authorities (NUREG-1555 ESRP 10.4):",
    # --- Full-scan batch: Appendix G checklist requirement cells for removed content ---
    "Need for power / need for the project (ESP-optional)",
    "Alternative-sites analysis and obviously-superior determination",
    "Energy and system-design alternatives",
    "Benefit-cost balance (ESP-optional)",
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
    # --- Residual Category 2 operative instructions ---
    # (Prep-Workflow step 6, B.2 "typically include", and C.4.3 rule are now
    #  whole-item DELETIONS in DELETE_PARAS, not rewords — a "do" list/rule should
    #  not carry dead commentary.)
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
    # C.4.4 Include-list bullet: drop the "...C.5.5 analysis...Category 2 resource" half
    ("The specific values the C.4.3 rule identifies: the site's SPE-parameter value and its Table B-1 comparison for a Category 1 resource, or the quantitative baseline",
     "The specific values the C.4.3 rule identifies: the site's SPE-parameter value "
     "and its Table B-1 comparison for a Category 1 resource; and"),
    # Appendix G row-13 section pointer -> clear the deleted C.5.5/App F reference
    ("C.5.5, App. F",
     "(none under proposed appendix C)"),
    # === Full-scan batch: dangling refs to deleted sections + removed-work interfaces ===
    ("NUREG-1555 ESRP 8.4: assessment of need for power (see C.1.4).",
     "NUREG-1555 ESRP 1.3: purpose of and need for the proposed action."),
    ("If a need-for-power assessment is included under C.1.4, its conclusion.",
     "The purpose-and-need statement (need for power is no longer within ESP scope "
     "under the proposed revision to 10 CFR Part 51)."),
    ("Interfaces with C.3 (alternatives, which the purpose and need bounds) and C.8 (benefit-cost summary, if benefits are assessed).",
     "Interfaces with C.3 (the no-action alternative) and C.8 (the findings summary)."),
    ("This section evaluates the alternatives to the proposed action that pass the screening test in C.3.3.",
     "This section addresses the no-action alternative. Under the proposed revision "
     "to 10 CFR Part 51 the reasonable range of alternatives is limited to the "
     "no-action alternative; energy, alternative-site (including the "
     "obviously-superior-site determination), and system-design alternatives are no "
     "longer within scope."),
    ("NUREG-1555 ESRP 9.1 (no-action), 9.2 (energy alternatives, including 9.2.3 competitive alternative energy sources), 9.3 (site alternatives), and 9.4 (system design alternatives).",
     "NUREG-1555 ESRP 9.1 (no-action alternative). Energy alternatives (ESRP 9.2, "
     "9.2.3), alternative sites (ESRP 9.3), and system-design alternatives (ESRP "
     "9.4) are no longer within scope under the proposed revision to 10 CFR Part 51."),
    ("This section synthesizes the environmental findings and, where benefits are assessed, presents the benefit-cost balance.",
     "This section synthesizes the environmental findings. The benefit-cost balance "
     "is no longer within ESP scope under the proposed revision to 10 CFR Part 51."),
    ("If the benefit-cost balance is included, does the ER tabulate internal and external costs against benefits?",
     "Benefit-cost balance is no longer within ESP scope under the proposed revision "
     "to 10 CFR Part 51."),
    ("The summary draws on all of C.1 through C.7 and, for benefits, on the need-for-power (C.1.4) and alternatives-cost (C.3.4) elements. The compliance list in C.8.4 draws on the authorizations matrix in appendix A.",
     "The summary draws on all of C.1 through C.7. The compliance list in C.8.4 "
     "draws on the authorizations matrix in appendix A."),
    ("Classify every NR GEIS issue as Category 1 or Category 2 using the issue list in Appendix F. Output: the Category 1 findings (by bounding) and the list of Category 2 issues to analyze.",
     "Classify every NR GEIS issue using the issue list in appendix I. Output: the "
     "Category 1 findings by bounding (under the proposed revision to 10 CFR Part "
     "51, proposed appendix C identifies no Category 2 issues)."),
    # B.4 — whole-paragraph replace fixing BOTH the deleted-C.5.5 pointer AND the
    # "reclassified to Category 2" outcome (single paragraph, one edit).
    ("An applicant relying on a Category 1 generic conclusion must confirm that no new and significant information exists for the specific site.",
     "An applicant relying on a Category 1 generic conclusion must confirm that no "
     "new and significant information exists for the specific site. Apply a two-part "
     "test. Information is NEW if it postdates the NR GEIS analysis or was not part "
     "of the record the NR GEIS relied on for that issue. New information is "
     "SIGNIFICANT if either: (1) it would change the issue's significance level "
     "(SMALL, MODERATE, or LARGE) as defined in C.5.3; or (2) it shows a governing "
     "PPE/SPE parameter for that issue exceeds its Table B-1 bounding value. "
     "Information that meets both parts (new and significant) moves the issue out of "
     "Category 1 and would require a project-specific analysis of that issue (under "
     "the proposed revision to 10 CFR Part 51, proposed appendix C identifies no "
     "Category 2 issues, so this arises only if new and significant information is "
     "found). The ER should list, for each Category 1 issue, the sources searched "
     "(literature, agency consultation, site surveys) and state the test result: no "
     "new and significant information, or a project-specific analysis of that issue "
     "is required. The search records may be maintained in owner-controlled "
     "documents; the ER states the sources searched and the result reached."),
    # Prep Workflow step 4 outcome phrasing
    ("Run the new-and-significant-information test for each Category 1 issue (Section B.4). Output: for each issue, no new and significant information, or reclassification to Category 2.",
     "Run the new-and-significant-information test for each issue (Section B.4). "
     "Output: for each issue, no new and significant information, or a "
     "project-specific analysis of that issue."),
    # C.5.4 — FULL paragraph (was a mid-clause match that dropped items (1),(2)).
    ("For each Category 1 issue, the ER should: (1) cite the NR GEIS issue and its generic significance conclusion, referencing (not reproducing) the generic analysis; (2) demonstrate that the governing PPE/SPE values and assumptions are met and document how they are met, which for most issues is the Table B-1 comparison showing each proposed value does not exceed its bounding value (a few issues, for example noise, may require a short supporting analysis to show a value is met); and (3) state the result of the B.4 new-and-significant-information test for that issue (no new and significant information, or the issue is reclassified to Category 2). When items (1) and (2) hold and the B.4 test finds no new and significant information, no independent quantitative impact analysis is required for that issue.",
     "For each Category 1 issue, the ER should: (1) cite the NR GEIS issue and its "
     "generic significance conclusion, referencing (not reproducing) the generic "
     "analysis; (2) demonstrate that the governing PPE/SPE values and assumptions "
     "are met and document how they are met, which for most issues is the Table B-1 "
     "comparison showing each proposed value does not exceed its bounding value (a "
     "few issues, for example noise, may require a short supporting analysis to show "
     "a value is met); and (3) state the result of the B.4 new-and-significant-"
     "information test for that issue (no new and significant information, or a "
     "project-specific analysis of that issue is required). When items (1) and (2) "
     "hold and the B.4 test finds no new and significant information, no independent "
     "quantitative impact analysis is required for that issue."),
    # C.5.1 Purpose — FULL paragraph (was a mid-clause match that dropped the
    # opening "This section analyzes..." sentence).
    ("This section analyzes the environmental impacts of the proposed action, distinguishing Category 1 issues (resolved by bounding demonstration) from Category 2 issues (resolved by site-specific analysis), for both the construction and operation phases. The impact issues analyzed here are the NR GEIS Table 1-1 issues listed in appendix I: for each Category 1 issue the applicant demonstrates PPE/SPE bounding (C.5.4), and for each Category 2 issue provides a project-specific analysis (C.5.5).",
     "This section analyzes the environmental impacts of the proposed action for "
     "both the construction and operation phases. The impact issues analyzed here "
     "are the NR GEIS Table 1-1 issues listed in appendix I: for each issue the "
     "applicant demonstrates PPE/SPE bounding (C.5.4). Under the proposed revision "
     "to 10 CFR Part 51, proposed appendix C identifies no Category 2 issues, so a "
     "project-specific analysis is required only where the applicant cannot "
     "demonstrate the values and assumptions are met or new and significant "
     "information is found."),
    # Prep Workflow step 5 — drop the "Category 2 analyses use as inputs" half
    ("Characterize the affected environment for each resource area, at the detail the C.4.3 rule sets (Section C.4). Output: the site SPE-parameter values for Category 1 resources and the quantitative baselines that the Category 2 analyses use as inputs.",
     "Characterize the affected environment for each resource area, at the detail "
     "the C.4.3 rule sets (Section C.4). Output: the site SPE-parameter values for "
     "the bounded issues, and any quantitative baseline needed where new and "
     "significant information requires a project-specific analysis."),
    # C-preamble acceptance-basis paragraph — asserts "17 Category 2 issues"
    ("Acceptance basis (how each section is judged). Under the tiered NR GEIS framework, the acceptance basis differs by issue category.",
     "Acceptance basis (how each section is judged). Under the tiered NR GEIS "
     "framework, the applicant demonstrates for each issue that the governing "
     "PPE/SPE values are met and that no new and significant information changes the "
     "GEIS conclusion, and no independent analysis is required. Under the proposed "
     "revision to 10 CFR Part 51, proposed appendix C identifies no Category 2 "
     "issues; where an applicant cannot demonstrate the values and assumptions are "
     "met, or new and significant information is found, the project-specific "
     "analysis follows the current Environmental Standard Review Plan (NUREG-1555) "
     "and related guidance (RG 4.2), and each affected subsection below embeds the "
     "applicable NUREG-1555 acceptance criteria verbatim on that basis. The NR GEIS "
     "is the primary acceptance authority throughout."),
    # H-1 summary-report template — "for Category 2, the significance level..."
    ("Conclusion. The finding for the topic: for Category 1, the bounding result and the GEIS significance level; for Category 2, the significance level (SMALL/MODERATE/LARGE per C.5.3) and the quantitative result.",
     "Conclusion. The finding for the topic: the bounding result and the GEIS "
     "significance level; or, where new and significant information requires a "
     "project-specific analysis, the significance level (SMALL/MODERATE/LARGE per "
     "C.5.3) and the quantitative result."),
    # How-to-use — "Appendices A through F ... the 17 Category 2 issues"
    ("Appendices A through F hold the reference material: authorizations matrix, PPE/SPE table, GHG and severe-accident methods, the NUREG-1555 cross-reference, and the 17 Category 2 issues.",
     "Appendices A through E hold the reference material: authorizations matrix, "
     "PPE/SPE table, GHG and severe-accident methods, and the NUREG-1555 "
     "cross-reference (under the proposed revision to 10 CFR Part 51, proposed "
     "appendix C identifies no Category 2 issues, so the former Category 2 issue "
     "list is removed)."),
    # A.4 Document Organization — full-paragraph replace dropping the playbook's
    # "Category 2 issue list" clause (mid-sentence edit must replace the whole
    # sentence, not just the clause, or the paragraph is left a fragment).
    ("Appendices A–I: supporting reference material derived from NR GEIS Appendices F (laws and authorizations), G (PPE/SPE parameters), H (greenhouse-gas methodology), and I (severe-accident framework), a NUREG-1555 cross-reference matrix, the Category 2 issue list, the master preparation checklist (Appendix G), the summary-report model and set (Appendix H), and the complete NR GEIS issue list (Appendix I).",
     "Appendices A through I: supporting reference material derived from NR GEIS "
     "Appendices F (laws and authorizations), G (PPE/SPE parameters), H "
     "(greenhouse-gas methodology), and I (severe-accident framework), a "
     "NUREG-1555 cross-reference matrix, the master preparation checklist "
     "(Appendix G), the summary-report model and set (Appendix H), and the "
     "complete NR GEIS issue list (Appendix I)."),
    # C.4.2 ESRP 2.8 governing-authorities: reword the GEIS "Category 2" label +
    # proposed-rule note (cumulative impacts stay project-specific).
    ("Governing authorities (NUREG-1555 ESRP 2.8): NR GEIS 1.3.3.2.2 (Cumulative Impacts; connected/cumulative/similar actions are project-specific Category 2);",
     "Governing authorities (NUREG-1555 ESRP 2.8): NR GEIS 1.3.3.2.2 (Cumulative "
     "Impacts; connected/cumulative/similar actions, evaluated project-specifically; "
     "under the proposed revision to 10 CFR Part 51, proposed appendix C "
     "identifies no Category 2 issues);"),
    # C.6.3 cumulative-impacts guidance: whole-paragraph replace dropping both
    # "Category 2" labels, keeping the project-specific cumulative-effects substance.
    ("Cumulative impacts are the NR GEIS Table 1-1 cross-resource Category 2 issue (GEIS 1.3.3.2.2; appendix I), evaluated project-specifically. For each affected resource, set the geographic boundary to the extent of that resource that the proposed action affects (for example, the airshed, the watershed or receiving-water segment, or the affected species' range) and set the temporal boundary to span construction through decommissioning. Identify other past, present, and reasonably foreseeable actions within those boundaries and assign the cumulative impact a significance level (SMALL, MODERATE, or LARGE) using the C.5.3 definitions applied to the combined contribution of the proposed action and the others. Cumulative effects are treated as a Category 2 (site-specific) matter.",
     "Cumulative impacts are the NR GEIS Table 1-1 cross-resource issue (GEIS "
     "1.3.3.2.2; appendix I), evaluated project-specifically (under the proposed "
     "revision to 10 CFR Part 51, proposed appendix C identifies no Category 2 "
     "issues; cumulative effects remain a project-specific matter). For each "
     "affected resource, set the geographic boundary to the extent of that resource "
     "that the proposed action affects (for example, the airshed, the watershed or "
     "receiving-water segment, or the affected species' range) and set the temporal "
     "boundary to span construction through decommissioning. Identify other past, "
     "present, and reasonably foreseeable actions within those boundaries and assign "
     "the cumulative impact a significance level (SMALL, MODERATE, or LARGE) using "
     "the C.5.3 definitions applied to the combined contribution of the proposed "
     "action and the others."),
    ("The applicant should structure the ER to make the tiering explicit: for each issue, the ER should identify whether the issue is Category 1 (resolved generically) or Category 2 (requiring site-specific analysis), and cite the corresponding NR GEIS section.",
     "The applicant should structure the ER to make the tiering explicit: for each "
     "issue, the ER should demonstrate that the issue is resolved generically "
     "(PPE/SPE bounding with no new and significant information) and cite the "
     "corresponding NR GEIS section. Under the proposed revision to 10 CFR Part 51, "
     "proposed appendix C identifies no Category 2 issues; a project-specific "
     "analysis is required only where the applicant cannot demonstrate the values "
     "and assumptions are met or new and significant information is found."),
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

# Recurring boilerplate (appears in every C-section's Regulatory Basis) whose
# Category 2 clause is now incoherent — reworded and applied to ALL occurrences.
REPLACE_ALL_PARAS = [
    ("NR GEIS (NUREG-2249): the primary acceptance authority; it resolves the Category 1 issues in this section generically (PPE/SPE bounding, B.4) and routes the Category 2 issues to the guidance below;",
     "NR GEIS (NUREG-2249): the primary acceptance authority; it resolves the issues "
     "in this section generically (PPE/SPE bounding, B.4). Under the proposed "
     "revision to 10 CFR Part 51, proposed appendix C identifies no Category 2 "
     "issues;"),
    ("Acceptance basis: Category 1 issues in this section are judged against the NR GEIS generic analysis (PPE/SPE bounding, B.4); the items below are the NR-GEIS-directed basis for the Category 2 issues, derived from NUREG-1555 read with RG 4.2. Each item is tagged by where it sits in the summary-report model (Section B.7). “Decision basis (in ER)” means the regulator reads the item to make the decision, so it is stated in the ER; this includes the findings and the maps, values, counts, and consultation results the findings rest on. “Backup (owner-controlled)” means the item points to an underlying record (a permit, a procedure, a methodology document) that the ER cites but does not reproduce; the citation is in the ER, the record itself is owner-controlled.",
     "Acceptance basis: the issues in this section are judged against the NR GEIS "
     "generic analysis (PPE/SPE bounding, B.4). Under the proposed revision to 10 "
     "CFR Part 51, proposed appendix C identifies no Category 2 issues; the items "
     "below (retained from NUREG-1555 read with RG 4.2) apply to any issue for which "
     "the applicant cannot demonstrate the values and assumptions are met or for "
     "which new and significant information is found. Each item is tagged by where "
     "it sits in the summary-report model (Section B.7). “Decision basis (in "
     "ER)” means the regulator reads the item to make the decision, so it is "
     "stated in the ER; this includes the findings and the maps, values, counts, "
     "and consultation results the findings rest on. “Backup "
     "(owner-controlled)” means the item points to an underlying record (a "
     "permit, a procedure, a methodology document) that the ER cites but does not "
     "reproduce; the citation is in the ER, the record itself is owner-controlled."),
]


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

def ins_para(new_text, rid, style=None, src_ppr=None):
    """Insert a tracked paragraph. If src_ppr (the original paragraph's full
    <w:pPr>) is given, reuse it so numbering (numPr), spacing, and indentation
    are preserved and the inserted paragraph stays in its numbered/bulleted list.
    The paragraph mark is marked as an insertion."""
    ins_tag = f'<w:ins w:id="{rid[0]}" w:author="{AUTHOR}" w:date="{DATE}"/>'
    if src_ppr:
        # inject the <w:ins> paragraph-mark marker into the copied pPr's rPr
        if '<w:rPr>' in src_ppr:
            ppr = src_ppr.replace('<w:rPr>', '<w:rPr>' + ins_tag, 1)
        else:
            ppr = src_ppr.replace('</w:pPr>', '<w:rPr>' + ins_tag + '</w:rPr></w:pPr>', 1)
    else:
        ppr_style = f'<w:pStyle w:val="{style}"/>' if style else ''
        ppr = f'<w:pPr>{ppr_style}<w:rPr>{ins_tag}</w:rPr></w:pPr>'
    p = (f'<w:p>{ppr}'
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


    # PARTIAL-MATCH GUARD: a REPLACE deletes the whole host paragraph and inserts
    # `new`; if `match` is only part of the paragraph, the unmatched remainder is
    # lost. Warn so mid-clause matches are caught (they must supply the FULL para).
    for match, new in REPLACE_PARAS + REPLACE_ALL_PARAS:
        host = next((text(p) for p in paras if not is_deleted(p) and match in text(p)), None)
        if host is not None and match != host.strip():
            log.append(f"GUARD partial-match (verify new restores full para): {match[:45]}...")

    # 2) prose replacements (delete old para, insert new after it)
    for match, new in REPLACE_PARAS:
        for i, p in enumerate(paras):
            if is_deleted(p): continue
            if match in text(p):
                sty = re.search(r'<w:pStyle w:val="(\w+)"/>', p)
                paras[i] = del_wrap(p, rid) + ins_para(new, rid, src_ppr=ppr_of(p))
                log.append(f"REPLACE: {match[:40]}...")
                break
        else:
            log.append(f"WARN replace target not found: {match[:40]}")

    # 2b) replace-ALL: recurring boilerplate that appears in many sections
    for match, new in REPLACE_ALL_PARAS:
        cnt = 0
        for i, p in enumerate(paras):
            if is_deleted(p): continue
            if match in text(p):
                sty = re.search(r'<w:pStyle w:val="(\w+)"/>', p)
                paras[i] = del_wrap(p, rid) + ins_para(new, rid, src_ppr=ppr_of(p))
                cnt += 1
        log.append(f"REPLACE-ALL x{cnt}: {match[:40]}...")

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
                paras[i] = del_wrap(p, rid) + ins_para(t.replace(old, new), rid, src_ppr=ppr_of(p))
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

    # 6b) Appendix G climate/cumulative checklist row: its section pointer is a
    #     bare "C.5.5" (deleted). Cumulative/climate is analyzed in C.6 (kept), so
    #     retarget that ONE pointer -> C.6. Identify it by the preceding row cell
    #     "GEIS 1.3.3.2.2" (climate/cumulative) to avoid touching other C.5.5s.
    for i, p in enumerate(paras):
        if is_deleted(p):
            continue
        if text(p).strip() == "C.5.5" and i > 0 and \
           text(paras[i-1]).strip() == "GEIS 1.3.3.2.2":
            sty = re.search(r'<w:pStyle w:val="(\w+)"/>', p)
            paras[i] = del_wrap(p, rid) + ins_para("C.6", rid,
                                                   sty.group(1) if sty else None)
            log.append("RETARGET App G climate row C.5.5 -> C.6")

    # 6c) Appendix G bare pointer cells (C.1.4 / C.3.4) that belong to a
    #     just-deleted requirement row: delete only when an adjacent paragraph
    #     (within 3) is already a tracked deletion, so we don't touch unrelated
    #     C.1.4/C.3.4 pointers elsewhere.
    for i, p in enumerate(paras):
        if is_deleted(p):
            continue
        if text(p).strip() in ("C.1.4", "C.3.4"):
            near = any(is_deleted(paras[j]) for j in range(max(0, i-3), min(len(paras), i+2)) if j != i)
            if near:
                paras[i] = del_wrap(p, rid)
                log.append(f"DELETE App G orphan pointer: {text(p).strip()}")

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
