#!/usr/bin/env python3
"""
generate_er_guidance.py — builds the enhanced NEI 21-07 style guidance document
for developing an Environmental Report (ER) for an Early Site Permit (ESP)
under the NR GEIS (NUREG-2249) tiered NEPA framework.

Design principle woven throughout: RIGHT-SIZE the ER. Keep the docketed,
NRC-reviewed ER (a licensing-basis document) as lean as the regulations allow;
maximize reliance on owner-controlled documents (revisable without prior NRC
approval) for supporting data, monitoring detail, and mitigation implementation;
use GEIS Category 1 generic bounding aggressively so site-specific analysis is
limited to the Category 2 issues.
"""

from docx_builder import DocxBuilder
import json, os

def bold(t):
    return (t, {"bold": True})

def italic(t):
    return (t, {"italic": True})

_TOOLS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tools")
CFR = json.load(open(os.path.join(_TOOLS, "cfr_text.json")))
ESRP = json.load(open(os.path.join(_TOOLS, "esrp_criteria.json")))
ESRP_BIN = json.load(open(os.path.join(_TOOLS, "esrp_binary.json")))
TABLE11 = json.load(open(os.path.join(_TOOLS, "geis_table11.json")))

def esrp_names():
    return {
        "1.1": "Introduction to the Proposed Project", "1.2": "Status of Reviews",
        "2.1": "Station Location", "2.2.1": "The Site and Vicinity",
        "2.2.2": "Transmission Corridors and Offsite Areas", "2.2.3": "The Region",
        "2.3.1": "Hydrology", "2.3.2": "Water Use", "2.3.3": "Water Quality",
        "2.4.1": "Terrestrial Ecology", "2.4.2": "Aquatic Ecology",
        "2.5.1": "Demography", "2.5.2": "Community Characteristics",
        "2.5.3": "Historic Properties",
        "2.6": "Geology", "2.7": "Meteorology and Air Quality",
        "2.8": "Related Federal Project Activities",
        "3.1": "External Appearance and Plant Layout",
        "3.2": "Reactor Power Conversion System",
        "4.6": "Radiation Exposure to Construction Workers",
        "5.3": "Cooling System Impacts",
        "6.1": "Preapplication and Preconstruction Monitoring",
        "7.1": "Land Use Cumulative Impacts", "7.2": "Water Cumulative Impacts",
        "7.3": "Ecology Cumulative Impacts",
        "9.1": "No-Action Alternative", "9.2": "Energy Alternatives",
        "9.2.3": "Assessment of Alternative Energy Sources and Systems",
        "9.3": "Alternative Sites", "9.4": "System Design Alternatives",
        "10.1": "Unavoidable Adverse Impacts", "10.2": "Short-Term Uses vs. Long-Term Productivity",
        "10.3": "Irreversible and Irretrievable Commitments", "10.4": "Benefit-Cost Balance",
    }

def embed_esrp(dd, secs, cat2_note=True):
    """Embed derived acceptance items for the given ESRP section numbers. Each
    item is tagged with its placement in the three-layer model: whether it must
    be stated EXPLICITLY IN THE ER, or is carried BY REFERENCE in the summary
    report / owner-controlled document (Section B.7). The cited governing
    authorities follow as supporting detail. Under the NR GEIS tiered framework
    these are the review basis for CATEGORY 2 (project-specific) issues; Category
    1 issues are judged against the NR GEIS generic analysis."""
    names = esrp_names()
    any_emitted = False
    if cat2_note:
        dd.para("Acceptance basis: Category 1 issues in this section are judged "
                "against the NR GEIS generic analysis (PPE/SPE bounding, B.4); the "
                "items below are the NR-GEIS-directed basis for the Category 2 "
                "issues, derived from NUREG-1555 read with RG 4.2. Each item is "
                "tagged by where it sits in the summary-report model (Section "
                "B.7). “Decision basis (in ER)” means the regulator reads "
                "the item to make the decision, so it is stated in the ER; this "
                "includes the findings and the maps, values, counts, and "
                "consultation results the findings rest on. “Backup "
                "(owner-controlled)” means the item points to an underlying "
                "record (a permit, a procedure, a methodology document) that the "
                "ER cites but does not reproduce; the citation is in the ER, the "
                "record itself is owner-controlled.", italic=True, size=18)
    for s in secs:
        b = ESRP_BIN.get(s)
        if not b:
            continue
        dd.para("", segments=[bold(f"Acceptance items, ESRP {s} "
                 f"({names.get(s, '')}):")], before=80, after=20)
        tests = b["tests"]
        places = b.get("placements", ["Explicit in ER"] * len(tests))
        for t, p in zip(tests, places):
            # strip the trailing "(Y/N)" and carry meaning via the placement tag
            item = t.replace("(Y/N)", "").strip().rstrip("?").strip() + "?"
            dd.bullet("", segments=[(item + "  ", {}), (f"[{p}]", {"bold": True})])
        auths = b.get("authorities", [])
        if auths:
            dd.para("Governing authorities (NUREG-1555 ESRP " + s + "): "
                    + "; ".join(auths) + ".", italic=True, size=16)
        any_emitted = True
    return any_emitted

def embed_cfr(dd, key):
    c = CFR[key]
    dd.quote(c["text"], label=f"{c['title']} (verbatim; 10 CFR Part 51, current as of July 13, 2026)")

def reg_basis_lead(dd):
    """Emit the two authorities that sit above the CFR/ESRP in every C-section's
    Regulatory Basis: the NR GEIS (the primary acceptance authority, which
    resolves Category 1 generically and routes Category 2 to the guidance below)
    and RG 4.2 Rev 4 (the ER-preparation guide the GEIS points to). Called first
    in each Regulatory Basis so the hierarchy stated in the C-preamble is visible
    per section, not only in the preamble."""
    dd.bullet("", segments=[bold("NR GEIS (NUREG-2249)"), ": the primary "
              "acceptance authority; it resolves the Category 1 issues in this "
              "section generically (PPE/SPE bounding, B.4) and routes the Category "
              "2 issues to the guidance below;"])
    dd.bullet("", segments=[bold("Regulatory Guide 4.2, Revision 4"), ": the "
              "ER-preparation guide the NR GEIS directs applicants to for the "
              "information an application must include;"])

def include_exclude(dd, include, exclude):
    """Render a section's content requirements as two labeled groupings so the
    'in the ER' and 'not in the ER' content are never interleaved. `include` and
    `exclude` are lists of bullet strings (or (text, segments) — plain strings
    here)."""
    dd.para("Include in the ER:", bold=True)
    for item in include:
        dd.bullet(item)
    dd.para("Do not include in the ER (owner-controlled; cite, do not restate):",
            bold=True)
    for item in exclude:
        dd.bullet(item)


d = DocxBuilder()

# =============================================================================
# TITLE PAGE
# =============================================================================
d.spacer(3)
d.title("Environmental Report Playbook")
d.subtitle("A Standalone Preparation Guide for an Early Site Permit Application")
d.subtitle("Referencing the NR GEIS (NUREG-2249) and 10 CFR Part 51")
d.spacer(1)
d.para("Technology-Inclusive; Embeds Governing Regulatory Text, NUREG-1555 "
       "Acceptance Criteria, and the NR GEIS Issue Framework",
       align="center", italic=True, size=22)
d.spacer(3)
d.para("Revision 1", align="center", bold=True, size=24)
d.para("July 2026", align="center", size=24)
d.spacer(5)
d.para("Prepared in the format and style of NEI 21-07", align="center", italic=True)
d.page_break()

# =============================================================================
# TABLE OF CONTENTS
# =============================================================================
d.toc()
d.page_break()

# =============================================================================
# HOW TO USE THIS PLAYBOOK + PREPARATION WORKFLOW
# =============================================================================
d.heading("HOW TO USE THIS PLAYBOOK", 1)
d.para("This document is a standalone playbook for preparing the Environmental "
       "Report (ER) for an Early Site Permit (ESP). It is a one-stop reference: "
       "the governing regulatory text (10 CFR Part 51), the NRC staff acceptance "
       "criteria the ER will be reviewed against (NUREG-1555), and the NR GEIS "
       "(NUREG-2249) issue framework are embedded in place, so a preparer does "
       "not need to open the source documents to know what each ER section must "
       "contain and how it will be judged.")
d.para("Reading the layout:")
d.bullet("", segments=[bold("Sections A and B"), " explain the framework: the "
         "tiered NEPA review, the Category 1/Category 2 split, the PPE/SPE "
         "bounding method, and the deferrals available at the ESP stage."])
d.bullet("", segments=[bold("Section C"), " is the section-by-section content "
         "guide (C.1 through C.9). Each subsection states its purpose, the "
         "verbatim governing regulation and NUREG-1555 acceptance criteria, the "
         "guidance, the data required, and the review interfaces."])
d.bullet("", segments=[bold("Appendices A through F"), " hold the reference "
         "material: authorizations matrix, PPE/SPE table, GHG and severe-accident "
         "methods, the NUREG-1555 cross-reference, and the 17 Category 2 issues."])
d.bullet("", segments=[bold("Appendix G"), " is the master checklist: every "
         "required element the regulator reads to make the decision, and its "
         "Type, source, and ER section."])
d.bullet("", segments=[bold("Appendix H"), " defines the summary-report model: "
         "the three layers, the report template, and the 20-report set each "
         "mapped to a single ER chapter."])
d.para("Verbatim source text appears in shaded, bordered boxes labeled "
       "“verbatim.” Where a box condenses connective language, the "
       "condensed portion is shown in square brackets; confirm any bracketed "
       "passage against the cited source before filing.")

d.heading("Preparation Workflow", 2)
d.para("Prepare the ER in the following ten steps. Each step names its output and "
       "the playbook section that supports it.")
d.numbered("Define the proposed action, purpose, and need (Section C.1). Output: "
           "the one-to-two-sentence purpose-and-need statement and the ESP "
           "deferral elections under 10 CFR 51.50(b)(2).")
d.numbered("Fix the Plant Parameter Envelope and Site Parameter Envelope and "
           "complete the Table B-1 bounding demonstration (Sections C.2 and "
           "Appendix B). Output: each proposed value shown not to exceed (or not "
           "below) its bounding value.")
d.numbered("Classify every NR GEIS issue as Category 1 or Category 2 using the "
           "issue list in Appendix F. Output: the Category 1 findings (by "
           "bounding) and the list of Category 2 issues to analyze.")
d.numbered("Run the new-and-significant-information test for each Category 1 "
           "issue (Section B.4). Output: for each issue, no new and significant "
           "information, or reclassification to Category 2.")
d.numbered("Characterize the affected environment for each resource area, at the "
           "detail the C.4.3 rule sets (Section C.4). Output: the site "
           "SPE-parameter values for Category 1 resources and the quantitative "
           "baselines that the Category 2 analyses use as inputs.")
d.numbered("Analyze the Category 2 impacts for both the construction and "
           "operation phases (Section C.5). Output: for each issue, the method, "
           "the quantitative result, the significance level, and any mitigation.")
d.numbered("Evaluate alternatives and make the obviously-superior-site "
           "determination (Section C.3). Output: the screening result for each "
           "alternative and the conclusion on whether any site is obviously "
           "superior to the proposed site.")
d.numbered("Assess cumulative effects, greenhouse-gas emissions, and severe "
           "accidents (Sections C.5.6, C.5.7, C.6). Output: the significance "
           "levels and the lifecycle GHG comparison.")
d.numbered("Compile the status-of-compliance list and the adverse information "
           "(Sections C.8.4 and C.8.5). Output: the Federal-authorizations table "
           "with compliance status and any adverse information and responses.")
d.numbered("Assemble the ER, run the master checklist (Appendix G), and confirm "
           "every required element is present before filing. Output: the "
           "docketed “Applicant’s Environmental Report, Early Site "
           "Permit Stage.”")
d.page_break()

# =============================================================================
# SECTION A — INTRODUCTION AND PURPOSE
# =============================================================================
d.heading("A.  INTRODUCTION AND PURPOSE", 1)

d.heading("A.1  Purpose of This Guidance", 2)
d.para("This document provides guidance to applicants preparing the Environmental "
       "Report (ER) that must accompany an application for an Early Site Permit "
       "(ESP) under 10 CFR Part 52, Subpart A. It is written in the format and "
       "style of NEI 21-07 and is technology-inclusive: it applies to light-water "
       "and non-light-water advanced reactor designs alike.")
d.para("Under 10 CFR 51.50(b), the ER must be filed as a separate document "
       "titled “Applicant’s Environmental Report, Early Site Permit "
       "Stage” and must contain the information specified in 10 CFR 51.45 "
       "(general content), 10 CFR 51.51 (uranium fuel cycle, Table S-3), and "
       "10 CFR 51.52 (transportation, Table S-4), as modified by 51.50(b)(1) "
       "through (b)(4).")
d.para("The guidance is intended to help applicants prepare an ER that:")
d.bullet("Satisfies the content requirements of 10 CFR 51.45, 51.50(b), and 51.75;")
d.bullet("Correctly references and tiers from the Generic Environmental Impact "
         "Statement for Licensing New Nuclear Reactors (NR GEIS, NUREG-2249);")
d.bullet("Demonstrates that the proposed plant and site are bounded by the Plant "
         "Parameter Envelope (PPE) and Site Parameter Envelope (SPE) so that "
         "Category 1 issues are resolved generically; and")
d.bullet("Provides the site-specific analysis needed to resolve the Category 2 "
         "issues that the NR GEIS does not resolve generically.")

d.heading("A.1.1  Right-Sizing the Environmental Report", 3)
d.para("A central objective of this guidance is to help the applicant right-size "
       "the ER. The ER is a licensing-basis document: once docketed and reviewed, "
       "its content is subject to NRC oversight and cannot be changed without "
       "following the applicable change-control process. Information that is "
       "placed in owner-controlled documents, by contrast, can be revised by the "
       "applicant under its own configuration-management program without prior NRC "
       "approval, provided the ER conclusions remain bounding and valid.")
d.para("Accordingly, throughout this guidance the applicant is encouraged to:")
d.bullet("Include in the ER the information that supports the environmental "
         "findings and the NEPA determinations, and allocate the remainder to "
         "owner-controlled documents per the split in Section B.6;")
d.bullet("Rely on the NR GEIS generic analyses for Category 1 issues rather than "
         "reproducing site-specific analysis where the plant and site are bounded;")
d.bullet("Incorporate detailed data sets, monitoring-program descriptions, "
         "sampling procedures, and mitigation-implementation detail by reference "
         "to owner-controlled documents, rather than embedding that detail in the "
         "docketed ER; and")
d.bullet("State environmental commitments at the level of the outcome to be "
         "achieved, leaving the implementing detail to owner-controlled programs.")
d.para("The result is a leaner licensing basis that preserves the applicant's "
       "flexibility to update supporting information over the life of the permit "
       "while still providing the NRC staff and the public a complete and "
       "auditable basis for the environmental findings.")
d.para("The ER achieves this through a summary-report tier (Section B.7): nothing "
       "is authored for the first time in the ER. Each ER section is drawn from a "
       "topic summary report, and the summary report is the layer that lists the "
       "owner-controlled documents supporting each conclusion.")

d.heading("A.2  Regulatory Framework", 2)
d.para("The ER for an ESP is governed principally by the following regulations "
       "and guidance:")
d.bullet("", segments=[bold("10 CFR Part 51"), ": NRC regulations implementing "
         "the National Environmental Policy Act (NEPA), including the ER content "
         "requirements of 51.45, the ESP-specific requirements of 51.50(b) and "
         "51.75, and Appendix A (format)."])
d.bullet("", segments=[bold("10 CFR Part 52, Subpart A"), ": the ESP licensing "
         "process."])
d.bullet("", segments=[bold("NR GEIS (NUREG-2249)"), ": the generic EIS from "
         "which the site-specific environmental review tiers, including the "
         "Category 1 / Category 2 issue classification and the PPE/SPE."])
d.bullet("", segments=[bold("NUREG-1555"), ": the Environmental Standard Review "
         "Plan (ESRP); the acceptance criteria the NRC staff apply when reviewing "
         "each ER section. This guidance maps those criteria to each ER section "
         "so the applicant can anticipate the review."])
d.bullet("", segments=[bold("Regulatory Guide 4.2, Revision 4 (April 2026)"),
         ": preparation of environmental reports for nuclear power stations. "
         "Revision 4 removed environmental justice from the ER format and content "
         "following the rescission of Executive Order 12898; this playbook follows "
         "Revision 4 and does not include environmental justice as an ER content "
         "requirement."])
d.bullet("", segments=[bold("Regulatory Guide 4.7"), ": general site suitability "
         "criteria for nuclear power stations."])

d.heading("A.3  Relationship to the NR GEIS (NUREG-2249)", 2)
d.para("The NR GEIS evaluates the environmental impacts of licensing new nuclear "
       "reactors on a generic basis. Under 10 CFR 51.20 and 40 CFR 1501.11, the "
       "site-specific NEPA document prepared for an ESP application (the staff's "
       "Environmental Impact Statement) tiers from the NR GEIS. The ER is the "
       "applicant's input to that tiered review.")
d.para("Issuance of an early site permit is one of the actions that 10 CFR "
       "51.20(b) lists as requiring an environmental impact statement, so the "
       "environmental-assessment and finding-of-no-significant-impact path of "
       "10 CFR 51.21 is not available for this action; the staff prepares an EIS "
       "tiered from the NR GEIS, and the tiered Category 1 / Category 2 framework "
       "in this playbook follows from that.")
d.para("The NR GEIS classifies environmental issues into two categories:")
d.bullet("", segments=[bold("Category 1 issues"), ": issues for which the NR "
         "GEIS reaches a generic conclusion applicable to all plants within the "
         "PPE/SPE. For a Category 1 issue, the applicant need only demonstrate "
         "that the proposed plant and site fall within the bounding parameters; "
         "no independent site-specific impact analysis is required unless new and "
         "significant information exists."])
d.bullet("", segments=[bold("Category 2 issues"), ": issues that depend on "
         "site-specific factors and therefore require the applicant to perform "
         "and document a site-specific analysis in the ER."])
d.para("The two-category structure governs the amount of site-specific content "
       "the ER must contain: the more issues the applicant can demonstrate are "
       "bounded (Category 1), the less site-specific analysis is required.")

d.heading("A.4  Document Organization", 2)
d.para("This guidance is organized as follows:")
d.bullet("", segments=[bold("Section A"), ": Introduction and purpose."])
d.bullet("", segments=[bold("Section B"), ": Development and use of the ER, "
         "including the tiered review process, the Category 1/2 framework, the "
         "PPE/SPE bounding demonstration, the new-and-significant-information "
         "standard, and coordination with other regulatory requirements."])
d.bullet("", segments=[bold("Section C"), ": section-by-section content guidance "
         "for the ER (C.1 through C.9), each keyed to the applicable NUREG-1555 "
         "acceptance criteria."])
d.bullet("", segments=[bold("Appendices A–I"), ": supporting reference material "
         "derived from NR GEIS Appendices F (laws and authorizations), G (PPE/SPE "
         "parameters), H (greenhouse-gas methodology), and I (severe-accident "
         "framework), a NUREG-1555 cross-reference matrix, the Category 2 "
         "issue list, the master preparation checklist (Appendix G), the "
         "summary-report model and set (Appendix H), and the complete NR GEIS "
         "issue list (Appendix I)."])
d.page_break()

# =============================================================================
# SECTION B — DEVELOPMENT AND USE OF THE ER
# =============================================================================
d.heading("B.  DEVELOPMENT AND USE OF THE ENVIRONMENTAL REPORT", 1)

d.heading("B.1  The Tiered Environmental Review Process", 2)
d.para("The applicant's ER supports the NRC staff's preparation of a site-specific "
       "supplemental EIS that tiers from the NR GEIS. Tiering allows the "
       "site-specific review to incorporate the NR GEIS generic analyses by "
       "reference and to focus on the issues that remain to be resolved for the "
       "specific site. The applicant should structure the ER to make the tiering "
       "explicit: for each issue, the ER should identify whether the issue is "
       "Category 1 (resolved generically) or Category 2 (requiring site-specific "
       "analysis), and cite the corresponding NR GEIS section.")

d.heading("B.2  Category 1 and Category 2 Issues", 2)
d.para("The applicant's treatment of an issue depends on its category:")
d.para("For Category 1 issues, the ER should:", bold=True)
d.bullet("Reference the NR GEIS generic analysis and its significance level "
         "(SMALL, MODERATE, or LARGE) for the issue, without reproducing the "
         "analysis;")
d.bullet("Demonstrate that the proposed plant and site are bounded by the "
         "applicable PPE/SPE parameters and assumptions, and document how each "
         "governing value is met (see section B.3 and appendix B); and")
d.bullet("Confirm that no new and significant information exists that would call "
         "the generic conclusion into question (see section B.4).")
d.para("If a Category 1 issue does not apply to the project, the ER need not "
       "analyze it but must briefly state the basis for concluding it is not "
       "applicable (recorded per C.5.4).")
d.para("For Category 2 issues, the ER should:", bold=True)
d.bullet("Provide a site-specific analysis of the impact;")
d.bullet("Assign the significance level (SMALL, MODERATE, or LARGE) using the "
         "definitions in C.5.3; and")
d.bullet("Identify any mitigation the applicant proposes, stated at the outcome "
         "level with implementation detail carried in owner-controlled documents.")
d.para("The Category 2 issues requiring site-specific treatment typically include "
       "surface-water quality impacts from chemical and thermal discharges, "
       "thermal impacts on aquatic biota, other cooling-water discharge effects, "
       "impacts on ESA-listed terrestrial and aquatic species and critical "
       "habitat, effects on historic and cultural resources, "
       "climate-change effects on the affected resources, and cumulative "
       "effects. Appendix E maps each of these to the applicable ER section and "
       "NUREG-1555 acceptance criteria.")
d.para("Items the ESP ER need not include (10 CFR 51.50(b)(2)): the ESP ER may "
       "omit, and defer to the construction-permit or combined-license stage, "
       "(1) an assessment of the economic, technical, or other benefits and costs "
       "of the proposed action (need for power and the benefit-cost balance); "
       "(2) an evaluation of alternative energy sources; and (3) any discussion "
       "of the environmental impacts of the continued storage of spent fuel. If "
       "the applicant omits an item, state the election and cite 10 CFR "
       "51.50(b)(2); if the applicant includes it, this guidance provides the "
       "framework (need for power, C.1.4; alternative energy sources and cost, "
       "C.3.4; benefit-cost balance, C.8.3). Under 10 CFR 51.75(b) the NRC draft "
       "EIS will not address a deferred item unless the ER addressed it.")

d.heading("B.3  PPE and SPE Bounding Demonstration", 2)
d.para("The Plant Parameter Envelope (PPE) and Site Parameter Envelope (SPE) are "
       "the sets of bounding plant-design and site-characteristic values under "
       "which the NR GEIS generic (Category 1) conclusions hold. The applicant "
       "demonstrates that a Category 1 issue is resolved for its project by "
       "showing that each PPE/SPE parameter that the NR GEIS ties to that issue "
       "falls within the corresponding bounding value.")
d.para("The recommended approach is a bounding table (see the template in "
       "appendix B) that lists, for each parameter: the PPE/SPE bounding value, "
       "the proposed-plant or proposed-site value, and the result of comparing "
       "the two (proposed does not exceed a maximum bounding value, or is not "
       "less than a minimum bounding value). Where a proposed value exceeds a "
       "maximum (or falls below a minimum), the affected issue can no longer be "
       "treated as Category 1 and the applicant must provide a site-specific "
       "analysis for that issue.")
d.para("The bounding table itself belongs in the ER because it is the basis for "
       "the Category 1 findings. The underlying engineering calculations, vendor "
       "data, and design specifications that establish the proposed-plant values "
       "should be maintained as owner-controlled documents and incorporated by "
       "reference, not reproduced in the ER.")

d.heading("B.4  New and Significant Information", 2)
d.para("An applicant relying on a Category 1 generic conclusion must confirm that "
       "no new and significant information exists for the specific site. Apply a "
       "two-part test. Information is NEW if it postdates the NR GEIS analysis or "
       "was not part of the record the NR GEIS relied on for that issue. New "
       "information is SIGNIFICANT if either: (1) it would change the issue's "
       "significance level (SMALL, MODERATE, or LARGE) as defined in C.5.3; or "
       "(2) it shows a governing PPE/SPE parameter for that issue exceeds its "
       "Table B-1 bounding value. Information that meets both parts (new and "
       "significant) moves the issue out of Category 1 and requires a "
       "site-specific analysis under C.5.5. The ER should list, for each "
       "Category 1 issue, the sources searched (literature, agency consultation, "
       "site surveys) and state the test result: no new and significant "
       "information, or the issue is reclassified to Category 2. The search "
       "records may be maintained in owner-controlled documents; the ER states "
       "the sources searched and the result reached.")

d.heading("B.5  Coordination with Other Regulatory Requirements", 2)
d.para("Preparation of the ER should be coordinated with the consultations and "
       "authorizations required under other statutes, because the outcomes of "
       "those processes inform the environmental findings. Key examples include "
       "Endangered Species Act Section 7 consultation with the U.S. Fish and "
       "Wildlife Service and/or NMFS, National Historic Preservation Act Section "
       "106 consultation with the State Historic Preservation Officer, Clean Water "
       "Act Section 401/402/404 permitting, and Clean Air Act permitting. "
       "Appendix A provides a consolidated matrix of the applicable laws, "
       "administering agencies, and required authorizations. The applicant should "
       "initiate these consultations no later than the ER submittal, because "
       "their schedules often govern the "
       "critical path of the environmental review.")

d.heading("B.6  Maximizing Owner-Controlled Documents", 2)
d.para("Consistent with section A.1.1, the applicant should deliberately allocate "
       "information between the docketed ER and owner-controlled documents. The "
       "following allocation is recommended:")
d.para("Keep in the ER (licensing basis):", bold=True)
d.bullet("The proposed action, purpose, and need;")
d.bullet("The PPE/SPE bounding demonstration and Category 1 findings;")
d.bullet("The site-specific Category 2 analyses and their significance "
         "conclusions;")
d.bullet("The alternatives analysis and the environmental findings; and")
d.bullet("Environmental commitments stated at the outcome level.")
d.para("Carry in owner-controlled documents (incorporated by reference):", bold=True)
d.bullet("Raw environmental baseline data sets and survey field records;")
d.bullet("Detailed monitoring-program procedures, sampling plans, and quality "
         "assurance;")
d.bullet("Engineering calculations and vendor data supporting PPE values;")
d.bullet("Mitigation implementation procedures and best-management-practice "
         "details; and")
d.bullet("Supporting studies whose conclusions, not methods, the ER relies on.")
d.para("When incorporating by reference, the ER should identify the referenced "
       "document, its revision-control mechanism, and the specific conclusion or "
       "data relied upon, so the reference is auditable without importing the full "
       "document into the licensing basis.")

d.heading("B.7  The Summary-Report Tier", 2)
d.para("The ER is assembled through a three-layer document model. Nothing is "
       "authored for the first time in the ER; every ER statement originates in a "
       "summary report, which in turn rests on owner-controlled documents.")
d.para("The three layers are:", bold=True)
d.bullet("", segments=[bold("Owner-controlled documents"), " (base layer): the "
         "raw data sets, engineering calculations, survey field records, and "
         "procedures. Revisable by the applicant under its own configuration "
         "management without prior NRC approval."])
d.bullet("", segments=[bold("Summary report"), " (middle layer): one report per "
         "topic (see appendix H for the set). The summary report states the "
         "conclusion and its basis for that topic and lists the owner-controlled "
         "documents the conclusion rests on. It is the single place a reviewer "
         "goes to trace a conclusion to its owner-controlled sources."])
d.bullet("", segments=[bold("ER section"), " (top layer): the ER section is its "
         "summary report with the owner-controlled-document list removed. Same "
         "conclusions and basis; the internal reference list stays in the summary "
         "report. This keeps the docketed ER clean while preserving a two-step "
         "trace from any ER statement to its owner-controlled sources through the "
         "summary report."])
d.para("Two rules govern the model:", bold=True)
d.bullet("", segments=[bold("No first authoring in the ER"), ": if a statement "
         "does not already appear in a summary report, it does not belong in the "
         "ER. New analysis is authored in the summary report first, then the ER "
         "section is drawn from it."])
d.bullet("", segments=[bold("One report, one chapter"), ": each summary report "
         "maps within a single ER chapter (C.1 through C.8) and never spans two "
         "chapters. Affected-environment (C.4) baseline reports and environmental-"
         "consequences (C.5) impact reports are separate reports even for the "
         "same resource."])
d.para("Appendix H lists the summary-report set and gives the summary-report "
       "template.")

d.heading("B.8  Exemptions", 2)
d.para("An applicant considering an exemption should first identify which of three "
       "distinct things the exemption would touch, because the pathway and the "
       "available relief differ.")
d.para("The environmental impact statement itself is not exemptible.", bold=True)
d.para("Issuance of an early site permit is listed in 10 CFR 51.20(b) as an action "
       "requiring an environmental impact statement, and that requirement "
       "implements Section 102(2)(C) of NEPA (a statute). The specific-exemption "
       "provision of 10 CFR 51.6 reaches only “the requirements of the "
       "regulations in this part” that are “authorized by law,” so it "
       "cannot waive the statutory EIS obligation; there is no ESP path to an "
       "environmental assessment in place of an EIS. The only in-rule adjustment "
       "to the environmental-review level, 10 CFR 51.22 special circumstances, "
       "runs toward more review, not less.")
d.para("An individual Part 51 content requirement may be addressed under 10 CFR "
       "51.6.", bold=True)
d.para("For a specific content element of 10 CFR 51.45 or 51.50(b) that the "
       "applicant contends should not apply to its project, 10 CFR 51.6 provides "
       "the pathway. Verbatim: the Commission “may, upon application of any "
       "interested person or upon its own initiative, grant such exemptions from "
       "the requirements of the regulations in this part as it determines are "
       "authorized by law and are otherwise in the public interest.” Before "
       "seeking such an exemption, confirm that no built-in relief already "
       "applies: an inapplicable NR GEIS Category 1 issue may be dropped with a "
       "brief not-applicable basis (C.5.4); the benefits, energy-alternatives "
       "cost, and continued-storage discussions may be deferred under 10 CFR "
       "51.50(b)(2) (B.2); and the uranium-fuel-cycle and transportation tables "
       "flex for a non-LWR under 10 CFR 51.50(b)(3) (C.5.8). An exemption is the "
       "tool only where none of these built-in off-ramps reaches the requirement.")
d.para("A technical or safety-regulation exemption is a separate action.", bold=True)
d.para("An exemption from a technical or siting regulation reached through 10 CFR "
       "Part 52 (for example, a siting criterion in 10 CFR Part 100) is sought "
       "under 10 CFR 52.7, not under 10 CFR 51.6. Under 10 CFR 52.7 the "
       "Commission’s consideration “will be governed by 10 CFR 50.12 of "
       "this chapter, unless other criteria are provided for” in Part 52, in "
       "which case those criteria apply first. The 10 CFR 50.12 standard has two "
       "parts: the exemption must be authorized by law, present no undue risk to "
       "public health and safety, and be consistent with the common defense and "
       "security (50.12(a)(1)); and at least one of the six special-circumstances "
       "conditions in 10 CFR 50.12(a)(2) must be present. Confirm the exact text "
       "and criteria of 10 CFR 52.7 and 50.12 against Parts 52 and 50 before "
       "relying on them. A technical exemption does not alter the ER’s NEPA "
       "obligations; where it changes the plant or site configuration, the ER "
       "describes the exempted configuration and analyzes its environmental "
       "effects like any other project feature.")
d.para("The advanced-reactor frameworks share this standard. The proposed Part 57 "
       "microreactor rule provides its own specific-exemption section (proposed "
       "10 CFR 57.9), which the NRC describes as equivalent to 10 CFR 50.12 and "
       "52.7; a technical exemption sought under such a framework is governed by "
       "the same 10 CFR 50.12 criteria. Confirm the governing part and section "
       "for the specific licensing framework the application uses.")
d.page_break()

# =============================================================================
# SECTION C — CONTENT GUIDANCE FOR THE ER
# =============================================================================
d.heading("C.  CONTENT GUIDANCE FOR THE ENVIRONMENTAL REPORT", 1)
d.para("This section provides content guidance for each part of the ER. Each "
       "subsection follows a common structure: Purpose, Regulatory Basis, "
       "Guidance, Data Requirements, and Review Interfaces.")
d.para("Right-sizing rule (applies to every C-section). Each section's Guidance "
       "presents its content as two explicit groupings so the right-sized "
       "allocation is visible throughout: “Include in the ER” lists what "
       "the ER states at the decision-basis level of detail (the findings and the "
       "values, maps, and results the regulator reads to decide); “Do not "
       "include in the ER (owner-controlled)” lists the underlying records "
       "the ER cites but does not reproduce. Consistent with the summary-report "
       "model (Section B.7), the ER section is the summary report with the "
       "owner-controlled-document list removed.")
d.para("Acceptance basis (how each section is judged). Under the tiered NR GEIS "
       "framework, the acceptance basis differs by issue category. For the 100 "
       "Category 1 issues, the basis is the NR GEIS generic analysis: the "
       "applicant demonstrates that the governing PPE/SPE values are met and that "
       "no new and significant information changes the GEIS conclusion, and no "
       "independent analysis is required. For the 17 Category 2 issues, the NR "
       "GEIS directs the project-specific analysis to the current Environmental "
       "Standard Review Plan (NUREG-1555) and related guidance (RG 4.2); each "
       "affected subsection below embeds the applicable NUREG-1555 acceptance "
       "criteria verbatim on that basis. The NR GEIS is therefore the primary "
       "acceptance authority throughout, and it routes the Category 2 issues to "
       "NUREG-1555 and RG 4.2.")

# ---- C.1 -------------------------------------------------------------------
d.heading("C.1  Introduction, Purpose, and Need for the Proposed Action", 2)

d.heading("C.1.1  Purpose", 3)
d.para("This section introduces the proposed action and states the purpose of and "
       "need for the action. The purpose and need supplies the capacity target "
       "and deployment window that the alternatives screening test in C.3.3 "
       "applies.")

d.heading("C.1.2  Regulatory Basis", 3)
d.para("Applicable requirements and acceptance criteria:")
reg_basis_lead(d)
d.bullet("10 CFR 51.45(b) and (d): content and NEPA considerations;")
d.bullet("10 CFR 51.50(b): ESP application content;")
d.bullet("NUREG-1555 ESRP 1.1–1.3: introduction, the proposed action, and need "
         "for the proposed action; and")
d.bullet("NUREG-1555 ESRP 8.4: assessment of need for power (see C.1.4).")
embed_cfr(d, "51.45")
embed_cfr(d, "51.50b")
embed_esrp(d, ["1.1", "1.2"])

d.heading("C.1.3  Guidance", 3)
d.para("For an ESP, the purpose and need is typically to preserve the option to "
       "deploy generating capacity at a suitable site; it need not depend on a "
       "demonstrated present shortfall in generating capacity.")
include_exclude(d,
    include=[
        "The proposed action (issuance of an ESP authorizing site preparation "
        "and reserving the site for later construction and operation of one or "
        "more advanced reactor units), the applicant, and the reactor type;",
        "The site location (State, county, and coordinates of the site center);",
        "The purpose-and-need statement, in one to two sentences;",
        "Where the environmental documents are publicly available;",
        "The public-involvement activities conducted (meetings held, notices "
        "issued);",
        "Every Federal permit, license, approval, and other entitlement the "
        "action requires, with the compliance or consultation status of each "
        "(format in C.8.4; authorizations matrix in appendix A); and",
        "If a need-for-power assessment is included under C.1.4, its conclusion.",
    ],
    exclude=[
        "Detailed corporate, market, and business-case materials that support "
        "the purpose and need.",
    ])

d.heading("C.1.4  Need for Power (Optional for an ESP)", 3)
d.para("Under 10 CFR 51.50(b)(2), an ESP ER need not include an assessment of the "
       "benefits (need for power) of the proposed action; the applicant may "
       "choose to defer benefits assessments to the construction-permit or "
       "combined-license stage. This guidance nonetheless provides the full "
       "framework for applicants who elect to include a need-for-power "
       "assessment.")
d.para("Where included, the need-for-power assessment should, consistent with "
       "NUREG-1555 ESRP 8.4:")
d.bullet("Identify the market or service area the proposed baseload capacity "
         "would serve and the role of that capacity within it;")
d.bullet("Present demand and capacity forecasts, reserve-margin trends, and the "
         "contribution of energy efficiency and distributed generation;")
d.bullet("State whether the proposed capacity is intended for a regulated "
         "service territory or a wholesale/merchant market, and identify the "
         "market operator (ISO/RTO) and interconnection queue if merchant; and")
d.bullet("State whether the forecast capacity need equals or exceeds the net "
         "capacity of the proposed action within the deployment window, and "
         "identify the forecast and reserve-margin basis for that conclusion.")
d.para("If the applicant defers the benefits assessment, state that election "
       "clearly and cite 10 CFR 51.50(b)(2). Deferring keeps optional content out "
       "of the ESP licensing basis.")

d.heading("C.1.5  Review Interfaces", 3)
d.para("Interfaces with C.3 (alternatives, which the purpose and need bounds) and "
       "C.8 (benefit-cost summary, if benefits are assessed).")

# ---- C.2 -------------------------------------------------------------------
d.heading("C.2  Description of the Proposed Action: Site and Plant", 2)

d.heading("C.2.1  Purpose", 3)
d.para("This section describes the proposed site and the plant (via the PPE). It "
       "provides each PPE parameter listed in appendix B, table B-1, and addresses "
       "each of the six RG 4.7 site suitability factors listed in C.2.4.")

d.heading("C.2.2  Regulatory Basis", 3)
reg_basis_lead(d)
d.bullet("10 CFR 51.45(b), 51.50(b);")
d.bullet("NUREG-1555 ESRP 2.1 (station location), 2.2 (plant description), "
         "3.1 (external appearance and plant layout); and")
d.bullet("Regulatory Guide 4.7: general site suitability criteria.")
embed_esrp(d, ["2.1", "2.2.1", "2.2.2", "2.2.3", "3.1", "3.2"])

d.heading("C.2.3  Guidance: Plant Description via the PPE", 3)
d.para("Describe the proposed plant using the Plant Parameter Envelope rather than "
       "a single fixed design, so the ER remains valid across the range of "
       "advanced-reactor designs the applicant may ultimately deploy, and express "
       "the description at the PPE (bounding) level so that selecting or refining "
       "a design within the PPE does not require an ER change.")
d.para("Include in the ER:", bold=True)
d.bullet("The PPE parameters listed in appendix B, table B-1 (thermal power, "
         "cooling system type and water use, land disturbance, effluent "
         "characteristics, and workforce), each shown in that table not to exceed "
         "its SPE/PPE bounding value from 10 CFR Part 51, Appendix Table C-1, "
         "which underlies the NR GEIS Category 1 conclusions;")
d.bullet("The result of the B.4 new-and-significant-information test for the "
         "PPE-bounded Category 1 issues (completing the bounding proof);")
d.bullet("The number of units, the footprint dimensions, the maximum structure "
         "height, and a plant-layout drawing (ESRP 3.1); and")
d.bullet("The reactor type, the rated thermal power (MWt), and whether the "
         "reactor and its fuel-and-waste transportation meet all Table S-4 "
         "conditions (ESRP 3.2).")
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("The specific vendor design, detailed drawings, and engineering "
         "specifications behind the PPE values.")

d.heading("C.2.4  Guidance: Site Description and RG 4.7 Suitability", 3)
d.para("Describe the site (its location, land use, and characteristics) and "
       "demonstrate its general suitability using the criteria of Regulatory "
       "Guide 4.7. This site and corridor description provides the baseline the "
       "applicant uses to demonstrate PPE/SPE bounding for the associated NR GEIS "
       "Table 1-1 Category 1 issues (appendix I): the Land Use issues "
       "(GEIS 3.1.2.1.1–3.1.2.2.2) and the Visual issues (GEIS 3.2.2.1.1–"
       "3.2.2.2.1), including the offsite and transmission-line entries. For each "
       "such issue the applicant performs the bounding demonstration by the C.4.3 "
       "rule (site value against its Table B-1 bounding value) and confirms no new "
       "and significant information (B.4); the Category 1 finding is recorded per "
       "C.5.4.")
d.para("Include in the ER:", bold=True)
d.bullet("The exclusion-area boundary distance, the site acreage, and a site map "
         "showing the property boundary (ESRP 2.1);")
d.bullet("The length and acreage of each transmission-line corridor and other "
         "offsite area to be disturbed (ESRP 2.2.2);")
d.bullet("For the site and vicinity, the transmission-line corridors and other "
         "offsite areas, and the region: the current land-use category and "
         "acreage (or percent by category for the region); each applicable "
         "land-use plan, including any formally proposed or staged plan being "
         "actively pursued; and whether the project conflicts with each plan and "
         "the extent of any conflict (ESRP 2.2.1 through 2.2.3);")
d.bullet("The result of each of the six RG 4.7 site suitability factors below;")
d.bullet("The overall RG 4.7 suitability determination (suitable, or the specific "
         "factors not met); and")
d.bullet("For each associated GEIS Category 1 land-use and visual issue, the NR "
         "GEIS reference, the Table B-1 comparison showing the governing values "
         "are met, and the B.4 new-and-significant-information result (the "
         "Category 1 proof recorded per C.5.4); or, for an issue that does not "
         "apply, the brief not-applicable basis (C.5.4).")
d.para("The six RG 4.7 site suitability factors:", bold=True)
d.bullet("", segments=[bold("Population density and distribution"), ": the "
         "low-population zone (LPZ) outer radius and the population-center "
         "distance as defined in 10 CFR 100.3; the current and projected "
         "population by the sector and distance bands specified in RG 4.7; and "
         "confirmation that the population-center distance meets the minimum in "
         "10 CFR 100.21(b)."])
d.bullet("", segments=[bold("Nearby industrial, transportation, and military "
         "facilities"), ": each hazardous-material facility, pipeline, airport, "
         "rail line, highway, and military activity within the site vicinity, and "
         "for each, whether the frequency of a design-basis event from it "
         "(explosion, fire, toxic release, aircraft impact) exceeds the screening "
         "threshold in the applicable NUREG-0800 external-hazard review sections."])
d.bullet("", segments=[bold("Meteorology"), ": the atmospheric dispersion factors "
         "(chi/Q) at the exclusion-area boundary and LPZ used in the effluent and "
         "accident analyses, and the design-basis wind, tornado, and "
         "precipitation values per the applicable regulatory guides."])
d.bullet("", segments=[bold("Geology and seismology"), ": the physiographic "
         "province and the site's stratigraphy and bedrock depth; whether any "
         "capable tectonic source exists within the site investigation distance "
         "defined in 10 CFR 100.23; and the design-basis ground motion (peak "
         "ground acceleration and response spectra) per 10 CFR Part 100 and the "
         "applicable seismic regulatory guide."])
d.bullet("", segments=[bold("Hydrology"), ": the surface-water and groundwater "
         "resources, the design-basis flood elevation and its margin above grade, "
         "and the water availability (flow or volume) against the peak "
         "consumptive-use rate from table B-1."])
d.bullet("", segments=[bold("Emergency planning"), ": the topography, "
         "access/egress routes, and surrounding land use bearing on emergency "
         "planning, and confirmation that no site feature precludes an emergency "
         "plan meeting 10 CFR 50.47 and Part 50, Appendix E."])
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("The underlying site survey data (meteorological tower records, "
         "geotechnical borings, and hydrologic monitoring), which is cited and "
         "kept current without ER changes.")

d.heading("C.2.5  Data Requirements", 3)
d.bullet("PPE parameters listed in table B-1;")
d.bullet("Site maps, land-use, and property boundaries;")
d.bullet("Population within 0–16 km (0–10 mi) and 0–80 km (0–50 mi), by sector "
         "and distance band, for the current year and the peak year of the permit "
         "term, from U.S. Census data and State/county projections;")
d.bullet("Onsite meteorological data (wind speed/direction, stability, "
         "precipitation) covering the period required by the applicable "
         "meteorological-monitoring regulatory guide;")
d.bullet("Geological/seismological data supporting the design-basis ground motion "
         "(C.2.4); and")
d.bullet("Surface-water and groundwater data supporting the design-basis flood "
         "elevation and the water-availability comparison (C.2.4).")

d.heading("C.2.6  Review Interfaces", 3)
d.para("The PPE/SPE parameters established here feed the bounding demonstrations "
       "throughout C.4 and C.5 and are consolidated in appendix B.")

# ---- C.3 -------------------------------------------------------------------
d.heading("C.3  Alternatives to the Proposed Action", 2)

d.heading("C.3.1  Purpose", 3)
d.para("This section evaluates the alternatives to the proposed action that pass "
       "the screening test in C.3.3. Under NEPA and 10 CFR 51 the alternatives "
       "analysis is the heart of the environmental review; at the ESP stage its "
       "central purpose is the alternative-sites determination of whether any "
       "site is obviously superior to the proposed site (C.3.3).")

d.heading("C.3.2  Regulatory Basis", 3)
reg_basis_lead(d)
d.bullet("10 CFR 51.45(b)(3), 51.45(c); 40 CFR 1502.14;")
d.bullet("10 CFR 51 Appendix A;")
d.bullet("NUREG-1555 ESRP 9.1 (no-action), 9.2 (energy alternatives, including "
         "9.2.3 competitive alternative energy sources), 9.3 (site alternatives), "
         "and 9.4 (system design alternatives).")
embed_esrp(d, ["9.1", "9.2", "9.2.3", "9.3", "9.4"])

d.heading("C.3.3  Guidance: Alternatives Screening and Evaluation", 3)
d.para("Determine which alternatives to carry forward by applying this screening "
       "test. An alternative is carried into the impact evaluation only if it "
       "meets all three criteria:")
d.numbered("It can supply the generating capacity defined by the purpose and "
           "need (C.1). For an energy alternative, this means at least the net "
           "capacity of "
           "the proposed action; for a site or design alternative, the same "
           "capacity at the alternative site or with the alternative system;")
d.numbered("It is commercially available for deployment within the ESP term "
           "(a technology in research or pilot stage that cannot be deployed at "
           "utility scale within that term does not pass); and")
d.numbered("It is available to the applicant (the applicant can acquire the "
           "site, technology, or fuel; a site the applicant cannot obtain, or a "
           "technology not offered to the applicant, does not pass).")
d.para("State, for each alternative considered, whether it passed or failed each "
       "criterion and the basis. Evaluate each alternative that passes by "
       "characterizing every impact by resource area using the "
       "SMALL/MODERATE/LARGE framework of C.5.3. The alternatives to evaluate "
       "fall in the following categories:")
d.bullet("", segments=[bold("No-action alternative"), ": the environmental "
         "consequences of not issuing the ESP (always evaluated)."])
d.bullet("", segments=[bold("Energy alternatives"), ": alternative generating "
         "technologies and combinations that pass the screening test, compared "
         "on environmental impact and, where included, economic cost "
         "(ESRP 9.2.3)."])
d.bullet("", segments=[bold("Alternative sites"), ": the candidate sites that "
         "pass the screening test, evaluated against the stated environmental and "
         "suitability criteria. State the criteria, the screening result for each "
         "candidate, and the proposed site's total impact by significance level "
         "against each alternative site's. The NR GEIS supplies the resource-impact "
         "analysis for the alternative sites as well as the proposed site, so the "
         "applicant authors the site-to-site comparison rather than fresh impact "
         "analyses; the ER must compare the differences so the obviously-superior "
         "determination can be made. Under 10 CFR 51.50(b)(1) the ESP "
         "determination is whether any alternative site is OBVIOUSLY SUPERIOR to "
         "the proposed site (a higher and asymmetric bar than merely "
         "environmentally preferable). State the conclusion in those terms: no "
         "alternative site is obviously superior, or a named site is obviously "
         "superior. Address the construction and operation effects of a reactor "
         "within the site parameters only to the extent needed to make that "
         "determination (10 CFR 51.50(b)(1)) (ESRP 9.3)."])
d.bullet("", segments=[bold("System design alternatives"), ": principally "
         "alternative heat-dissipation (cooling) systems and intake/discharge "
         "configurations, each evaluated on impact by resource area, with the "
         "applicable NPDES conditions cited for each cooling alternative. If the "
         "design does not use cooling water, an evaluation of alternative cooling "
         "systems is not required; state that basis and omit the comparison "
         "(ESRP 9.4)."])
d.para("Include in the ER:", bold=True)
d.bullet("For each alternative considered, the pass or fail result against each "
         "of the three C.3.3 screening criteria, with the basis;")
d.bullet("For each alternative that passes, its impact by resource area at the "
         "SMALL/MODERATE/LARGE level (C.5.3);")
d.bullet("The alternative-site screening criteria and result for each candidate, "
         "and the conclusion on whether any site is obviously superior to the "
         "proposed site;")
d.bullet("The system-design (heat-dissipation and intake/discharge) comparison "
         "with the NPDES conditions cited for each cooling alternative, or, for a "
         "design that uses no cooling water, the basis for omitting it; and")
d.bullet("If included, the economic-cost comparison of alternative energy sources "
         "(otherwise the deferral election and 10 CFR 51.50(b)(2) citation).")
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("The detailed candidate-site screening data, technology cost models, and "
         "engineering inputs behind the comparisons.")

d.heading("C.3.4  Guidance: Alternative Energy Sources and Cost (Optional Elements)", 3)
d.para("The economic-cost comparison of alternative energy sources (ESRP 9.2.3, "
       "step two) is tied to the benefits/cost assessment that 10 CFR 51.50(b)(2) "
       "makes optional for an ESP. An applicant may present the environmental-"
       "impact comparison of alternatives (required) while deferring the detailed "
       "economic-cost comparison. This guidance retains the full cost-comparison "
       "framework for applicants who elect to include it. If deferred, state the "
       "election and cite 10 CFR 51.50(b)(2).")

d.heading("C.3.5  Data Requirements", 3)
d.bullet("Candidate-site screening criteria and results;")
d.bullet("Generating-technology characteristics and impact profiles;")
d.bullet("Cooling-system alternatives and their water-use/impact profiles.")

d.heading("C.3.6  Review Interfaces", 3)
d.para("Alternatives are bounded by the purpose and need (C.1) and share the "
       "impact methodology of C.5; cost elements interface with C.8.")
d.page_break()

# ---- C.4 -------------------------------------------------------------------
d.heading("C.4  Description of the Affected Environment", 2)

d.heading("C.4.1  Purpose", 3)
d.para("This section characterizes the existing environment (the baseline) against "
       "which impacts are assessed, for each resource area.")

d.heading("C.4.2  Regulatory Basis", 3)
reg_basis_lead(d)
d.bullet("10 CFR 51.45(b), 51.50(b);")
d.bullet("NUREG-1555 ESRP 2.3 (water), 2.4 (ecology), 2.5 (socioeconomics), "
         "2.6 (geology/soils), 2.7 (meteorology/air quality), and 2.8 "
         "(historic and cultural resources).")
embed_esrp(d, ["2.3.1", "2.3.2", "2.3.3", "2.4.1", "2.4.2", "2.5.1", "2.5.2",
               "2.5.3", "2.6", "2.7", "2.8"])

d.heading("C.4.3  Guidance: Resource Areas", 3)
d.para("Provide a baseline characterization for each resource area below. Each "
       "resource baseline supports the applicant's PPE/SPE bounding demonstration "
       "for the associated NR GEIS Table 1-1 issues (appendix I): Water Resource "
       "(GEIS 3.4), Terrestrial Ecology (GEIS 3.5), Aquatic Ecology (GEIS 3.6), "
       "Socioeconomics (GEIS 3.12), Historic and Cultural Resources (GEIS 3.7), "
       "and Air Quality (GEIS 3.3). Set the level of detail by the following "
       "rule:")
d.bullet("For a resource governed only by Category 1 issues, reference the NR "
         "GEIS generic analysis (do not reproduce it) and state the site's "
         "measured value of the SPE parameter that the NR GEIS ties to that "
         "resource, the corresponding bounding value from appendix B, table B-1, "
         "and confirm the site value does not exceed that bounding value (for a "
         "maximum) or is not less than it (for a minimum), that is, show the "
         "governing value is met and briefly how; state the result of the "
         "B.4 new-and-significant-information test for the issue; and cite the NR "
         "GEIS section. No quantitative baseline dataset beyond that value is "
         "required in the ER. If the issue does not apply, state the brief "
         "not-applicable basis instead (C.5.4).")
d.bullet("For a resource governed by a Category 2 issue, provide the "
         "quantitative baseline that the C.5.5 site-specific analysis for that "
         "issue uses as its input (for example, receiving-water temperature and "
         "flow for a thermal-discharge analysis).")
d.para("The resource areas are:")
d.bullet("Land use and visual/aesthetic resources, for the site and vicinity "
         "and separately for the transmission-line corridors and other offsite "
         "areas the project would disturb (per NUREG-1555 sections 2.2.2, 4.1.2, "
         "and 5.1.2);")
d.bullet("Air quality and meteorology;")
d.bullet("Geology, soils, and seismology;")
d.bullet("Surface water resources and water quality;")
d.bullet("Groundwater resources and quality;")
d.bullet("Terrestrial ecology and wildlife, including protected species;")
d.bullet("Aquatic ecology, including protected species and essential fish "
         "habitat;")
d.bullet("Socioeconomics and demographics;")
d.bullet("Historic and cultural resources;")
d.bullet("Noise;")
d.bullet("Transportation and traffic;")
d.bullet("Human health;")
d.bullet("Electromagnetic fields from transmission lines (RG 4.2 section 2.7.4);")
d.bullet("Nonradiological and radiological background;")
d.bullet("Land and water use for the fuel cycle (as applicable);")
d.bullet("Waste management infrastructure; and")
d.bullet("Climate and greenhouse-gas baseline.")
d.para("Baseline content by resource area. In addition to the level-of-detail "
       "rule above, each resource-area baseline states the specific items its "
       "acceptance criteria test:")
d.bullet("Water: the design-basis flood elevation and margin above grade, "
         "groundwater depth and whether the site overlies a sole-source aquifer, "
         "the peak consumptive water-use rate against available supply, the "
         "baseline water-quality classification of each affected water body, and "
         "the applicable USACE Section 404, NPDES, and water-use permits "
         "(ESRP 2.3.1 through 2.3.3).")
d.bullet("Ecology: the acreage of each terrestrial habitat type; the aquatic "
         "species present; each Federally listed terrestrial and aquatic species, "
         "designated critical habitat, and essential fish habitat; and the ESA "
         "Section 7, Bald and Golden Eagle Protection Act, and Magnuson-Stevens "
         "essential-fish-habitat consultation status (ESRP 2.4.1 and 2.4.2).")
d.bullet("Socioeconomics: the exclusion-area, "
         "low-population-zone, and population-center distances; current and "
         "permit-term-projected population by the RG 4.7 sector and distance "
         "bands; and affected-area employment, housing, public-service, and "
         "infrastructure capacity (ESRP 2.5.1, 2.5.2).")
d.bullet("Historic and cultural resources: each historic property in the area of "
         "potential effect and its National Register eligibility, and the NHPA "
         "Section 106 consultation status with the SHPO/THPO (ESRP 2.5.3).")
d.bullet("Geology and meteorology: the physiographic province, stratigraphy, and "
         "bedrock depth; whether any capable tectonic source lies within the site "
         "investigation distance; the design-basis ground motion; the atmospheric "
         "dispersion factors at the EAB and LPZ; the design-basis severe-weather "
         "values; and whether the site is in an air-quality attainment area "
         "(ESRP 2.6 and 2.7).")
d.bullet("Related Federal activities: each connected, cumulative, or similar "
         "Federal action in the area, and whether any cooperating agency is "
         "needed (ESRP 2.8).")

d.heading("C.4.4  Allocation of Baseline Information", 3)
d.para("Allocate each resource-area baseline between the ER and owner-controlled "
       "documents as follows.")
d.para("Include in the ER:", bold=True)
d.bullet("The baseline conclusion for each resource area;")
d.bullet("The specific values the C.4.3 rule identifies: the site's SPE-parameter "
         "value and its Table B-1 comparison for a Category 1 resource, or the "
         "quantitative baseline the C.5.5 analysis takes as input for a Category 2 "
         "resource; and")
d.bullet("The per-resource items listed under C.4.3.")
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("Full field data (species survey records, water-quality monitoring "
         "datasets, cultural-resource survey reports, and meteorological "
         "records), which is cited and kept current without ER revisions while "
         "the ER retains the auditable conclusions.")

d.heading("C.4.5  Review Interfaces", 3)
d.para("Baseline resource areas map one-to-one to the impact analyses in C.5 and "
       "provide the setting for cumulative effects in C.6.")

# ---- C.5 -------------------------------------------------------------------
d.heading("C.5  Environmental Consequences of the Proposed Action", 2)

d.heading("C.5.1  Purpose", 3)
d.para("This section analyzes the environmental impacts of the proposed action, "
       "distinguishing Category 1 issues (resolved by bounding demonstration) from "
       "Category 2 issues (resolved by site-specific analysis), for both the "
       "construction and operation phases. The impact issues analyzed here are the "
       "NR GEIS Table 1-1 issues listed in appendix I: for each Category 1 issue "
       "the applicant demonstrates PPE/SPE bounding (C.5.4), and for each Category "
       "2 issue provides a project-specific analysis (C.5.5).")

d.heading("C.5.2  Regulatory Basis", 3)
reg_basis_lead(d)
d.bullet("10 CFR 51.45(b)(1), (b)(2), (c); 51.50(b);")
d.bullet("NUREG-1555 ESRP 4.1–4.6 (construction impacts), 5.1–5.11 (operations "
         "impacts across resource areas, including 5.3 water, 5.4 ecology, "
         "5.8 socioeconomics, and postulated-accident sections); and")
d.bullet("NR GEIS Table 1-1 Category 1/Category 2 issue classification "
         "(appendix I).")
embed_esrp(d, ["4.6", "5.3"])

d.heading("C.5.3  Significance Framework", 3)
d.para("Characterize every impact using the NRC significance framework:")
d.bullet("", segments=[bold("SMALL"), ": effects are not detectable or are so "
         "minor they neither destabilize nor noticeably alter any important "
         "attribute of the resource."])
d.bullet("", segments=[bold("MODERATE"), ": effects are sufficient to alter "
         "noticeably, but not to destabilize, important attributes of the "
         "resource."])
d.bullet("", segments=[bold("LARGE"), ": effects are clearly noticeable and "
         "sufficient to destabilize important attributes of the resource."])
d.heading("Phase and area coverage", 4)
d.para("Assess impacts for two phases separately, following the NUREG-1555 split: "
       "construction and preconstruction (ESRP 4.1 through 4.6) and station "
       "operation (ESRP 5.1 through 5.11). For each phase, address the site and "
       "vicinity and, separately, the transmission-line corridors and other "
       "offsite areas the project would disturb. Beyond the resource-area "
       "impacts, two phase-specific analyses are required:")
d.bullet("", segments=[bold("Construction (ESRP 4.6)"), ": state the radiation "
         "dose to construction workers from any operating adjacent units and "
         "confirm it is within the applicable occupational limit, and identify "
         "the nonaquatic-environment monitoring and recordkeeping procedures."])
d.bullet("", segments=[bold("Operation (ESRP 5.3)"), ": address the cooling-system "
         "intake, discharge, and heat-dissipation impacts, stating the intake "
         "flow, discharge temperature, and thermal-discharge delta-T, confirming "
         "the thermal discharge is within the applicable Clean Water Act NPDES "
         "limit, and assigning a significance level."])

d.heading("C.5.4  Category 1 Issues: Bounding Demonstration", 3)
d.para("The NR GEIS sets the applicant's Category 1 obligation directly. An "
       "applicant addressing a Category 1 issue may refer to the NR GEIS generic "
       "analysis for that issue without further analysis, provided it demonstrates "
       "that the relevant PPE/SPE values and assumptions the resource analysis "
       "used are met and that there is no new and significant information that "
       "would require a project-specific analysis; the applicant documents how the "
       "values and assumptions are met. The ER therefore references the generic "
       "analysis rather than reproducing it, and focuses on the project-specific "
       "information the NR GEIS does not already supply.")
d.para("For each Category 1 issue, the ER should: (1) cite the NR GEIS issue and "
       "its generic significance conclusion, referencing (not reproducing) the "
       "generic analysis; (2) demonstrate that the governing PPE/SPE values and "
       "assumptions are met and document how they are met, which for most issues "
       "is the Table B-1 comparison showing each proposed value does not exceed "
       "its bounding value (a few issues, for example noise, may require a short "
       "supporting analysis to show a value is met); and (3) state the result of "
       "the B.4 new-and-significant-information test for that issue (no new and "
       "significant information, or the issue is reclassified to Category 2). When "
       "items (1) and (2) hold and the B.4 test finds no new and significant "
       "information, no independent quantitative impact analysis is required for "
       "that issue.")
d.para("Not-applicable issues. An applicant need not analyze a Category 1 issue "
       "that does not apply to the project (for example, an issue tied to a "
       "cooling-water feature the design does not have), but the ER must briefly "
       "state the basis for concluding the issue is not applicable, in place of "
       "the three items above.")
d.para("Include in the ER, for each Category 1 issue:", bold=True)
d.numbered("Issue and NR GEIS reference (citing, not reproducing, the generic "
           "analysis);")
d.numbered("Generic significance level;")
d.numbered("Governing PPE/SPE parameter(s) and Table B-1 comparison result, with a "
           "brief statement of how each value and assumption is met;")
d.numbered("Result of the B.4 new-and-significant-information test; or")
d.numbered("For an issue that does not apply, a brief basis for the "
           "not-applicable conclusion, in place of items 1 through 4.")
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("The engineering calculations and vendor data establishing the "
         "proposed-plant values, and the new-and-significant-information search "
         "records.")

d.heading("C.5.5  Category 2 Issues: Site-Specific Analysis", 3)
d.para("For each Category 2 issue, provide a site-specific analysis that produces "
       "the four items listed at the end of this subsection. The Category 2 "
       "issues typically requiring analysis include:")
d.bullet("Surface-water-quality impacts from chemical and thermal discharges;")
d.bullet("Thermal impacts on aquatic biota;")
d.bullet("Impingement, entrainment, and other cooling-water intake/discharge "
         "effects;")
d.bullet("Impacts on ESA-listed terrestrial species and critical habitat;")
d.bullet("Impacts on ESA-listed and Magnuson-Stevens-managed aquatic species and "
         "essential fish habitat;")
d.bullet("Effects on historic and cultural resources (NHPA Section 106);")
d.bullet("Climate-change effects on the affected environmental resources; and")
d.bullet("Cumulative effects (addressed in C.6).")
d.para("For each issue above, the ER states the four items: (1) the analysis "
       "method; (2) the quantitative result; (3) the significance level "
       "(SMALL, MODERATE, or LARGE) assigned using the C.5.3 definitions; and "
       "(4) any proposed mitigation, stated at the outcome level.")
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("The implementation detail behind each proposed mitigation measure.")

d.heading("C.5.6  Greenhouse-Gas Emissions", 3)
d.para("Estimate the greenhouse-gas (GHG) emissions associated with the proposed "
       "action across its lifecycle and compare them with alternatives, following "
       "the methodology in appendix C (derived from NR GEIS Appendix H).")
d.para("Include in the ER:", bold=True)
d.bullet("The lifecycle GHG estimate and the comparison with alternatives.")
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("The detailed emission-factor calculations and activity-data sources.")

d.heading("C.5.7  Postulated Accidents and Severe Accidents", 3)
d.para("For design-basis accidents, state the calculated offsite dose at the "
       "exclusion-area boundary and the LPZ and compare each to the applicable "
       "10 CFR Part 50 / Part 52 reactor-siting dose limits. For severe accidents, "
       "apply the "
       "probability-weighted consequence framework of appendix D (derived from NR "
       "GEIS Appendix I), including the severe-accident mitigation "
       "alternatives/design alternatives (SAMAs/SAMDAs) evaluation of D-2. When "
       "the design's CDF, LERF, and source term are bounded by the PPE, the ER "
       "cites the generic severe-accident results and provides only the two "
       "site-specific inputs: the atmospheric dispersion factors (chi/Q) and the "
       "surrounding population used in the consequence calculation.")
d.para("Include in the ER:", bold=True)
d.bullet("The calculated design-basis-accident offsite dose at the EAB and LPZ "
         "and its comparison to the applicable dose limits;")
d.bullet("The probability-weighted severe-accident consequence result, the "
         "SAMA/SAMDA evaluation outcome, and the two site-specific inputs "
         "(dispersion factors and surrounding population).")
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("The design PRA, the source-term derivation, and the consequence-code "
         "run files behind the results.")

d.heading("C.5.8  Uranium Fuel Cycle and Transportation", 3)
d.para("Regulatory basis: 10 CFR 51.51 (Table S-3) and 51.52 (Table S-4), as "
       "modified for the ESP by 51.50(b)(3).")
embed_cfr(d, "51.51")
embed_cfr(d, "51.52")
d.bullet("", segments=[bold("Light-water reactors"), ": evaluate the uranium "
         "fuel-cycle environmental effects using the impact values in Table S-3; "
         "no further discussion of the release values and numerical data in "
         "Table S-3 is required except for radon-222 and technetium-99. Account "
         "for the radiological dose commitments, health effects from fuel-cycle "
         "effluents, and the economic, socioeconomic, and cumulative fuel-cycle "
         "impacts."])
d.bullet("", segments=[bold("Non-light-water (advanced) reactors"), ": Table S-3 "
         "does not apply as tabulated. Under 10 CFR 51.50(b)(3) the ER must "
         "provide the basis for evaluating the fuel-cycle environmental effects "
         "of the proposed reactor (the front-end and back-end activities, their "
         "throughput scaled to the reactor's fuel form and burnup, and the "
         "resulting effluents and doses) in place of the Table S-3 values."])
d.bullet("", segments=[bold("Transportation"), ": evaluate the environmental "
         "effects of transporting fuel and radioactive waste using the impact "
         "values in Table S-4 where the reactor meets the Table S-4 conditions; "
         "where it does not (for example, a non-LWR fuel form outside the S-4 "
         "assumptions), state the basis and provide a reactor-specific "
         "transportation evaluation."])
d.para("Include in the ER:", bold=True)
d.bullet("The Table S-3 fuel-cycle impact statement (LWR) or the reactor-specific "
         "fuel-cycle basis (non-LWR), and the Table S-4 transportation statement "
         "or its reactor-specific substitute.")
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("The fuel-cycle throughput and effluent calculations and the "
         "transportation-analysis inputs behind the statements.")

d.heading("C.5.9  Data Requirements", 3)
d.bullet("Effluent source terms and discharge characteristics (from the PPE);")
d.bullet("Site meteorology and population for dispersion/consequence analysis;")
d.bullet("Aquatic and terrestrial resource data for Category 2 analyses;")
d.bullet("Lifecycle GHG emission factors;")
d.bullet("For a non-LWR, the fuel-cycle throughput and effluent basis "
         "substituting for Table S-3 (C.5.8).")

d.heading("C.5.10  Review Interfaces", 3)
d.para("Impacts build on the baseline (C.4) and the PPE/SPE (C.2, appendix B); "
       "GHG and severe-accident analyses use Appendices C and D; results feed the "
       "cumulative-effects analysis (C.6) and the summary (C.8).")
d.page_break()

# ---- C.6 -------------------------------------------------------------------
d.heading("C.6  Cumulative Effects", 2)

d.heading("C.6.1  Purpose", 3)
d.para("This section assesses the incremental impact of the proposed action when "
       "added to other past, present, and reasonably foreseeable future actions.")

d.heading("C.6.2  Regulatory Basis", 3)
reg_basis_lead(d)
d.bullet("40 CFR 1508.1(g)(3) (cumulative effects concept); 10 CFR 51.45;")
d.bullet("NUREG-1555 ESRP 7.1–7.5 (cumulative-impacts review).")
embed_esrp(d, ["7.1", "7.2", "7.3"])

d.heading("C.6.3  Guidance", 3)
d.para("Cumulative impacts are the NR GEIS Table 1-1 cross-resource Category 2 "
       "issue (GEIS 1.3.3.2.2; appendix I), evaluated project-specifically. For "
       "each affected resource, set the geographic boundary to the extent of "
       "that resource that the proposed action affects (for example, the airshed, "
       "the watershed or receiving-water segment, or the affected species' range) "
       "and set the temporal boundary to span construction through "
       "decommissioning. Identify other past, present, and reasonably foreseeable "
       "actions within those boundaries and assign the cumulative impact a "
       "significance level (SMALL, MODERATE, or LARGE) using the C.5.3 "
       "definitions applied to the combined contribution of the proposed action "
       "and the others. Cumulative effects are treated as a Category 2 "
       "(site-specific) matter.")
d.para("The ESRP treats severe-accident mitigation alternatives (SAMAs/SAMDAs) "
       "alongside the ecological cumulative-effects review (ESRP 7.3). State "
       "whether a SAMA/SAMDA evaluation was performed; the evaluation itself is "
       "guided by C.5.7 and appendix D.")
d.para("Include in the ER:", bold=True)
d.bullet("The geographic and temporal boundaries used for each resource;")
d.bullet("The cumulative-impact significance level for each resource; and")
d.bullet("Whether a SAMA/SAMDA evaluation was performed.")
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("The supporting inventory of other past, present, and reasonably "
         "foreseeable actions and their underlying data.")

d.heading("C.6.4  Review Interfaces", 3)
d.para("Cumulative effects draw on the baseline (C.4) and project impacts (C.5).")

# ---- C.7 -------------------------------------------------------------------
d.heading("C.7  Environmental Monitoring and Measurement Programs", 2)

d.heading("C.7.1  Purpose", 3)
d.para("This section describes the environmental monitoring programs "
       "(preoperational and operational) used to establish baseline and to detect "
       "impacts.")

d.heading("C.7.2  Regulatory Basis", 3)
reg_basis_lead(d)
d.bullet("10 CFR 51.45(b); 10 CFR 51.50(b)(4); 10 CFR 50.36b; NUREG-1555 ESRP "
         "6.1 (preapplication/preconstruction monitoring) and related "
         "operational-monitoring guidance.")
embed_esrp(d, ["6.1"])

d.heading("C.7.3  Guidance", 3)
d.para("Under 10 CFR 51.50(b)(4), the ER must identify the procedures for "
       "reporting and keeping records of environmental data, and any conditions "
       "and monitoring requirements for protecting the non-aquatic environment, "
       "that the applicant proposes for inclusion in the early site permit as "
       "environmental conditions under 10 CFR 50.36b.")
d.para("Include in the ER:", bold=True)
d.bullet("For each monitoring program, what is monitored, why, and the "
         "commitment to monitor;")
d.bullet("The parameters the C.5 impact findings and mitigation commitments rely "
         "on;")
d.bullet("The monitoring conditions proposed for inclusion in the ESP as "
         "environmental conditions under 10 CFR 50.36b; and")
d.bullet("A citation to the permit governing any monitored discharge.")
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("The detailed monitoring procedures (station locations, sampling "
         "frequencies, analytical methods, and quality assurance), so the "
         "applicant can refine monitoring methods over time without amending the "
         "ER while the ER preserves the monitoring commitments.")

d.heading("C.7.4  Review Interfaces", 3)
d.para("Monitoring supports the baseline (C.4), verifies impact predictions (C.5), "
       "and implements mitigation commitments (C.5, C.8).")

# ---- C.8 -------------------------------------------------------------------
d.heading("C.8  Summary and Conclusions", 2)

d.heading("C.8.1  Purpose", 3)
d.para("This section synthesizes the environmental findings and, where benefits "
       "are assessed, presents the benefit-cost balance.")

d.heading("C.8.2  Regulatory Basis", 3)
reg_basis_lead(d)
d.bullet("10 CFR 51.45(b)(1)–(5), (c); 51.75(b);")
d.bullet("NUREG-1555 ESRP 10.1–10.4, including 10.4.2 (cost-benefit balance).")
embed_esrp(d, ["10.1", "10.2", "10.3", "10.4"])

d.heading("C.8.3  Guidance", 3)
d.para("Include in the ER:", bold=True)
d.bullet("The significance conclusions for all Category 1 and Category 2 issues;")
d.bullet("Unavoidable adverse environmental impacts;")
d.bullet("The relationship between short-term uses and long-term productivity;")
d.bullet("Irreversible and irretrievable commitments of resources; and")
d.bullet("If the applicant elects to include it, the benefit-cost balance "
         "(otherwise the deferral election and 10 CFR 51.50(b)(2) citation).")
d.para("Benefit-cost balance (optional for an ESP): Under 10 CFR 51.50(b)(2), the "
       "ESP ER need not present the benefit-cost balance or a cost assessment "
       "(10 CFR 51.75(b) reciprocally bars the staff's draft EIS from addressing "
       "it unless the ER did). Where "
       "the applicant elects to include it, follow NUREG-1555 ESRP 10.4.2: "
       "tabulate internal and external costs and weigh them against the benefits, "
       "using the estimated-internal-and-external-costs table format. This "
       "guidance retains the full framework for applicants who include it; "
       "applicants who defer should state the election and cite 10 CFR 51.50(b)(2), "
       "keeping optional economic content out of the licensing basis.")
d.para("Do not include in the ER (owner-controlled; cite, do not restate):",
       bold=True)
d.bullet("The underlying issue-by-issue analyses that the summary draws on (these "
         "reside in each resource's summary report), and the detailed cost "
         "workpapers behind any benefit-cost balance.")

d.heading("C.8.4  Status of Compliance and Federal Authorizations", 3)
d.para("Regulatory basis: 10 CFR 51.45(d). In the ER, provide:")
d.bullet("A list of every Federal permit, license, approval, and other "
         "entitlement the proposed action requires, using the matrix format of "
         "appendix A (statute, administering agency, authorization);")
d.bullet("For each, the status of the applicant's compliance or consultation "
         "(not started, initiated on a stated date, in progress, or complete);")
d.bullet("The status of compliance with applicable environmental quality "
         "standards and requirements, including zoning and land-use regulations "
         "and thermal and other water-pollution limitations; and")
d.bullet("A statement of whether each alternative evaluated in C.3 will comply "
         "with the same standards and requirements.")

d.heading("C.8.5  Adverse Information", 3)
d.para("Regulatory basis: 10 CFR 51.45(e). The information presented under C.1 "
       "through C.8.4 should not be confined to information supporting the "
       "proposed action; it should also include adverse information: data, "
       "impacts, or agency positions that weigh against the action or against a "
       "SMALL significance conclusion. Where adverse information exists, state it "
       "and the applicant's response; where a search found none for an issue, "
       "state that.")

d.heading("C.8.6  Review Interfaces", 3)
d.para("The summary draws on all of C.1 through C.7 and, for benefits, on the "
       "need-for-power (C.1.4) and alternatives-cost (C.3.4) elements. The "
       "compliance list in C.8.4 draws on the authorizations matrix in "
       "appendix A.")

# ---- C.9 -------------------------------------------------------------------
d.heading("C.9  References and Supporting Information", 2)
d.heading("C.9.1  Guidance", 3)
d.para("Provide a complete reference list. For owner-controlled documents "
       "incorporated by reference, identify each document, its revision status, "
       "the configuration-control mechanism, and the specific data or conclusion "
       "relied upon, so that the reference is auditable without importing the "
       "referenced document into the ER. This reference discipline keeps the "
       "licensing basis lean while ensuring every relied-upon fact is traceable.")
d.para("Right-sizing note: this section is itself the include/owner-controlled "
       "boundary in practice. The reference list is in the ER; the "
       "owner-controlled documents it cites are not reproduced in the ER.")
d.page_break()

# =============================================================================
# APPENDIX A — LAWS, REGULATIONS, AND OTHER AUTHORIZATIONS (NR GEIS App. F)
# =============================================================================
d.heading("APPENDIX A: LAWS, REGULATIONS, AND OTHER AUTHORIZATIONS", 1)
d.para("Derived from NR GEIS (NUREG-2249) Appendix F. This matrix identifies the "
       "principal Federal authorizations and consultations relevant to the ER and "
       "the ESP. State and local requirements vary by site and should be added by "
       "the applicant. The applicant should initiate consultations no later than "
       "the ER submittal, as their "
       "schedules often govern the environmental-review critical path.")
d.caption("Table A-1. Principal Laws, Administering Agencies, and Authorizations")
d.table(
    [
        ["Statute / Authority", "Administering Agency", "Applicability to the ER",
         "Required Authorization / Consultation"],
        ["National Environmental Policy Act", "NRC (lead)",
         "Framework for the entire ER and tiered EIS",
         "EIS tiered from NR GEIS"],
        ["Clean Water Act §401", "State agency / EPA",
         "Discharges to waters of the U.S.",
         "State water-quality certification"],
        ["Clean Water Act §402 (NPDES)", "EPA / delegated State",
         "Point-source discharges, including thermal",
         "NPDES permit"],
        ["Clean Water Act §404", "USACE",
         "Dredge/fill in waters and wetlands",
         "§404 permit; §401 certification"],
        ["Clean Air Act", "EPA / delegated State",
         "Construction and operational air emissions",
         "PSD / permit as applicable"],
        ["Endangered Species Act §7", "USFWS / NMFS",
         "Listed species and critical habitat (Cat. 2)",
         "Section 7 consultation; biological assessment"],
        ["Magnuson-Stevens Fishery Act", "NMFS",
         "Essential fish habitat (Cat. 2)",
         "EFH consultation"],
        ["National Historic Preservation Act §106", "SHPO/THPO; ACHP",
         "Historic and cultural resources (Cat. 2)",
         "Section 106 consultation"],
        ["Coastal Zone Management Act", "State coastal program",
         "Sites in or affecting the coastal zone",
         "Federal consistency determination"],
        ["Rivers and Harbors Act §10", "USACE",
         "Structures/work in navigable waters",
         "§10 permit"],
        ["Fish and Wildlife Coordination Act", "USFWS / NMFS",
         "Water-resource development effects",
         "Coordination/consultation"],
        ["Migratory Bird Treaty Act", "USFWS",
         "Effects on migratory birds",
         "Coordination; permits if applicable"],
    ],
    col_widths=[2400, 2000, 2500, 2460],
    header=True,
)
d.page_break()

# =============================================================================
# APPENDIX B — PLANT PARAMETER ENVELOPE AND SITE PARAMETER ENVELOPE (App. G)
# =============================================================================
d.heading("APPENDIX B: PLANT PARAMETER ENVELOPE AND SITE PARAMETER ENVELOPE", 1)
d.para("Derived from NR GEIS (NUREG-2249) Appendix G and the bounding parameters "
       "of 10 CFR Part 51, Appendix Table C-1. The applicant completes the "
       "'Proposed Value' and 'Bounded?' columns to demonstrate that Category 1 "
       "generic conclusions apply. Values shown are representative placeholders "
       "for a generic advanced-reactor site; the applicant should substitute the "
       "actual PPE/SPE values and, in each row, confirm the proposed value does "
       "not exceed the bounding value (for a maximum limit) or is not less than "
       "it (for a minimum, such as exclusion-area radius). Underlying engineering "
       "calculations remain owner-controlled and are incorporated by reference.")
d.caption("Table B-1. PPE/SPE Bounding Demonstration Template")
d.table(
    [
        ["Parameter", "Units", "Bounding Value (PPE/SPE)",
         "Proposed Value", "Bounded? / Basis"],
        ["Rated thermal power (per site)", "MWt", "[bounding]", "[proposed]",
         "[Yes, per ref. calc.]"],
        ["Cooling system type", "N/A", "Closed-cycle / dry", "[proposed]",
         "[Yes]"],
        ["Consumptive water use", "gpm", "[bounding]", "[proposed]", "[Yes]"],
        ["Circulating-water flow", "gpm", "[bounding]", "[proposed]", "[Yes]"],
        ["Thermal discharge temperature", "°F", "[bounding]", "[proposed]",
         "[Yes]"],
        ["Land disturbed (permanent)", "acres", "[bounding]", "[proposed]",
         "[Yes]"],
        ["Peak construction workforce", "workers", "[bounding]", "[proposed]",
         "[Yes]"],
        ["Operations workforce", "workers", "[bounding]", "[proposed]", "[Yes]"],
        ["Annual gaseous effluent (dose)", "mrem/yr", "[bounding]", "[proposed]",
         "[Yes]"],
        ["Annual liquid effluent (dose)", "mrem/yr", "[bounding]", "[proposed]",
         "[Yes]"],
        ["Exclusion area radius", "m", "[SPE min]", "[proposed]", "[Yes]"],
        ["Population density (LPZ)", "persons/mi²", "[SPE max]", "[proposed]",
         "[Yes]"],
        ["Design-basis seismic (PGA)", "g", "[SPE bounding]", "[proposed]",
         "[Yes]"],
        ["Ambient air-quality attainment", "N/A", "Attainment area", "[proposed]",
         "[Yes]"],
    ],
    col_widths=[2600, 900, 2100, 1760, 2000],
    header=True,
)
d.page_break()

# =============================================================================
# APPENDIX C — GREENHOUSE-GAS EMISSIONS ESTIMATION METHODOLOGY (App. H)
# =============================================================================
d.heading("APPENDIX C: GREENHOUSE-GAS EMISSIONS ESTIMATION METHODOLOGY", 1)
d.para("Derived from NR GEIS (NUREG-2249) Appendix H. This appendix outlines a "
       "lifecycle approach to estimating greenhouse-gas (GHG) emissions for the "
       "proposed action and for comparison with alternatives (C.3, C.5.6).")
d.heading("C-1  Lifecycle Phases", 2)
d.para("Estimate emissions across the full lifecycle:")
d.bullet("Upstream: materials production and fuel-cycle front end (mining, "
         "conversion, enrichment, fabrication);")
d.bullet("Construction: site preparation, materials, and equipment;")
d.bullet("Operations: direct emissions, backup power, and maintenance;")
d.bullet("Fuel-cycle back end: spent-fuel management; and")
d.bullet("Decommissioning: dismantling and waste disposition.")
d.heading("C-2  Emission Categories and Method", 2)
d.para("Express results as CO2-equivalent (CO2e) using standard global-warming "
       "potentials. For each phase, multiply activity data by an emission factor. "
       "Present a lifecycle total (e.g., g CO2e/kWh) and compare it with the "
       "alternatives evaluated in C.3.")
d.caption("Table C-1. GHG Estimation Framework by Lifecycle Phase")
d.table(
    [
        ["Lifecycle Phase", "Primary Emission Sources", "Activity Data",
         "Method / Emission Factor"],
        ["Upstream / fuel front end", "Mining, enrichment, fabrication energy",
         "Fuel mass; enrichment SWU", "Published fuel-cycle CO2e factors"],
        ["Construction", "Concrete, steel, diesel equipment",
         "Material quantities; equipment-hours", "Material & fuel CO2e factors"],
        ["Operations", "Backup generators, SF6, maintenance",
         "Fuel use; leakage rates", "Fuel & GWP-weighted factors"],
        ["Fuel back end", "Spent-fuel handling/storage energy",
         "Storage energy demand", "Energy CO2e factors"],
        ["Decommissioning", "Equipment fuel, waste transport",
         "Equipment-hours; transport", "Fuel CO2e factors"],
    ],
    col_widths=[2200, 2400, 2200, 2160],
    header=True,
)
d.para("Present the lifecycle totals and the comparison table in the ER; keep the "
       "detailed activity data and emission-factor sources in owner-controlled "
       "documents.")
d.page_break()

# =============================================================================
# APPENDIX D — SEVERE-ACCIDENT ANALYSIS FRAMEWORK (App. I)
# =============================================================================
d.heading("APPENDIX D: SEVERE-ACCIDENT ANALYSIS FRAMEWORK", 1)
d.para("Derived from NR GEIS (NUREG-2249) Appendix I. This appendix summarizes the "
       "probability-weighted consequence framework for evaluating severe accidents "
       "and severe-accident mitigation alternatives (C.5.7).")
d.heading("D-1  Analytical Elements", 2)
d.bullet("", segments=[bold("Accident frequencies"), ": core-damage frequency "
         "(CDF) and large-early-release frequency (LERF) from the design PRA, "
         "bounded by the PPE where the ER relies on generic conclusions."])
d.bullet("", segments=[bold("Source terms"), ": release magnitudes and timing "
         "for the modeled release categories."])
d.bullet("", segments=[bold("Atmospheric dispersion"), ": site meteorology used "
         "to model transport (a site-specific input)."])
d.bullet("", segments=[bold("Population and dose"), ": surrounding population "
         "distribution used to compute population dose (a site-specific input)."])
d.bullet("", segments=[bold("Consequences"), ": probability-weighted health and "
         "economic consequences (person-rem; offsite cost)."])
d.heading("D-2  Severe-Accident Mitigation Alternatives", 2)
d.para("Evaluate severe-accident mitigation design alternatives (SAMDAs) / "
       "alternatives (SAMAs) by monetizing the averted risk (benefit) using the "
       "applicable NRC dollar-per-person-rem conversion factor and "
       "comparing it to the implementation cost of each candidate. An alternative "
       "is identified as potentially cost-beneficial when its monetized averted "
       "risk exceeds its implementation cost. When the design's CDF, LERF, and "
       "source term are bounded by the PPE, the ER cites the generic analysis and "
       "supplies only the two site-specific inputs: the atmospheric dispersion "
       "factors (chi/Q) and the surrounding population.")
d.caption("Table D-1. Severe-Accident Analysis Inputs and Source")
d.table(
    [
        ["Input", "Nature", "Source", "In ER or Owner-Controlled?"],
        ["CDF / LERF", "Design", "Design PRA (bounded by PPE)",
         "Conclusion in ER; PRA owner-controlled"],
        ["Source terms", "Design", "Design analysis",
         "Summary in ER; detail owner-controlled"],
        ["Meteorology", "Site-specific", "Site met. data",
         "Result in ER; data owner-controlled"],
        ["Population", "Site-specific", "Census/projections",
         "Result in ER; data owner-controlled"],
        ["Consequences", "Computed", "Consequence code",
         "Results in ER"],
    ],
    col_widths=[1900, 1800, 2400, 2860],
    header=True,
)
d.page_break()

# =============================================================================
# APPENDIX E — NUREG-1555 CROSS-REFERENCE MATRIX
# =============================================================================
d.heading("APPENDIX E: NUREG-1555 (ESRP) CROSS-REFERENCE MATRIX", 1)
d.para("This matrix maps each ER section to the applicable NUREG-1555 Environmental "
       "Standard Review Plan (ESRP) sections and the principal acceptance criteria "
       "the NRC staff apply. Use it to anticipate the staff review and to confirm "
       "the ER addresses each acceptance criterion.")
d.caption("Table E-1. ER Section to NUREG-1555 ESRP Cross-Reference")
d.table(
    [
        ["ER Section", "NUREG-1555 ESRP", "Principal Acceptance Criteria"],
        ["C.1 Introduction / Purpose & Need", "1.1–1.3; 8.4 (optional)",
         "10 CFR 51.45(b),(d); 51.50(b); 51.75(b)"],
        ["C.2 Proposed Action: Site & Plant", "2.1, 2.2, 3.1",
         "10 CFR 51.45(b), 51.50(b); RG 4.7 factors"],
        ["C.3 Alternatives", "9.1, 9.2 (incl. 9.2.3), 9.3, 9.4",
         "40 CFR 1502.14; 10 CFR 51.45(b)(3), App. A"],
        ["C.4 Affected Environment", "2.3–2.8",
         "10 CFR 51.45(b), 51.50(b)"],
        ["C.5 Environmental Consequences", "4.1–4.6; 5.1–5.11",
         "10 CFR 51.45(b)(1),(2),(c); Cat. 1/2 tables"],
        ["C.6 Cumulative Effects", "7.1–7.5",
         "40 CFR 1508.1(g)(3); 10 CFR 51.45"],
        ["C.7 Monitoring", "6.1 and related",
         "10 CFR 51.45(b)"],
        ["C.8 Summary & Conclusions", "10.1–10.4 (incl. 10.4.2)",
         "10 CFR 51.45(b)(1)-(5),(c); 51.75(b)"],
        ["C.9 References", "N/A", "10 CFR 51.45; incorporation-by-reference"],
    ],
    col_widths=[2900, 2400, 3560],
    header=True,
)
d.page_break()

# =============================================================================
# APPENDIX F — CATEGORY 2 ISSUES (NR GEIS Table 1-1 / Table 4-1)
# =============================================================================
d.heading("APPENDIX F: CATEGORY 2 ISSUES REQUIRING PROJECT-SPECIFIC ANALYSIS", 1)
d.para("Derived from NR GEIS (NUREG-2249) Section 1.3.3 and Tables 1-1 and 4-1. "
       "The NR GEIS classifies 100 environmental issues as Category 1 (resolved "
       "generically when the PPE/SPE assumptions are met) and 17 as Category 2 "
       "(requiring project-specific analysis in the ER and SEIS). The Category 2 "
       "issues fall into three groups, per NR GEIS Section 1.3.3.2. The applicant "
       "must address every applicable Category 2 issue in the ER; the "
       "authoritative and complete list, with the GEIS section where each is "
       "discussed, is NR GEIS Table 1-1 (and Table 4-1 for the non-resource "
       "issues). Per the GEIS, this list is not all-inclusive: 10 CFR Part 51 and "
       "RG 4.2 identify additional information that must be included in an "
       "application.")

d.heading("F-1  Resource-Specific Category 2 Issues", 2)
d.para("Issues tied to a specific environmental resource, described in the "
       "applicable section of NR GEIS Chapter 3 and addressed in ER section "
       "C.5.5. These typically include:")
d.bullet("Surface-water-quality impacts from chemical and thermal discharges;")
d.bullet("Thermal impacts on aquatic biota;")
d.bullet("Impingement, entrainment, and other cooling-water intake and discharge "
         "effects;")
d.bullet("Impacts on Endangered Species Act (ESA) listed terrestrial species and "
         "designated critical habitat;")
d.bullet("Impacts on ESA-listed and Magnuson-Stevens-managed aquatic species and "
         "essential fish habitat;")
d.bullet("Effects on historic and cultural resources requiring National Historic "
         "Preservation Act Section 106 consultation.")

d.heading("F-2  Category 2 Issues Applying Across Resources", 2)
d.para("Issues that apply across all resources, per NR GEIS Section 1.3.3.2.2:")
d.bullet("", segments=[bold("Climate-change impacts on environmental resources"),
         ": the incremental effect of the proposed action on each resource "
         "evaluated under a baseline altered by climate change; location-specific "
         "and therefore not generically resolvable (ER section C.5.5)."])
d.bullet("", segments=[bold("Cumulative effects"), ": the incremental effect of "
         "the proposed action added to other past, present, and reasonably "
         "foreseeable actions; evaluated project-specifically (ER section C.6)."])

d.heading("F-3  Non-Resource-Related (Project-Specific) Category 2 Issues", 2)
d.para("Project-specific issues not tied to a single resource, required by "
       "10 CFR Part 51 and RG 4.2 and summarized in NR GEIS Table 4-1:")
d.bullet("", segments=[bold("Purpose and need"), " for the proposed action "
         "(ER section C.1);"])
d.bullet("", segments=[bold("Need for power"), " or, for non-electric reactors, "
         "need for the project (ER section C.1.4; optional at ESP per "
         "10 CFR 51.50(b)(2));"])
d.bullet("", segments=[bold("Alternatives"), " to the proposed action, including "
         "site, energy, and system-design alternatives (ER section C.3)."])
d.para("Because 10 CFR 51.50(b)(2) lets an ESP applicant defer need-for-power, "
       "benefit-cost, and alternative-energy-source content, some F-3 issues may "
       "be deferred at the ESP stage; see ER section B.2.")

d.heading("F-4  Complete Category 2 Issue List (NR GEIS Table 1-1)", 2)
d.para("The 17 Category 2 issues, transcribed from NR GEIS Table 1-1 with the "
       "GEIS section where each is discussed. Environmental justice is not "
       "included as an ER content requirement in this playbook: Regulatory Guide "
       "4.2, Revision 4 (April 2026) removed environmental justice from the ER "
       "format and content following the rescission of Executive Order 12898. The "
       "NR GEIS, issued earlier, still references environmental justice; applicants "
       "should follow the current Regulatory Guide.")
d.caption("Table F-1. The 17 Category 2 Issues")
d.table(
    [
        ["#", "Category 2 Issue", "NR GEIS Section", "ER Section"],
        ["1", "Surface water quality degradation due to chemical and thermal "
         "discharges", "3.4.2.2.7", "C.5.5"],
        ["2", "Terrestrial important species and habitats regulated under the ESA "
         "(construction)", "3.5.2.1.6", "C.5.5"],
        ["3", "Terrestrial important species and habitats regulated under the ESA "
         "(operation)", "3.5.2.2.10", "C.5.5"],
        ["4", "Aquatic important species and habitats regulated under the ESA and "
         "Magnuson-Stevens Act (construction)", "3.6.2.1.4", "C.5.5"],
        ["5", "Thermal impacts on aquatic biota", "3.6.2.2.7", "C.5.5"],
        ["6", "Other effects of cooling-water discharges on aquatic biota",
         "3.6.2.2.8", "C.5.5"],
        ["7", "Aquatic important species and habitats regulated under the ESA and "
         "Magnuson-Stevens Act (operation)", "3.6.2.2.10", "C.5.5"],
        ["8", "Construction impacts on historic and cultural resources", "3.7.2",
         "C.5.5"],
        ["9", "Operation impacts on historic and cultural resources", "3.7.2",
         "C.5.5"],
        ["10", "Decommissioning impacts (site-specific and conditional issues per "
         "NUREG-0586)", "3.16.2", "C.5.5"],
        ["11", "Climate-change impacts on environmental resources", "1.3.3.2.2",
         "C.5.5"],
        ["12", "Cumulative impacts", "1.3.3.2.2", "C.6"],
        ["13", "Purpose and need", "1.3.3.2.3", "C.1"],
        ["14", "Need for power", "1.3.3.2.3", "C.1.4"],
        ["15", "Site alternatives", "1.3.3.2.3", "C.3"],
        ["16", "Energy alternatives", "1.3.3.2.3", "C.3"],
        ["17", "System design alternatives", "1.3.3.2.3", "C.3"],
    ],
    col_widths=[500, 5200, 1560, 1600],
    header=True,
)
d.page_break()

# =============================================================================
# APPENDIX G — MASTER CHECKLIST
# =============================================================================
d.heading("APPENDIX G: MASTER PREPARATION CHECKLIST", 1)
d.para("Every element the ESP ER must contain, drawn from 10 CFR Part 51, "
       "NUREG-1555, RG 4.2, and the NR GEIS. Because the regulator makes the "
       "decision on the ER, every element listed here is stated in the ER; the "
       "Type column is “Decision basis (in ER)” for all of them. The "
       "owner-controlled documents hold only the underlying records these "
       "elements rest on, which the ER cites but does not reproduce. Items "
       "marked “(ESP-optional)” may be "
       "deferred under 10 CFR 51.50(b)(2); if deferred, state the election and "
       "cite the rule.")
d.caption("Table G-1. Master ER Preparation Checklist")
d.table(
    [
        ["#", "Required element", "Source", "ER section", "Type"],
        ["1", "Separate document titled “Applicant’s Environmental "
         "Report, Early Site Permit Stage”", "10 CFR 51.50(b)", "Cover",
         "Decision basis"],
        ["2", "Description of the proposed action and statement of purpose",
         "10 CFR 51.45(b)", "C.1", "Decision basis"],
        ["3", "Purpose and need statement", "GEIS 1.3.3.2.3", "C.1", "Decision basis"],
        ["4", "Need for power / need for the project (ESP-optional)",
         "10 CFR 51.50(b)(2)", "C.1.4", "Decision basis"],
        ["5", "PPE/SPE bounding demonstration (Table B-1)", "GEIS App. G",
         "C.2, App. B", "Decision basis"],
        ["6", "Site description and RG 4.7 suitability (six factors)", "RG 4.7",
         "C.2.4", "Decision basis"],
        ["7", "Alternative-sites analysis and obviously-superior determination",
         "10 CFR 51.50(b)(1)", "C.3", "Decision basis"],
        ["8", "Energy and system-design alternatives", "10 CFR 51.45(b)(3)",
         "C.3", "Decision basis"],
        ["9", "Alternative-energy-source cost comparison (ESP-optional)",
         "10 CFR 51.50(b)(2)", "C.3.4", "Decision basis"],
        ["10", "Affected environment for every resource area (site + offsite "
         "corridors)", "10 CFR 51.45(b); RG 4.2 Ch. 2", "C.4",
         "Decision basis"],
        ["11", "Category 1 findings by bounding, each with Table B-1 comparison",
         "GEIS Ch. 3", "C.5.4", "Decision basis"],
        ["12", "New-and-significant-information test result per Category 1 issue",
         "GEIS 1.3.3.1", "B.4", "Decision basis"],
        ["13", "Category 2 site-specific analyses (the 17 issues)", "GEIS Table 1-1",
         "C.5.5, App. F", "Decision basis"],
        ["14", "Construction-phase impacts, incl. construction-worker dose",
         "RG 4.2 4.9.4; ESRP 4.6", "C.5", "Decision basis"],
        ["15", "Operation-phase impacts, incl. cooling-system intake/discharge/"
         "thermal", "ESRP 5.3", "C.5", "Decision basis"],
        ["16", "Electromagnetic-fields treatment", "RG 4.2 2.8.4/8.4", "C.4",
         "Decision basis"],
        ["17", "Uranium fuel cycle (Table S-3; non-LWR basis)",
         "10 CFR 51.51; 51.50(b)(3)", "C.5.8", "Decision basis"],
        ["18", "Transportation of fuel and waste (Table S-4)", "10 CFR 51.52",
         "C.5.8", "Decision basis"],
        ["19", "Greenhouse-gas lifecycle emissions and comparison", "GEIS 3.3.2",
         "C.5.6, App. C", "Decision basis"],
        ["20", "Design-basis and severe accidents; SAMDAs", "GEIS App. I",
         "C.5.7, App. D", "Decision basis"],
        ["21", "Cumulative effects", "GEIS 1.3.3.2.2", "C.6", "Decision basis"],
        ["22", "Climate-change impacts on resources", "GEIS 1.3.3.2.2", "C.5.5",
         "Decision basis"],
        ["23", "Environmental monitoring programs and proposed permit conditions",
         "10 CFR 51.50(b)(4)", "C.7", "Decision basis"],
        ["24", "Unavoidable adverse impacts", "10 CFR 51.45(b)(2)", "C.8",
         "Decision basis"],
        ["25", "Short-term uses vs. long-term productivity", "10 CFR 51.45(b)(4)",
         "C.8", "Decision basis"],
        ["26", "Irreversible and irretrievable commitments", "10 CFR 51.45(b)(5)",
         "C.8", "Decision basis"],
        ["27", "Benefit-cost balance (ESP-optional)", "10 CFR 51.45(c)",
         "C.8.3", "Decision basis"],
        ["28", "Status of compliance and Federal authorizations list",
         "10 CFR 51.45(d)", "C.8.4, App. A", "Decision basis"],
        ["29", "Adverse information", "10 CFR 51.45(e)", "C.8.5", "Decision basis"],
        ["30", "References and incorporation-by-reference discipline",
         "10 CFR 51.45", "C.9", "Decision basis"],
    ],
    col_widths=[450, 3900, 2050, 1250, 1210],
    header=True,
)
d.page_break()

# =============================================================================
# APPENDIX H — SUMMARY REPORTS
# =============================================================================
d.heading("APPENDIX H: SUMMARY REPORTS AND THE THREE-LAYER MODEL", 1)
d.para("This appendix defines the summary-report tier introduced in Section B.7. "
       "Each ER section is drawn from a topic summary report; the summary report "
       "carries the trace to the owner-controlled documents. Nothing is authored "
       "for the first time in the ER.")

d.heading("H-1  Summary-Report Template", 2)
d.para("Each summary report contains the following parts. The ER section is this "
       "report with Part 6 (the owner-controlled-document list) removed.")
d.numbered("Topic and ER chapter. The single ER chapter (C.1 through C.8) this "
           "report maps to. A report maps to exactly one chapter.")
d.numbered("Issue category. Whether the topic is Category 1 (resolved by "
           "PPE/SPE bounding against the NR GEIS) or Category 2 (project-specific "
           "analysis), per appendix F.")
d.numbered("Conclusion. The finding for the topic: for Category 1, the bounding "
           "result and the GEIS significance level; for Category 2, the "
           "significance level (SMALL/MODERATE/LARGE per C.5.3) and the "
           "quantitative result.")
d.numbered("Basis. The method and the values supporting the conclusion, stated "
           "so each traces to a listed owner-controlled document.")
d.numbered("Acceptance-test results. The binary acceptance tests for the "
           "mapped ESRP section (Section C), each marked met or not met.")
d.numbered("Owner-controlled documents. The list of owner-controlled documents "
           "the conclusion and basis rest on, each with its title, revision, and "
           "configuration-control mechanism. THIS PART IS OMITTED FROM THE ER "
           "SECTION and retained in the summary report.")

d.heading("H-2  Summary-Report Set", 2)
d.para("The 20 summary reports and the single ER chapter each maps to. "
       "Affected-environment (C.4) baseline reports and environmental-"
       "consequences (C.5) impact reports are separate reports for the same "
       "resource, so no report spans two chapters.")
d.caption("Table H-1. Summary Reports Mapped to ER Chapters")
d.table(
    [
        ["#", "Summary report", "ER chapter"],
        ["1", "Purpose and Need", "C.1"],
        ["2", "Site Description", "C.2"],
        ["3", "Plant Description (PPE)", "C.2"],
        ["4", "Alternatives", "C.3"],
        ["5", "Land Use (baseline)", "C.4"],
        ["6", "Water Resources (baseline)", "C.4"],
        ["7", "Terrestrial Ecology (baseline)", "C.4"],
        ["8", "Aquatic Ecology (baseline)", "C.4"],
        ["9", "Socioeconomics (baseline)", "C.4"],
        ["10", "Historic and Cultural Resources (baseline)", "C.4"],
        ["11", "Air and Meteorology (baseline)", "C.4"],
        ["12", "Geology (baseline)", "C.4"],
        ["13", "Noise, Transportation, and Health (baseline)", "C.4"],
        ["14", "Construction Impacts", "C.5"],
        ["15", "Operations Impacts", "C.5"],
        ["16", "Fuel Cycle and Transportation", "C.5"],
        ["17", "Greenhouse-Gas Emissions", "C.5"],
        ["18", "Postulated and Severe Accidents", "C.5"],
        ["19", "Cumulative Effects", "C.6"],
        ["20", "Environmental Monitoring", "C.7"],
    ],
    col_widths=[500, 5900, 1600],
    header=True,
)
d.para("The Summary and Conclusions chapter (C.8) synthesizes the conclusions of "
       "the reports above and needs no separate topic report; References (C.9) "
       "compiles the citations.")
d.page_break()

# =============================================================================
# APPENDIX I — COMPLETE NR GEIS TABLE 1-1 (all 117 issues)
# =============================================================================
d.heading("APPENDIX I: COMPLETE NR GEIS ISSUE LIST (TABLE 1-1)", 1)
d.para("Transcribed from NR GEIS (NUREG-2249) Table 1-1: all environmental issues "
       "with the GEIS section where each is discussed and its category. This is "
       "the complete classification (100 Category 1 issues, 17 Category 2 issues, "
       "and 2 electromagnetic-field entries marked not applicable). For every "
       "Category 1 issue the applicant must still demonstrate that the governing "
       "PPE/SPE values are met for that issue and confirm no new and significant "
       "information (B.4); for every Category 2 issue the applicant must provide a "
       "project-specific analysis (C.5.5, appendix F). Category value shown as "
       "reported in Table 1-1.")
_grp = None
for r in TABLE11:
    if r["group"] != _grp:
        _grp = r["group"]
        d.para(_grp, bold=True, before=100, after=20)
    phase = f"[{r['phase']}] " if r["phase"] else ""
    cat = r["category"]
    catlbl = ("Category 1" if cat == "1" else
              "Category 2" if cat == "2" else "N/A")
    d.bullet("", segments=[(f"{phase}{r['issue']} ", {}),
             (f"(GEIS {r['section']}; {catlbl})", {"bold": True})])

# ---- SAVE ------------------------------------------------------------------
OUT = "/Users/partha/Library/CloudStorage/OneDrive-AaloAtomics/Documents/Aalo/2026.07.17_ER/ER_Guidance_Document.docx"
d.save(OUT)
print("Saved:", OUT)
print("Body elements:", len(d.body))
