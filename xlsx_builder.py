#!/usr/bin/env python3
"""
xlsx_builder.py — minimal raw-OOXML .xlsx writer (no openpyxl available in this
environment). Builds a single-sheet workbook with a bold, shaded, wrapped header
row, frozen header, autofilter, and per-column widths. Strings are written
inline (t="inlineStr") to avoid a sharedStrings table. Good enough for a
change-impact matrix; not a general spreadsheet engine.
"""
import zipfile
from xml.sax.saxutils import escape


def _col_letter(n):
    # 1 -> A, 27 -> AA
    s = ""
    while n > 0:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def _cell(col_idx, row_idx, text, style_id=0):
    ref = f"{_col_letter(col_idx)}{row_idx}"
    txt = escape("" if text is None else str(text))
    return (f'<c r="{ref}" s="{style_id}" t="inlineStr">'
            f'<is><t xml:space="preserve">{txt}</t></is></c>')


CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>"""

RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"""

WB_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

# style 0 = default; style 1 = header (bold, shaded fill, wrap, top-aligned);
# style 2 = body (wrap, top-aligned)
STYLES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="3">
  <font><sz val="11"/><name val="Calibri"/></font>
  <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
  <font><u/><sz val="11"/><color rgb="FF0563C1"/><name val="Calibri"/></font>
</fonts>
<fills count="3">
  <fill><patternFill patternType="none"/></fill>
  <fill><patternFill patternType="gray125"/></fill>
  <fill><patternFill patternType="solid"><fgColor rgb="FF1F4E79"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4">
  <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>"""


def _sheet_xml(header, rows, col_widths, links=None):
    """links: optional list of dicts {row, col, location, display} where row/col
    are 1-based data positions (row 1 = first data row, i.e. worksheet row 2),
    location is an in-workbook target like \"'Sheet Name'!A5\", display is the
    cell text. Linked cells get the hyperlink style (3)."""
    ncols = len(header)
    if col_widths is None:
        col_widths = [24] * ncols
    links = links or []
    # index links by (worksheet_row, col) -> (location, display)
    link_map = {}
    for lk in links:
        ws_row = lk["row"] + 1  # +1 for header row
        link_map[(ws_row, lk["col"])] = (lk["location"], lk["display"])

    cols_xml = "".join(
        f'<col min="{i+1}" max="{i+1}" width="{w}" customWidth="1"/>'
        for i, w in enumerate(col_widths)
    )
    sheet_rows = []
    hdr_cells = "".join(_cell(c + 1, 1, header[c], 1) for c in range(ncols))
    sheet_rows.append(f'<row r="1">{hdr_cells}</row>')
    for r, row in enumerate(rows, start=2):
        cells = []
        for c in range(ncols):
            lk = link_map.get((r, c + 1))
            if lk:
                cells.append(_cell(c + 1, r, lk[1], 3))  # hyperlink style, display text
            else:
                cells.append(_cell(c + 1, r, row[c] if c < len(row) else "", 2))
        sheet_rows.append(f'<row r="{r}">{"".join(cells)}</row>')
    last_ref = f"{_col_letter(ncols)}{len(rows) + 1}"

    hyperlinks_xml = ""
    if link_map:
        hl = "".join(
            f'<hyperlink ref="{_col_letter(col)}{ws_row}" '
            f'location="{escape(loc)}" display="{escape(disp)}"/>'
            for (ws_row, col), (loc, disp) in link_map.items()
        )
        hyperlinks_xml = f'<hyperlinks>{hl}</hyperlinks>'

    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f'<dimension ref="A1:{last_ref}"/>'
        '<sheetViews><sheetView workbookViewId="0">'
        '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>'
        '</sheetView></sheetViews>'
        '<sheetFormatPr defaultRowHeight="15"/>'
        f'<cols>{cols_xml}</cols>'
        f'<sheetData>{"".join(sheet_rows)}</sheetData>'
        f'<autoFilter ref="A1:{_col_letter(ncols)}1"/>'
        f'{hyperlinks_xml}'
        '</worksheet>'
    )


def write_xlsx_multi(path, sheets):
    """sheets: list of dicts, each {name, header, rows, col_widths}."""
    n = len(sheets)
    ct_overrides = "".join(
        f'<Override PartName="/xl/worksheets/sheet{i+1}.xml" '
        f'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        for i in range(n)
    )
    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        + ct_overrides +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        '</Types>'
    )
    wb_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + "".join(
            f'<Relationship Id="rId{i+1}" '
            f'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            f'Target="worksheets/sheet{i+1}.xml"/>'
            for i in range(n)
        )
        + f'<Relationship Id="rId{n+1}" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
        'Target="styles.xml"/>'
        '</Relationships>'
    )
    sheets_xml = "".join(
        f'<sheet name="{escape(s["name"])[:31]}" sheetId="{i+1}" r:id="rId{i+1}"/>'
        for i, s in enumerate(sheets)
    )
    workbook_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<sheets>{sheets_xml}</sheets>'
        '</workbook>'
    )
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", RELS)
        z.writestr("xl/workbook.xml", workbook_xml)
        z.writestr("xl/_rels/workbook.xml.rels", wb_rels)
        z.writestr("xl/styles.xml", STYLES)
        for i, s in enumerate(sheets):
            z.writestr(f"xl/worksheets/sheet{i+1}.xml",
                       _sheet_xml(s["header"], s["rows"], s.get("col_widths"),
                                  s.get("links")))
    return path


def write_xlsx(path, sheet_name, header, rows, col_widths=None):
    """Single-sheet convenience wrapper."""
    return write_xlsx_multi(path, [{"name": sheet_name, "header": header,
                                    "rows": rows, "col_widths": col_widths}])
