# -*- coding: utf-8 -*-
"""Parse batch_read tool-result dumps into per-board deep structure summaries."""
import json, re, sys, io, os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SRCS = [
    ("mcp-ardot-design-batch_read-1788856644351-e46c8a.txt", "ME-A"),
    ("mcp-ardot-design-batch_read-1788856670946-38da7c.txt", "ME-B"),
    ("mcp-ardot-design-batch_read-1788856670958-99af5c.txt", "ME-C"),
    ("mcp-ardot-design-batch_read-1788856670952-2ab0cd.txt", "ME-D"),
    ("call_92a46046f4a0473a9075c0d1.txt", "W-deep"),
    ("call_5392dc48b4424cc0874834be.txt", "CU-deep"),
    ("call_2164425da93548478eae9df2.txt", "L05-deep"),
    ("mcp-ardot-design-batch_read-1788851855500-0082e6.txt", "batch1"),
]
BASE = r"C:\Users\41924\.workbuddy\projects\c-Users-41924-WorkBuddy-2026-09-06-13-07-20\f6911ae2-e1bd-4132-8562-fcc881410a9f\tool-results"
OUT = r"D:\workbuddy\www\photography-wechat\.assets-raw\board-summaries"

def find_json(text):
    i = text.find('{')
    if i < 0:
        raise ValueError("no json")
    return json.loads(text[i:])

def get_nodes(data):
    if isinstance(data, dict):
        d = data.get('data') or data
        nodes = d.get('nodes') or d.get('result') or d.get('nodesRead')
        if isinstance(nodes, list):
            return nodes
        if isinstance(nodes, dict):
            return list(nodes.values())
    if isinstance(data, list):
        return data
    return []

def parse_children(node):
    ch = node.get('children')
    if ch is None:
        return []
    if isinstance(ch, list):
        return ch
    if isinstance(ch, str):
        s = ch.strip()
        if not s:
            return []
        for attempt in (s, s.replace("'", '"')):
            try:
                v = json.loads(attempt)
                return v if isinstance(v, list) else [v]
            except Exception:
                continue
        return []
    return []

def color_of(fill):
    if not fill:
        return None
    if isinstance(fill, dict):
        fill = [fill]
    if isinstance(fill, list) and fill:
        f = fill[0]
        if f.get('visible') is False:
            return None
        c = f.get('color') or {}
        r, g, b = c.get('r', 0), c.get('g', 0), c.get('b', 0)
        a = c.get('a', f.get('opacity', 1))
        if isinstance(a, (int, float)) and a < 0.01:
            return None
        return '#%02X%02X%02X' % (round(r*255), round(g*255), round(b*255))
    return None

def walk(node, depth, out, maxdepth=14):
    if depth > maxdepth or not isinstance(node, dict):
        return
    name = node.get('name', '?')
    ntype = node.get('type', '?')
    w = node.get('width'); h = node.get('height')
    x = node.get('x'); y = node.get('y')
    size = ""
    if w is not None and h is not None:
        ws = "fill" if w == "fill_container" or w == "FILL" else (f"{round(w,1) if isinstance(w,(int,float)) else w}")
        hs = "hug" if h in ("hug_contents","HUG") else (f"{round(h,1) if isinstance(h,(int,float)) else h}")
        if isinstance(w,str) and w not in ("fill_container",): ws = "fill" if 'fill' in str(w).lower() else str(w)
        if isinstance(h,str) and h not in ("hug_contents",): hs = "hug" if 'hug' in str(h).lower() else str(h)
        size = f" {ws}x{hs}"
    pos = ""
    if x is not None or y is not None:
        pos = f" @({round(x,1) if isinstance(x,(int,float)) else x},{round(y,1) if isinstance(y,(int,float)) else y})"
    bg = color_of(node.get('fills'))
    stroke = color_of(node.get('strokes'))
    r = node.get('borderRadius') or node.get('cornerRadius')
    rr = f" r={r}" if r else ""
    ss = f" stroke={stroke}" if stroke else ""
    txt = ""
    if ntype == 'TEXT' or node.get('characters'):
        chars = node.get('characters', '')
        fs = node.get('fontSize')
        col = color_of(node.get('fills'))
        fw = node.get('fontWeight') or node.get('fontStyleName') or ''
        txt = f' TEXT="{chars}"' + (f" fs={fs}" if fs else "") + (f" color={col}" if col else "") + (f" fw={fw}" if fw else "")
    tag = {'FRAME':'F','RECTANGLE':'R','TEXT':'T','GROUP':'G','INSTANCE':'I','VECTOR':'V','SVG':'S','COMPONENT':'C','BOOLEAN_OPERATION':'B','LINE':'L','ELLIPSE':'E','IMAGE':'IMG'}.get(ntype, ntype[:4])
    out.append("  "*depth + f"[{tag}] {name}{size}{pos}" + (f" bg={bg}" if bg else "") + rr + ss + txt)
    for c in parse_children(node):
        walk(c, depth+1, out, maxdepth)

def slug(s):
    s = re.sub(r'\s+', '', s)
    return re.sub(r'[\\/:*?"<>|]', '_', s)

for fname, _grp in SRCS:
    raw = open(os.path.join(BASE, fname), encoding='utf-8', errors='replace').read()
    data = find_json(raw)
    nodes = get_nodes(data)
    for nd in nodes:
        if not isinstance(nd, dict):
            continue
        name = slug(nd.get('name', 'board'))
        nid = str(nd.get('id', '')).replace(':', '_')
        out = []
        walk(nd, 0, out)
        outp = os.path.join(OUT, f"DEEP-{name}_{nid}.txt")
        with open(outp, 'w', encoding='utf-8') as f:
            f.write("\n".join(out))
        print(f"{name}_{nid}: {len(out)} lines")
