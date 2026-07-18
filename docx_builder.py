#!/usr/bin/env python3
"""
docx_builder.py — minimal OOXML .docx builder using only the Python standard library.

A .docx is a ZIP of XML parts. This module provides a small fluent builder for the
subset of Word features this guidance document needs:
  - Title page
  - Multi-level numbered / lettered headings (with a field-code Table of Contents)
  - Body paragraphs, bullet lists, numbered lists
  - Tables with header shading and fixed DXA column widths
  - Page breaks, page-number footer
  - US Letter page geometry

No third-party dependencies (network installs are blocked in this environment).
"""

import html
import zipfile
from xml.sax.saxutils import escape

# ---- namespaces / boilerplate parts -----------------------------------------

CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>"""

RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""

DOC_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>"""

SETTINGS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:updateFields w:val="true"/>
</w:settings>"""

CORE = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:title>Guidance for Developing an Environmental Report</dc:title>
  <dc:creator>Aalo Atomics</dc:creator>
</cp:coreProperties>"""

APP = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>docx_builder</Application>
</Properties>"""

FOOTER = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:jc w:val="center"/><w:rPr><w:sz w:val="18"/></w:rPr></w:pPr>
    <w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Page </w:t></w:r>
    <w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>
    <w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
    <w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>
  </w:p>
</w:ftr>"""


def _styles_xml():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="259" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="44"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle">
    <w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="28"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>
    <w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="32"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>
    <w:pPr><w:keepNext/><w:spacing w:before="200" w:after="100"/><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="26"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>
    <w:pPr><w:keepNext/><w:spacing w:before="160" w:after="80"/><w:outlineLvl w:val="2"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading4">
    <w:name w:val="heading 4"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>
    <w:pPr><w:keepNext/><w:spacing w:before="120" w:after="60"/><w:outlineLvl w:val="3"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:i/><w:sz w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="TOCHeading"><w:name w:val="TOC Heading"/><w:basedOn w:val="Heading1"/></w:style>
  <w:style w:type="paragraph" w:styleId="TOC1"><w:name w:val="toc 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="40"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="TOC2"><w:name w:val="toc 2"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="240"/><w:spacing w:after="40"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="TOC3"><w:name w:val="toc 3"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="480"/><w:spacing w:after="40"/></w:pPr></w:style>
  <w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/>
    <w:tblPr><w:tblBorders>
      <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    </w:tblBorders></w:tblPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Caption">
    <w:name w:val="caption"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="60" w:after="120"/><w:jc w:val="center"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="20"/></w:rPr>
  </w:style>
</w:styles>"""


def _numbering_xml(decimal_num_ids=(2,)):
    # abstractNumId 0: bullet list; 1: decimal numbered list.
    # numId 1 -> bullets. Each id in decimal_num_ids -> its own decimal list
    # instance (independent counter) so numbering restarts per list.
    nums = '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>'
    for nid in decimal_num_ids:
        # startOverride forces each num instance to restart its counter at 1.
        # Without it, multiple <w:num> sharing one abstractNum keep a single
        # running count across all lists (numbering does not restart).
        nums += (f'<w:num w:numId="{nid}"><w:abstractNumId w:val="1"/>'
                 f'<w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride>'
                 f'<w:lvlOverride w:ilvl="1"><w:startOverride w:val="1"/></w:lvlOverride>'
                 f'</w:num>')
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0"><w:numFmt w:val="bullet"/><w:lvlText w:val="&#8226;"/><w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
      <w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/></w:rPr></w:lvl>
    <w:lvl w:ilvl="1"><w:numFmt w:val="bullet"/><w:lvlText w:val="o"/><w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="1440" w:hanging="360"/></w:pPr>
      <w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/></w:rPr></w:lvl>
  </w:abstractNum>
  <w:abstractNum w:abstractNumId="1">
    <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl>
    <w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="lowerLetter"/><w:lvlText w:val="%2."/><w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="1440" w:hanging="360"/></w:pPr></w:lvl>
  </w:abstractNum>
  """ + nums + """
</w:numbering>"""


# ---- run / paragraph helpers -------------------------------------------------

def _esc(text):
    return escape(str(text))


def _run(text, bold=False, italic=False, size=None, color=None):
    rpr = []
    if bold:
        rpr.append("<w:b/>")
    if italic:
        rpr.append("<w:i/>")
    if size:
        rpr.append(f'<w:sz w:val="{size}"/>')
    if color:
        rpr.append(f'<w:color w:val="{color}"/>')
    rpr_xml = f"<w:rPr>{''.join(rpr)}</w:rPr>" if rpr else ""
    return f'<w:r>{rpr_xml}<w:t xml:space="preserve">{_esc(text)}</w:t></w:r>'


def runs_from_segments(segments):
    """segments: list of (text, {bold,italic,...}) or plain strings."""
    out = []
    for seg in segments:
        if isinstance(seg, str):
            out.append(_run(seg))
        else:
            text, opts = seg
            out.append(_run(text, **opts))
    return "".join(out)


class DocxBuilder:
    def __init__(self):
        self.body = []
        # Numbered-list tracking: each contiguous run of numbered() calls is one
        # list with its own numId so the decimal counter restarts per list.
        # numId 1 = bullets (shared; running count is invisible for bullets).
        # numId 2.. = decimal lists, one per contiguous numbered() run, allocated
        # on demand. _num_ids collects the allocated decimal numIds for the
        # numbering.xml <w:num> entries.
        self._last_was_numbered = False
        self._cur_num_id = None
        self._next_num_id = 2
        self._num_ids = []

    # -- primitives --
    def para(self, text="", style=None, bold=False, italic=False, size=None,
             align=None, before=None, after=None, segments=None):
        self._last_was_numbered = False
        ppr = []
        if style:
            ppr.append(f'<w:pStyle w:val="{style}"/>')
        if align:
            ppr.append(f'<w:jc w:val="{align}"/>')
        spacing = []
        if before is not None:
            spacing.append(f'w:before="{before}"')
        if after is not None:
            spacing.append(f'w:after="{after}"')
        if spacing:
            ppr.append(f'<w:spacing {" ".join(spacing)}/>')
        ppr_xml = f"<w:pPr>{''.join(ppr)}</w:pPr>" if ppr else ""
        if segments is not None:
            runs = runs_from_segments(segments)
        else:
            runs = _run(text, bold=bold, italic=italic, size=size) if text != "" else ""
        self.body.append(f"<w:p>{ppr_xml}{runs}</w:p>")
        return self

    def heading(self, text, level=1, segments=None):
        self.para(text, style=f"Heading{level}", segments=segments)
        return self

    def title(self, text):
        self.para(text, style="Title")
        return self

    def subtitle(self, text):
        self.para(text, style="Subtitle")
        return self

    def bullet(self, text, level=0, segments=None):
        self._last_was_numbered = False
        ppr = (f'<w:pPr><w:pStyle w:val="Normal"/>'
               f'<w:numPr><w:ilvl w:val="{level}"/><w:numId w:val="1"/></w:numPr>'
               f'<w:spacing w:after="60"/></w:pPr>')
        runs = runs_from_segments(segments) if segments is not None else _run(text)
        self.body.append(f"<w:p>{ppr}{runs}</w:p>")
        return self

    def numbered(self, text, level=0, segments=None):
        # Start a new list (fresh numId, counter restarts at 1) whenever the
        # previous appended paragraph was not itself a numbered item.
        if not self._last_was_numbered:
            self._cur_num_id = self._next_num_id
            self._num_ids.append(self._cur_num_id)
            self._next_num_id += 1
        self._last_was_numbered = True
        ppr = (f'<w:pPr><w:pStyle w:val="Normal"/>'
               f'<w:numPr><w:ilvl w:val="{level}"/><w:numId w:val="{self._cur_num_id}"/></w:numPr>'
               f'<w:spacing w:after="60"/></w:pPr>')
        runs = runs_from_segments(segments) if segments is not None else _run(text)
        self.body.append(f"<w:p>{ppr}{runs}</w:p>")
        return self

    def quote(self, text, label=None):
        """Verbatim quoted block: indented, light-shaded, left border, small font.
        Paragraphs are split on '||'. Optional bold label line above."""
        self._last_was_numbered = False
        if label:
            self.body.append(
                '<w:p><w:pPr><w:spacing w:before="120" w:after="20"/></w:pPr>'
                f'<w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr>'
                f'<w:t xml:space="preserve">{_esc(label)}</w:t></w:r></w:p>'
            )
        paras = [p.strip() for p in str(text).split("||") if p.strip()]
        n = len(paras)
        for i, p in enumerate(paras):
            top = "single" if i == 0 else "nil"
            bot = "single" if i == n - 1 else "nil"
            ppr = (
                '<w:pPr>'
                '<w:pBdr>'
                f'<w:top w:val="{top}" w:sz="4" w:space="2" w:color="AAAAAA"/>'
                '<w:left w:val="single" w:sz="18" w:space="6" w:color="9BB7D4"/>'
                f'<w:bottom w:val="{bot}" w:sz="4" w:space="2" w:color="AAAAAA"/>'
                '<w:right w:val="single" w:sz="4" w:space="4" w:color="AAAAAA"/>'
                '</w:pBdr>'
                '<w:shd w:val="clear" w:color="auto" w:fill="F2F5F8"/>'
                '<w:ind w:left="360" w:right="180"/>'
                '<w:spacing w:after="0" w:line="240" w:lineRule="auto"/>'
                '</w:pPr>'
            )
            self.body.append(
                f'<w:p>{ppr}<w:r><w:rPr><w:sz w:val="18"/></w:rPr>'
                f'<w:t xml:space="preserve">{_esc(p)}</w:t></w:r></w:p>'
            )
        self.body.append('<w:p><w:pPr><w:spacing w:after="60"/></w:pPr></w:p>')
        return self

    def page_break(self):
        self._last_was_numbered = False
        self.body.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
        return self

    def spacer(self, count=1):
        self._last_was_numbered = False
        for _ in range(count):
            self.body.append("<w:p/>")
        return self

    def caption(self, text):
        self.para(text, style="Caption")
        return self

    # -- table of contents (field code; updates on open) --
    def toc(self, heading="TABLE OF CONTENTS"):
        self.para(heading, style="Heading1")
        self.body.append(
            '<w:p><w:pPr><w:pStyle w:val="TOC1"/></w:pPr>'
            '<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
            '<w:r><w:instrText xml:space="preserve"> TOC \\o "1-3" \\h \\z \\u </w:instrText></w:r>'
            '<w:r><w:fldChar w:fldCharType="separate"/></w:r>'
            '<w:r><w:t xml:space="preserve">This table of contents updates automatically '
            'when the document is opened. If it does not, select it and press F9 '
            '(or right-click and choose "Update Field").</w:t></w:r>'
            '<w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>'
        )
        return self

    # -- table --
    def table(self, rows, col_widths, header=True, header_shade="D9D9D9",
              font_size=18, first_col_bold=False):
        """
        rows: list of rows; each row is a list of cell contents. A cell is either a
              string or a list of strings (multiple paragraphs).
        col_widths: list of DXA ints summing to the table width.
        """
        self._last_was_numbered = False
        total = sum(col_widths)
        grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in col_widths)
        tbl = [
            '<w:tbl>',
            '<w:tblPr>',
            '<w:tblStyle w:val="TableGrid"/>',
            f'<w:tblW w:w="{total}" w:type="dxa"/>',
            '<w:tblLayout w:type="fixed"/>',
            '</w:tblPr>',
            f'<w:tblGrid>{grid}</w:tblGrid>',
        ]
        for r_idx, row in enumerate(rows):
            is_header = header and r_idx == 0
            tbl.append("<w:tr>")
            if is_header:
                tbl.append('<w:trPr><w:tblHeader/></w:trPr>')
            for c_idx, cell in enumerate(row):
                w = col_widths[c_idx]
                shade = (f'<w:shd w:val="clear" w:color="auto" w:fill="{header_shade}"/>'
                         if is_header else "")
                tcpr = (f'<w:tcPr><w:tcW w:w="{w}" w:type="dxa"/>{shade}'
                        f'<w:vAlign w:val="center"/></w:tcPr>')
                paras = cell if isinstance(cell, list) else [cell]
                cell_xml = []
                for p in paras:
                    bold = is_header or (first_col_bold and c_idx == 0)
                    rpr = []
                    if bold:
                        rpr.append("<w:b/>")
                    if font_size:
                        rpr.append(f'<w:sz w:val="{font_size}"/>')
                    rpr_xml = f"<w:rPr>{''.join(rpr)}</w:rPr>" if rpr else ""
                    ppr = f'<w:pPr><w:spacing w:after="20"/>{rpr_xml}</w:pPr>'
                    run = (f'<w:r>{rpr_xml}<w:t xml:space="preserve">{_esc(p)}</w:t></w:r>'
                           if p != "" else "")
                    cell_xml.append(f"<w:p>{ppr}{run}</w:p>")
                if not cell_xml:
                    cell_xml.append("<w:p/>")
                tbl.append(f"<w:tc>{tcpr}{''.join(cell_xml)}</w:tc>")
            tbl.append("</w:tr>")
        tbl.append("</w:tbl>")
        # a trailing empty paragraph keeps Word happy after a table
        tbl.append('<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>')
        self.body.append("".join(tbl))
        return self

    # -- assemble document.xml --
    def _document_xml(self):
        sect = (
            '<w:sectPr>'
            '<w:footerReference w:type="default" r:id="rId4"/>'
            '<w:pgSz w:w="12240" w:h="15840"/>'
            '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" '
            'w:header="720" w:footer="720" w:gutter="0"/>'
            '</w:sectPr>'
        )
        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<w:document '
            'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            '<w:body>'
            + "".join(self.body)
            + sect +
            '</w:body></w:document>'
        )

    def save(self, path):
        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("[Content_Types].xml", CONTENT_TYPES)
            z.writestr("_rels/.rels", RELS)
            z.writestr("word/_rels/document.xml.rels", DOC_RELS)
            z.writestr("word/document.xml", self._document_xml())
            z.writestr("word/styles.xml", _styles_xml())
            z.writestr("word/numbering.xml",
                       _numbering_xml(self._num_ids or (2,)))
            z.writestr("word/settings.xml", SETTINGS)
            z.writestr("word/footer1.xml", FOOTER)
            z.writestr("docProps/core.xml", CORE)
            z.writestr("docProps/app.xml", APP)
