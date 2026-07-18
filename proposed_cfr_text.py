#!/usr/bin/env python3
"""
proposed_cfr_text.py — verbatim proposed-rule text for the CFR boxes that the
proposed rule (2026-13687) materially changes, for the tracked-changes edition.
Each string is sourced from the proposed-rule PDF (page indices noted), not
paraphrased. Long sections are captured to the ESP-relevant operative
subsections with an explicit bracketed ellipsis for omitted downstream text.
Paragraphs are separated by '||' to match the quote() box renderer.
"""

# § 51.45 "Environmental report and information" (retitled + expanded), proposed
# rule pp.25-26. ESP-relevant operative subsections (a),(a)(1),(a)(2),(b); (c)+
# downstream omitted with a marked ellipsis.
PROPOSED_51_45 = {
    "title": "§ 51.45 Environmental report and information.",
    "text": (
        "(a) Unless the applicant or petitioner for rulemaking believes its "
        "application or petition is subject to a categorical exclusion, each "
        "applicant or petitioner for rulemaking must submit with its application "
        "or petition for rulemaking one signed original of a separate document "
        "entitled “Applicant’s” or “Petitioner’s "
        "Environmental Report,” as appropriate. An applicant or petitioner "
        "for rulemaking may submit a supplement to an environmental report at any "
        "time."
        "||"
        "(2) An environmental report or supplement to an environmental report "
        "must contain environmental information necessary for the NRC to prepare "
        "an environmental assessment in accordance with the procedures in "
        "§§ 51.30, 51.31, and 51.32 of this part, or an environmental "
        "impact statement in accordance with the procedures in §§ 51.70 "
        "and 51.71 of this part. An environmental report for a production and "
        "utilization facility, other than environmental reports for standard "
        "design certifications or manufacturing licenses under part 52 or part 53 "
        "of this chapter, must also address the matters specified in "
        "§§ 51.51, 51.52, 51.75, 51.76, and 51.95 of this part, as "
        "applicable. An environmental report must also include information "
        "relevant to NRC’s statutory compliance obligations under statutes, "
        "including but not limited to the Endangered Species Act, Magnuson-Stevens "
        "Fishery Conservation and Management Act, National Historic Preservation "
        "Act, Clean Air Act, Clean Water Act, National Marine Sanctuaries Act, and "
        "Marine Mammal Protection Act."
        "||"
        "(b) Applicants and petitioners for rulemaking who believe that a "
        "categorical exclusion applies to their application or petition must "
        "include in their application or petition a justification for the "
        "application of a categorical exclusion."
        "||"
        "[Subsections (c) and following, and other paragraphs of § 51.45, are "
        "omitted here; consult the proposed rule for the full text.]"
    ),
}

# ESP-stage environmental document, proposed § 51.75(b) (successor to the ER
# provisions formerly at § 51.50(b)), proposed rule p.31 (verbatim).
PROPOSED_51_75b = {
    "title": "§ 51.75(b) Early site permit stage.",
    "text": (
        "If an environmental document is required under § 51.20 of this part "
        "in connection with issuance of an early site permit for a production or "
        "utilization facility, the environmental document must meet the "
        "requirements of this paragraph. The contribution of the environmental "
        "effects of the uranium fuel cycle activities specified in § 51.51 of "
        "this part must be evaluated on the basis of impact values set forth in "
        "Table S–3, Table of Uranium Fuel Cycle Environmental Data, which "
        "must be set out in the environmental document. With the exception of "
        "radon-222 and technetium-99 releases, no further discussion of fuel cycle "
        "release values and other numerical data that appear explicitly in the "
        "table must be required. The environmental document must take account of "
        "dose commitments and health effects from fuel cycle effluents set forth "
        "in Table S–3 and other fuel cycle impacts within the NRC’s "
        "statutory authority as may reasonably appear significant."
        "||"
        "The environmental document must also include an evaluation of the "
        "environmental effects of construction and operation of a reactor, or "
        "reactors, which have design characteristics that fall within the site "
        "characteristics and design parameters for the early site permit "
        "application, but only to the extent addressed in the early site permit "
        "environmental report. For other than light-water-cooled nuclear power "
        "reactors, the environmental document will address the basis for "
        "evaluating the contribution of the environmental effects of fuel cycle "
        "activities for the nuclear power reactor. The environmental document will "
        "also consider the applicant’s procedures for reporting and keeping "
        "records of environmental data, and any conditions and monitoring "
        "requirements for protecting the non-aquatic environment, that will be "
        "included in the license as environmental conditions in accordance with "
        "§ 50.36b of this chapter."
    ),
}

# § 51.51 (Table S-3), proposed rule p.27 (verbatim; the "on or after
# September 4, 1979" caveat is removed and it is now keyed to § 51.45(a)).
PROPOSED_51_51 = {
    "title": "§ 51.51 Uranium fuel cycle environmental data—Table S–3.",
    "text": (
        "(a) Every environmental report submitted in accordance with "
        "§ 51.45(a) of this part for the construction permit stage or early "
        "site permit stage or combined license stage of a light-water-cooled "
        "nuclear power reactor, must take Table S–3, Table of Uranium Fuel "
        "Cycle Environmental Data, as the basis for evaluating the contribution of "
        "the environmental effects of uranium mining and milling, the production "
        "of uranium hexafluoride, isotopic enrichment, fuel fabrication, "
        "reprocessing of irradiated fuel, transportation of radioactive materials "
        "and management of low-level wastes and high-level wastes related to "
        "uranium fuel cycle activities to the environmental costs of licensing the "
        "nuclear power reactor. Table S–3 must be included in the "
        "environmental report submitted in accordance with § 51.45(a) of this "
        "part and may be supplemented by a discussion of the environmental effects "
        "of the data set forth in the table as weighed in the analysis for the "
        "proposed facility."
        "||"
        "(b) Table S–3. [Table values unchanged; see the proposed rule.]"
    ),
}

PROPOSED = {
    "51.45": PROPOSED_51_45,
    "51.50b": PROPOSED_51_75b,   # keyed by the current box's data-key
    "51.51": PROPOSED_51_51,
}
LABEL_SUFFIX = " (proposed rule; NRC-2025-0478, RIN 3150-AL38, 91 FR, July 7 2026)"
