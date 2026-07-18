#!/usr/bin/env python3
"""Split a PPTX into multiple valid PPTX files by slide ranges.

For each part: copy full package, keep only the slides in the range,
prune everything referencing dropped slides, prune orphaned media.
Slide 23's embedded videos are stripped and replaced with a placeholder image.
"""
import os, re, shutil, zipfile, glob, struct, zlib, sys

SRC = "/Users/partha/Library/CloudStorage/OneDrive-AaloAtomics/Documents/Aalo/2026.07.17_NORM_Presentation/Master Slides _v4.pptx"
OUTDIR = "/Users/partha/Library/CloudStorage/OneDrive-AaloAtomics/Documents/Aalo/2026.07.17_NORM_Presentation/split_parts"
WORK = os.path.join(os.environ.get("TMPDIR","/tmp"), "pptx_split_work")

# 1-based inclusive slide ranges per output part (tuned so each part < 30MB)
RANGES = [
    (1, 5),    # part 1: slides 1-5   (~28MB: slide6/7 are 20MB each, keep separate)
    (6, 8),    # part 2: slides 6-8   (slide6 20 + slide7 20 share image15; slide8 9)
    (9, 22),   # part 3: slides 9-22
    (23, 28),  # part 4: slides 23-28 (23 videos dropped)
    (29, 54),  # part 5: slides 29-54 (31 is 9.5MB)
]
DROP_VIDEO_SLIDE = "slide23"

def make_placeholder_png(path):
    """Write a minimal valid solid-gray PNG (video placeholder)."""
    W=H=16
    raw=b""
    for y in range(H):
        raw+=b"\x00"+bytes([90,90,90])*W  # filter byte + RGB pixels
    def chunk(typ,data):
        c=typ+data
        return struct.pack(">I",len(data))+c+struct.pack(">I",zlib.crc32(c)&0xffffffff)
    sig=b"\x89PNG\r\n\x1a\n"
    ihdr=struct.pack(">IIBBBBB",W,H,8,2,0,0,0)  # 8-bit RGB
    idat=zlib.compress(raw,9)
    with open(path,"wb") as f:
        f.write(sig+chunk(b"IHDR",ihdr)+chunk(b"IDAT",idat)+chunk(b"IEND",b""))

def build_part(part_idx, lo, hi):
    d = os.path.join(WORK, f"part{part_idx}")
    if os.path.exists(d): shutil.rmtree(d)
    shutil.rmtree(d, ignore_errors=True)
    # extract fresh
    with zipfile.ZipFile(SRC) as z:
        z.extractall(d)

    keep = {f"slide{n}" for n in range(lo, hi+1)}
    all_slides = {os.path.basename(p).replace(".xml","")
                  for p in glob.glob(os.path.join(d,"ppt","slides","slide*.xml"))}
    drop = all_slides - keep

    # --- strip videos from slide23 if kept ---
    if DROP_VIDEO_SLIDE in keep:
        strip_videos(d, DROP_VIDEO_SLIDE)

    # --- remove dropped slide xml + rels ---
    for s in drop:
        for p in (os.path.join(d,"ppt","slides",f"{s}.xml"),
                  os.path.join(d,"ppt","slides","_rels",f"{s}.xml.rels")):
            if os.path.exists(p): os.remove(p)

    # --- presentation.xml: drop sldId entries for dropped slides ---
    pres_rels_path=os.path.join(d,"ppt","_rels","presentation.xml.rels")
    pres_rels=open(pres_rels_path).read()
    # rId -> slideN for slide targets
    slide_rid={}
    for m in re.finditer(r'<Relationship\b[^>]*/>', pres_rels):
        tag=m.group(0)
        rid=re.search(r'Id="([^"]+)"',tag).group(1)
        tgt=re.search(r'Target="([^"]+)"',tag)
        if tgt and "slides/slide" in tgt.group(1):
            sn=re.search(r'slide\d+',tgt.group(1)).group(0)
            slide_rid[rid]=sn
    drop_rids={rid for rid,sn in slide_rid.items() if sn in drop}

    pres_path=os.path.join(d,"ppt","presentation.xml")
    pres=open(pres_path).read()
    for rid in drop_rids:
        pres=re.sub(r'<p:sldId[^>]*r:id="'+rid+r'"[^>]*/>','',pres)
    open(pres_path,"w").write(pres)

    # remove dropped slide relationships from presentation rels
    for rid in drop_rids:
        pres_rels=re.sub(r'<Relationship\b[^>]*Id="'+rid+r'"[^>]*/>','',pres_rels)
    open(pres_rels_path,"w").write(pres_rels)

    # --- [Content_Types].xml: drop overrides for removed slides ---
    ct_path=os.path.join(d,"[Content_Types].xml")
    ct=open(ct_path).read()
    for s in drop:
        ct=re.sub(r'<Override[^>]*PartName="/ppt/slides/'+s+r'\.xml"[^>]*/>','',ct)
    open(ct_path,"w").write(ct)

    # --- prune orphaned media: any media not referenced by a surviving rels ---
    referenced=set()
    for rels in glob.glob(os.path.join(d,"ppt","**","_rels","*.rels"),recursive=True):
        txt=open(rels).read()
        for mm in re.findall(r'media/([^"\')]+)', txt):
            referenced.add(mm)
    media_dir=os.path.join(d,"ppt","media")
    removed=0
    for mf in os.listdir(media_dir):
        if mf not in referenced:
            os.remove(os.path.join(media_dir,mf)); removed+=1

    # --- repackage ---
    os.makedirs(OUTDIR, exist_ok=True)
    out=os.path.join(OUTDIR, f"Master Slides _v4 - Part {part_idx} (slides {lo}-{hi}).pptx")
    if os.path.exists(out): os.remove(out)
    with zipfile.ZipFile(out,"w",zipfile.ZIP_DEFLATED) as z:
        # write [Content_Types].xml first
        z.write(ct_path,"[Content_Types].xml")
        for root,_,files in os.walk(d):
            for fn in files:
                full=os.path.join(root,fn)
                arc=os.path.relpath(full,d)
                if arc=="[Content_Types].xml": continue
                z.write(full,arc)
    size=os.path.getsize(out)/1024/1024
    print(f"Part {part_idx}: slides {lo}-{hi} -> {size:.1f} MB  ({len(keep)} slides, dropped {removed} media)")
    return size

def strip_videos(d, slide):
    """Remove video embeds from a slide, replace media refs with placeholder image."""
    rels_path=os.path.join(d,"ppt","slides","_rels",f"{slide}.xml.rels")
    xml_path=os.path.join(d,"ppt","slides",f"{slide}.xml")
    rels=open(rels_path).read()
    xml=open(xml_path).read()

    # find rels pointing at .mp4 (video/media relationships)
    video_rids=[]
    for m in re.finditer(r'<Relationship\b[^>]*/>', rels):
        tag=m.group(0)
        tgt=re.search(r'Target="([^"]+)"',tag)
        if tgt and tgt.group(1).lower().endswith(".mp4"):
            rid=re.search(r'Id="([^"]+)"',tag).group(1)
            video_rids.append(rid)

    # remove entire picture shapes (p:pic) that contain a video reference.
    # A video shows up as <p:pic> with <a:videoFile r:link/r:embed> and media refs.
    # Simplest robust approach: remove <p:pic>...</p:pic> blocks that mention any video rid.
    def pic_has_video(block):
        return any(rid in block for rid in video_rids)
    out=[]; i=0
    for m in re.finditer(r'<p:pic>.*?</p:pic>', xml, re.S):
        pass
    # rebuild by removing offending pic blocks
    new_xml=re.sub(r'<p:pic>.*?</p:pic>',
                   lambda mm: '' if pic_has_video(mm.group(0)) else mm.group(0),
                   xml, flags=re.S)
    xml=new_xml

    # also strip any leftover r:id refs to video rids and media rels lines
    for rid in video_rids:
        rels=re.sub(r'<Relationship\b[^>]*Id="'+rid+r'"[^>]*/>','',rels)

    open(rels_path,"w").write(rels)
    open(xml_path,"w").write(xml)

def main():
    if os.path.exists(WORK): shutil.rmtree(WORK, ignore_errors=True)
    os.makedirs(WORK, exist_ok=True)
    total=0
    for i,(lo,hi) in enumerate(RANGES,1):
        total+=build_part(i,lo,hi)
    print(f"\nAll parts total {total:.1f} MB across {len(RANGES)} files.")

if __name__=="__main__":
    main()
