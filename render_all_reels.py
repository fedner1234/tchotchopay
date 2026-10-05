#!/usr/bin/env python3
"""
TchotchoPay - Render 4 Kreyol Reels as MP4
Requires: pycairo, ffmpeg
Install:  pip3 install pycairo && brew install ffmpeg
Run:      python3 render_all_reels.py
"""
import cairo, math, subprocess, os, sys

W, H = 1080, 1920
CX = W // 2
BASE = os.path.dirname(os.path.abspath(__file__))

# ── Brand colors ──────────────────────────────────────────────────
NAVY  = (0.008, 0.043, 0.176)
BLUE  = (0.039, 0.122, 0.431)
MID   = (0.063, 0.333, 0.800)
CYAN  = (0.000, 0.682, 0.937)
GREEN = (0.000, 0.784, 0.588)
GOLD  = (0.969, 0.718, 0.192)
RED   = (1.000, 0.420, 0.420)
GRAY  = (0.533, 0.600, 0.733)
WHITE = (1.000, 1.000, 1.000)

# ── Helpers ───────────────────────────────────────────────────────
def new_surface():
    s = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    return s, cairo.Context(s)

def lg(x1, y1, x2, y2, stops):
    g = cairo.LinearGradient(x1, y1, x2, y2)
    for o, col in stops: g.add_color_stop_rgb(o, *col)
    return g

def lga(x1, y1, x2, y2, stops):
    g = cairo.LinearGradient(x1, y1, x2, y2)
    for o, col in stops: g.add_color_stop_rgba(o, *col)
    return g

def radg(cx, cy, r, stops):
    g = cairo.RadialGradient(cx, cy, 0, cx, cy, r)
    for o, col in stops: g.add_color_stop_rgba(o, *col)
    return g

def rrect(c, x, y, w, h, r):
    c.new_path()
    c.arc(x+r, y+r, r, math.pi, 3*math.pi/2)
    c.arc(x+w-r, y+r, r, 3*math.pi/2, 0)
    c.arc(x+w-r, y+h-r, r, 0, math.pi/2)
    c.arc(x+r, y+h-r, r, math.pi/2, math.pi)
    c.close_path()

def txt(c, text, x, y, sz, col, bold=True, align='center'):
    c.select_font_face("Helvetica Neue", cairo.FONT_SLANT_NORMAL,
        cairo.FONT_WEIGHT_BOLD if bold else cairo.FONT_WEIGHT_NORMAL)
    c.set_font_size(sz)
    ex = c.text_extents(text)
    offsets = {'center': -(ex.width/2 + ex.x_bearing),
               'right':  -(ex.width + ex.x_bearing),
               'left':   -ex.x_bearing}
    c.set_source_rgb(*col)
    c.move_to(x + offsets[align], y)
    c.show_text(text)

def txta(c, text, x, y, sz, col, alpha, bold=True, align='center'):
    c.select_font_face("Helvetica Neue", cairo.FONT_SLANT_NORMAL,
        cairo.FONT_WEIGHT_BOLD if bold else cairo.FONT_WEIGHT_NORMAL)
    c.set_font_size(sz)
    ex = c.text_extents(text)
    offsets = {'center': -(ex.width/2 + ex.x_bearing),
               'right':  -(ex.width + ex.x_bearing),
               'left':   -ex.x_bearing}
    c.set_source_rgba(*col, alpha)
    c.move_to(x + offsets[align], y)
    c.show_text(text)

def bg(c, glow=MID):
    c.set_source(lg(0, 0, 0, H, [(0, NAVY), (0.45, BLUE), (1, NAVY)]))
    c.paint()
    c.set_source(radg(CX, H*0.42, 580, [(0, (*glow, 0.15)), (1, (*glow, 0.0))]))
    c.paint()

def header(c, tag, tc=GREEN):
    txt(c, "TchotchoPay", CX, 175, 68, WHITE)
    c.set_source_rgba(*tc, 0.55)
    c.set_line_width(2)
    c.move_to(CX-135, 197); c.line_to(CX+135, 197); c.stroke()
    txt(c, tag.upper(), CX, 254, 30, tc, bold=False)

def watermark(c):
    c.select_font_face("Helvetica Neue", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL)
    c.set_font_size(28)
    ex = c.text_extents("tchotchopay.com")
    c.set_source_rgba(*GRAY, 0.32)
    c.move_to(CX - ex.width/2 - ex.x_bearing, H - 52)
    c.show_text("tchotchopay.com")

def card(c, x, y, w, h, r=42):
    rrect(c, x, y, w, h, r)
    c.set_source_rgba(*BLUE, 0.78)
    c.fill_preserve()
    c.set_source_rgba(1, 1, 1, 0.07)
    c.set_line_width(2)
    c.stroke()

def hline(c, y, x1=110, x2=970):
    c.set_source_rgba(1, 1, 1, 0.1)
    c.set_line_width(1.5)
    c.move_to(x1, y); c.line_to(x2, y); c.stroke()

def green_btn(c, lbl, y, bw=860):
    bx = CX - bw//2
    rrect(c, bx, y, bw, 110, 36)
    c.set_source(lg(bx, y, bx+bw, y, [(0, GREEN), (1, BLUE)]))
    c.fill()
    txt(c, lbl, CX, y + 74, 46, WHITE)

def gold_btn(c, lbl, y, bw=860):
    bx = CX - bw//2
    rrect(c, bx, y, bw, 110, 36)
    c.set_source(lg(bx, y, bx+bw, y, [(0, GOLD), (0.6, (1.0,0.62,0.0))]))
    c.fill()
    txt(c, lbl, CX, y + 74, 46, NAVY)

def checkmark(c, x, y, size, col):
    c.set_source_rgb(*col)
    c.set_line_width(5)
    c.set_line_cap(cairo.LINE_CAP_ROUND)
    c.set_line_join(cairo.LINE_JOIN_ROUND)
    c.move_to(x - size*0.35, y)
    c.line_to(x - size*0.05, y + size*0.3)
    c.line_to(x + size*0.45, y - size*0.32)
    c.stroke()

def circle(c, cx, cy, r, fill_col, stroke_col=None, sw=4):
    c.arc(cx, cy, r, 0, 2*math.pi)
    c.set_source_rgb(*fill_col)
    c.fill_preserve()
    if stroke_col:
        c.set_source_rgb(*stroke_col)
        c.set_line_width(sw)
        c.stroke()
    else:
        c.new_path()

def cta_box(c, line1, line2, url, btn_label, y_start, tc=GREEN):
    bh = 460
    rrect(c, 70, y_start, 940, bh, 44)
    c.set_source(lga(70, y_start, 70+940, y_start+bh, [
        (0, (*tc, 0.18)), (1, (*BLUE, 0.18))
    ]))
    c.fill_preserve()
    c.set_source_rgba(*tc, 0.5)
    c.set_line_width(2.5)
    c.stroke()
    txt(c, line1, CX, y_start + 95, 64, WHITE)
    txt(c, line2, CX, y_start + 175, 64, tc)
    txta(c, url, CX, y_start + 255, 36, CYAN, 1.0, bold=False)
    green_btn(c, btn_label, y_start + 300)

def make_mp4(frames, durations, output):
    # Use bundled ffmpeg from imageio-ffmpeg (no brew/system ffmpeg needed)
    try:
        import imageio_ffmpeg
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        # Fall back to system ffmpeg or common paths
        import shutil
        ffmpeg = (shutil.which("ffmpeg") or
                  "/opt/homebrew/bin/ffmpeg" or
                  "/usr/local/bin/ffmpeg" or
                  "ffmpeg")
    concat = os.path.join(BASE, "_concat_tmp.txt")
    with open(concat, "w") as f:
        for fr, d in zip(frames, durations):
            f.write(f"file '{fr}'\nduration {d}\n")
        f.write(f"file '{frames[-1]}'\nduration 0.001\n")
    res = subprocess.run([
        ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", concat,
        "-vf", f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
               f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=#020B2D",
        "-c:v", "libx264", "-preset", "slow", "-crf", "18",
        "-pix_fmt", "yuv420p", "-r", "30", output
    ], capture_output=True, text=True)
    try: os.remove(concat)
    except: pass
    if res.returncode == 0:
        size = os.path.getsize(output) // 1024
        print(f"  OK  {output}  ({size}K)")
    else:
        print(f"  FAIL {output}\n{res.stderr[-300:]}")

# ═════════════════════════════════════════════════════════════════
#  REEL 1 — VOYE LAJAN (Send Money)
# ═════════════════════════════════════════════════════════════════
def r1_s1():
    surf, c = new_surface()
    bg(c)
    header(c, "Pwoblem nan")
    txt(c, "Voye $100 bay", CX, 360, 70, WHITE)
    txt(c, "fanmi Ayiti?", CX, 442, 70, WHITE)
    card(c, 70, 490, 940, 380)
    rows = [("Western Union", "-$8 fre", RED), ("MoneyGram", "-$6 fre", RED), ("TchotchoPay", "-$1 selman  +", GREEN)]
    for i, (lbl, val, vc) in enumerate(rows):
        ry = 490 + i*127 + 83
        txt(c, lbl, 130, ry, 44, GRAY, bold=False, align='left')
        txt(c, val, 950, ry, 46, vc, align='right')
        if i < 2: hline(c, 490 + (i+1)*127)
    watermark(c)
    return surf

def r1_s2():
    surf, c = new_surface()
    bg(c)
    header(c, "Voye bay bous")
    txt(c, "Chwazi MonCash", CX, 348, 66, WHITE)
    txt(c, "oswa NatCash", CX, 424, 66, WHITE)
    # MonCash badge
    rrect(c, 70, 455, 455, 98, 28)
    c.set_source_rgba(1.0, 0.39, 0.0, 0.18); c.fill_preserve()
    c.set_source_rgba(1.0, 0.39, 0.0, 0.75); c.set_line_width(3); c.stroke()
    txt(c, "MonCash", 297, 516, 46, (1.0, 0.62, 0.29))
    # NatCash badge
    rrect(c, 555, 455, 455, 98, 28)
    c.set_source_rgba(*BLUE, 0.3); c.fill_preserve()
    c.set_source_rgba(1,1,1,0.08); c.set_line_width(2); c.stroke()
    txt(c, "NatCash", 782, 516, 46, GRAY)
    card(c, 70, 582, 940, 370)
    txta(c, "NIMEWO RESEVE A", 130, 648, 26, GRAY, 0.8, bold=False, align='left')
    txt(c, "+509 3712 ....", 130, 705, 48, WHITE, align='left')
    hline(c, 730)
    txta(c, "KANTITE (USD)", 130, 780, 26, GRAY, 0.8, bold=False, align='left')
    txt(c, "$100.00", 130, 840, 52, GREEN, align='left')
    green_btn(c, "Voye Kounye a  ->", 900)
    watermark(c)
    return surf

def r1_s3():
    surf, c = new_surface()
    bg(c, glow=CYAN)
    header(c, "Ap voye...")
    ly = 750
    # Transfer line
    c.set_source(lg(260, ly, 820, ly, [(0, MID), (1, GREEN)]))
    c.set_line_width(6); c.move_to(260, ly); c.line_to(820, ly); c.stroke()
    # Dot at midpoint
    c.set_source_rgb(*CYAN)
    c.arc(540, ly, 20, 0, 2*math.pi); c.fill()
    # Left avatar
    circle(c, 175, ly, 82, BLUE, MID, 5)
    txt(c, "US", 175, ly+18, 50, WHITE)
    # Right avatar
    circle(c, 905, ly, 82, (0.0, 0.2, 0.1), GREEN, 5)
    txt(c, "HT", 905, ly+18, 50, WHITE)
    # Amount
    txt(c, "$100", CX, 930, 148, GREEN)
    txta(c, "= 13 000 HTG", CX, 1010, 44, GRAY, 0.9, bold=False)
    txt(c, "Rive nan kek segonn!", CX, 1090, 50, WHITE, bold=False)
    watermark(c)
    return surf

def r1_s4():
    surf, c = new_surface()
    bg(c)
    header(c, "Ayiti — MonCash")
    txt(c, "Fanmi ou resi lajan!", CX, 356, 68, WHITE)
    # Notification card
    card(c, 70, 400, 940, 270)
    # Green left border
    rrect(c, 70, 400, 10, 270, 5)
    c.set_source_rgb(*GREEN); c.fill()
    c.set_source_rgb(*GRAY)
    c.select_font_face("Helvetica Neue",cairo.FONT_SLANT_NORMAL,cairo.FONT_WEIGHT_NORMAL)
    c.set_font_size(28); c.move_to(130, 455); c.show_text("MonCash")
    txt(c, "Ou resi $100!", 130, 515, 52, WHITE, align='left')
    txta(c, "Depi TchotchoPay. Balans mete ajou.", 130, 573, 36, (0.8,0.85,0.95), 0.9, bold=False, align='left')
    checkmark(c, 910, 543, 44, GREEN)
    # Pill row
    pills = [("Achte manje", GREEN), ("Kouran", GREEN), ("Rechaj", GREEN), ("Kach", GRAY)]
    px = 90
    for lbl, col in pills:
        pw = len(lbl)*26 + 40
        rrect(c, px, 720, pw, 70, 20)
        c.set_source_rgba(*col, 0.12); c.fill_preserve()
        c.set_source_rgba(*col, 0.5); c.set_line_width(1.5); c.stroke()
        txt(c, lbl, px + pw//2, 764, 30, col, bold=False)
        px += pw + 16
    txta(c, "Pa bezwen bank.", CX, 860, 44, (0.75,0.82,0.95), 0.85, bold=False)
    watermark(c)
    return surf

def r1_s5():
    surf, c = new_surface()
    bg(c)
    header(c, "Poukisa TchotchoPay")
    txt(c, "Sispann peye twop", CX, 356, 72, WHITE)
    card(c, 70, 400, 940, 400)
    bars = [("Western Union", 0.85, RED, "8%"), ("MoneyGram", 0.65, GOLD, "6%"), ("TchotchoPay", 0.12, GREEN, "1%")]
    for i, (nm, pct, col, lbl) in enumerate(bars):
        ry = 400 + i*134 + 90
        txt(c, nm, 130, ry, 38, GRAY, bold=False, align='left')
        # Bar track
        rrect(c, 130, ry+16, 700, 22, 8)
        c.set_source_rgba(1,1,1,0.07); c.fill()
        # Bar fill
        rrect(c, 130, ry+16, int(700*pct), 22, 8)
        c.set_source_rgb(*col); c.fill()
        txt(c, lbl, 880, ry+16, 40, col, align='left')
        if i < 2: hline(c, 400 + (i+1)*134)
    txta(c, "Kenbe plis lajan nan men fanmi ou.", CX, 880, 44, (0.75,0.82,0.95), 0.85, bold=False)
    watermark(c)
    return surf

def r1_s6():
    surf, c = new_surface()
    bg(c)
    header(c, "TchotchoPay")
    txt(c, "Voye lajan.", CX, 380, 88, WHITE)
    txt(c, "Pa fre.", CX, 475, 88, GREEN)
    cta_box(c, "Voye bay MonCash jodi a", "Kòmanse Gratis", "tchotchopay.com/send", "Kòmanse Gratis", 560)
    watermark(c)
    return surf

# ═════════════════════════════════════════════════════════════════
#  REEL 2 — KONT USDC (Digital Dollar Savings)
# ═════════════════════════════════════════════════════════════════
def r2_s1():
    surf, c = new_surface()
    bg(c, glow=RED)
    header(c, "Pwoblem HTG", tc=CYAN)
    txt(c, "Goud la pedi vale", CX, 360, 70, WHITE)
    txt(c, "chak ane", CX, 440, 70, WHITE)
    card(c, 70, 490, 940, 380)
    rows = [("HTG pedi an 2023", "-43%", RED), ("HTG pedi an 2024", "-35%", RED), ("USDC TchotchoPay", "$1.00 = $1.00", GREEN)]
    for i, (lbl, val, vc) in enumerate(rows):
        ry = 490 + i*127 + 83
        txt(c, lbl, 130, ry, 42, GRAY, bold=False, align='left')
        txt(c, val, 950, ry, 46, vc, align='right')
        if i == 2:
            checkmark(c, 965, ry-8, 38, GREEN)
            txt(c, val, 920, ry, 46, vc, align='right')
        if i < 2: hline(c, 490 + (i+1)*127)
    watermark(c)
    return surf

def r2_s2():
    surf, c = new_surface()
    bg(c, glow=CYAN)
    header(c, "Bous USDC ou", tc=CYAN)
    txt(c, "Chak dola rete", CX, 348, 68, WHITE)
    txt(c, "yon dola", CX, 426, 68, WHITE)
    # Wallet card
    rrect(c, 70, 476, 940, 460, 44)
    c.set_source(lg(70, 476, 70+940, 476+460, [(0, BLUE), (1, (0.02,0.08,0.28))]))
    c.fill_preserve()
    c.set_source_rgba(*GREEN, 0.35); c.set_line_width(2.5); c.stroke()
    txta(c, "TCHOTCHOPAY WALLET", 130, 538, 26, CYAN, 0.85, bold=False, align='left')
    txta(c, "Balans USDC ou", 130, 595, 32, GRAY, 0.8, bold=False, align='left')
    txt(c, "$500", 130, 690, 130, WHITE, align='left')
    txt(c, "500.00 USDC", 130, 756, 44, CYAN, align='left')
    # Meta row
    metas = [("Estati", "Estab", GREEN), ("Rezo", "Base", WHITE), ("Aksè", "24/7", WHITE)]
    for i, (lbl, val, vc) in enumerate(metas):
        mx = 130 + i*300
        txta(c, lbl, mx, 810, 28, GRAY, 0.75, bold=False, align='left')
        txt(c, val, mx, 854, 38, vc, align='left')
    # USDC badge
    rrect(c, 130, 880, 480, 68, 28)
    c.set_source_rgba(*CYAN, 0.12); c.fill_preserve()
    c.set_source_rgba(*CYAN, 0.45); c.set_line_width(1.5); c.stroke()
    txt(c, "Dola nimerik  |  Base blockchain", 370, 924, 28, CYAN, bold=False)
    watermark(c)
    return surf

def r2_s3():
    surf, c = new_surface()
    bg(c)
    header(c, "Balans pa chanje", tc=CYAN)
    txt(c, "USDC estab.  HTG tonbe.", CX, 356, 62, WHITE)
    # Two sets of bars side by side
    labels = ["Jan","Fev","Mas","Avr","Me","Jen"]
    htg_h  = [160, 130, 100, 78, 60, 44]
    usdc_h = [160, 160, 160, 160, 160, 160]
    bw = 62; gap = 24; start_x = 80; base_y = 850
    for i, (lbl, hh, uh) in enumerate(zip(labels, htg_h, usdc_h)):
        bx = start_x + i*(bw*2+gap+20)
        # HTG bar (red)
        rrect(c, bx, base_y-hh, bw, hh, 8)
        c.set_source(lg(bx, base_y-hh, bx, base_y, [(0, RED), (1, (0.6,0.1,0.1))]))
        c.fill()
        # USDC bar (green)
        rrect(c, bx+bw+10, base_y-uh, bw, uh, 8)
        c.set_source(lg(bx+bw+10, base_y-uh, bx+bw+10, base_y, [(0, GREEN), (1, (0.0,0.45,0.3))]))
        c.fill()
        txt(c, lbl, bx+bw+5, base_y+40, 32, GRAY, bold=False)
    # Baseline
    c.set_source_rgba(1,1,1,0.15)
    c.set_line_width(2); c.move_to(80,base_y); c.line_to(1000,base_y); c.stroke()
    # Legend
    rrect(c, 220, 940, 22, 22, 4); c.set_source_rgb(*RED); c.fill()
    txt(c, "HTG", 255, 959, 34, RED, bold=False, align='left')
    rrect(c, 380, 940, 22, 22, 4); c.set_source_rgb(*GREEN); c.fill()
    txt(c, "USDC", 415, 959, 34, GREEN, bold=False, align='left')
    watermark(c)
    return surf

def r2_s4():
    surf, c = new_surface()
    bg(c, glow=CYAN)
    header(c, "Pouvwa USDC ou", tc=CYAN)
    txt(c, "Itilize lib jan ou vle", CX, 348, 66, WHITE)
    items = [
        ("Voye lajan", "Bay fanmi, zanmi nenpot ki le"),
        ("Mache TchotchoPay", "Achte lokal ak USDC"),
        ("Rechaj gratis", "Digicel ak Natcom direkteman"),
        ("Retire kach", "Bank lokal oswa ajan Ayiti"),
    ]
    cols = [GREEN, CYAN, GREEN, CYAN]
    for i, ((title, sub), col) in enumerate(zip(items, cols)):
        iy = 400 + i * 210
        card(c, 70, iy, 940, 185, 36)
        # color accent bar on left
        rrect(c, 70, iy, 9, 185, 4)
        c.set_source_rgb(*col); c.fill()
        txt(c, title, 130, iy+75, 46, WHITE, align='left')
        txta(c, sub, 130, iy+130, 34, GRAY, 0.85, bold=False, align='left')
    watermark(c)
    return surf

def r2_s5():
    surf, c = new_surface()
    bg(c)
    header(c, "HTG vs USDC", tc=CYAN)
    txt(c, "Epay entelijan kòmanse isit", CX, 348, 60, WHITE)
    # Two comparison cards
    # HTG (bad)
    rrect(c, 60, 398, 450, 480, 40)
    c.set_source_rgba(0.3, 0.02, 0.02, 0.9); c.fill_preserve()
    c.set_source_rgba(*RED, 0.4); c.set_line_width(2); c.stroke()
    txt(c, "HTG", 285, 466, 56, RED)
    for i, (lbl, val) in enumerate([("Pedi vale","chak ane"),("Enflamasyon","elve anpil"),("Valè","enseten")]):
        ry = 530 + i*105
        txta(c, lbl, 285, ry, 34, GRAY, 0.8, bold=False)
        txt(c, val, 285, ry+48, 38, RED)
    # USDC (good)
    rrect(c, 570, 398, 450, 480, 40)
    c.set_source_rgba(0.02, 0.18, 0.1, 0.9); c.fill_preserve()
    c.set_source_rgba(*GREEN, 0.45); c.set_line_width(2); c.stroke()
    txt(c, "USDC", 795, 466, 56, GREEN)
    for i, (lbl, val) in enumerate([("Estab","$1 = $1"),("Disponib","24/7"),("Sekirite","blockchain")]):
        ry = 530 + i*105
        txta(c, lbl, 795, ry, 34, GRAY, 0.8, bold=False)
        txt(c, val, 795, ry+48, 38, GREEN)
    txta(c, "Komanse epay an dola jodi a.", CX, 960, 44, (0.75,0.85,0.95), 0.85, bold=False)
    watermark(c)
    return surf

def r2_s6():
    surf, c = new_surface()
    bg(c, glow=CYAN)
    header(c, "TchotchoPay", tc=CYAN)
    txt(c, "Kenbe dola ou.", CX, 380, 82, WHITE)
    txt(c, "Pa goud ki devalye.", CX, 472, 72, CYAN)
    cta_box(c, "Ouvri Kont USDC jodi a", "Kòmanse Gratis", "tchotchopay.com/wallet", "Kòmanse Gratis", 560, tc=CYAN)
    watermark(c)
    return surf

# ═════════════════════════════════════════════════════════════════
#  REEL 3 — KÒMAN LI TRAVAY (How It Works)
# ═════════════════════════════════════════════════════════════════
def r3_s1():
    surf, c = new_surface()
    bg(c)
    header(c, "Tre senp")
    txt(c, "Kòman TchotchoPay", CX, 348, 66, WHITE)
    txt(c, "travay?", CX, 424, 66, WHITE)
    steps = [
        (1, MID, "Mete Lajan", "Kat debi, ACH, bank"),
        (2, CYAN, "Konveti an USDC", "Otomatik, fre ba, vit"),
        (3, GREEN, "Voye / Achte / Kache", "Ou kontrole lajan ou"),
    ]
    for i, (n, col, title, sub) in enumerate(steps):
        sy = 490 + i*195
        card(c, 70, sy, 940, 168, 36)
        # Step number circle
        circle(c, 168, sy+84, 55, col, None)
        txta(c, col, 168, sy+84, 0.0, WHITE, 0.0)  # no-op
        c.set_source_rgb(*NAVY)
        c.arc(168, sy+84, 55, 0, 2*math.pi); c.fill()
        c.set_source_rgb(*col)
        c.arc(168, sy+84, 55, 0, 2*math.pi)
        c.set_line_width(4); c.stroke()
        txt(c, str(n), 168, sy+99, 58, col)
        txt(c, title, 250, sy+72, 46, WHITE, align='left')
        txta(c, sub, 250, sy+124, 34, GRAY, 0.8, bold=False, align='left')
    watermark(c)
    return surf

def r3_s2():
    surf, c = new_surface()
    bg(c)
    header(c, "Etap 1")
    txt(c, "Mete lajan", CX, 348, 74, WHITE)
    txt(c, "nan kont ou", CX, 432, 74, WHITE)
    methods = [("Kat Debi","$"), ("ACH Bank","#"), ("Viman Bank","~"), ("Depo Kach","$")]
    for i, (nm, _) in enumerate(methods):
        col = i % 2
        mx = 90 + col*490
        my = 495 + (i//2)*195
        card(c, mx, my, 440, 165, 36)
        txt(c, nm, mx+220, my+95, 44, WHITE)
    # Arrow
    c.set_source_rgb(*GREEN)
    c.set_line_width(5)
    c.move_to(CX, 910); c.line_to(CX, 960); c.stroke()
    c.move_to(CX-28, 940); c.line_to(CX, 975); c.line_to(CX+28, 940); c.close_path(); c.fill()
    # Result pill
    rrect(c, 130, 990, 820, 100, 36)
    c.set_source_rgba(*GREEN, 0.12); c.fill_preserve()
    c.set_source_rgba(*GREEN, 0.5); c.set_line_width(2); c.stroke()
    txt(c, "Lajan nan TchotchoPay ou", CX, 1052, 42, GREEN)
    watermark(c)
    return surf

def r3_s3():
    surf, c = new_surface()
    bg(c, glow=CYAN)
    header(c, "Etap 2", tc=CYAN)
    txt(c, "Konvesyon otomatik", CX, 348, 66, WHITE)
    txt(c, "an USDC", CX, 424, 66, WHITE)
    # Conversion boxes
    card(c, 70, 476, 415, 210, 40)
    txta(c, "OU VOYE", 277, 540, 28, GRAY, 0.8, bold=False)
    txt(c, "$100", 277, 638, 88, GOLD)
    # Arrow
    txt(c, "->", CX, 610, 68, CYAN)
    card(c, 595, 476, 415, 210, 40)
    txta(c, "OU RESEVWA", 802, 540, 28, GRAY, 0.8, bold=False)
    txt(c, "100 USDC", 802, 638, 70, GREEN)
    # Benefits
    benefits = [
        ("Regleman prèske imedya",),
        ("Fre trè ba sou Base blockchain",),
        ("Ou kenbe dola nimerik ou",),
        ("Disponib 24/7, tout kote",),
    ]
    for i, (b,) in enumerate(benefits):
        by = 740 + i * 105
        # check dot
        c.set_source_rgb(*GREEN)
        c.arc(105, by-8, 10, 0, 2*math.pi); c.fill()
        txt(c, b, 140, by, 40, (0.8,0.88,0.95), bold=False, align='left')
    watermark(c)
    return surf

def r3_s4():
    surf, c = new_surface()
    bg(c)
    header(c, "Etap 3")
    txt(c, "Itilize USDC", CX, 348, 74, WHITE)
    txt(c, "kòman ou vle", CX, 432, 74, WHITE)
    items = [
        ("Voye bay fanmi", "MonCash, NatCash, nenpot kote", GREEN, "Gratis"),
        ("Achte nan mache", "Komersan lokal ak mache a", CYAN, "1%"),
        ("Retire kach Ayiti", "Bank lokal oswa ajan", GOLD, "1%"),
        ("Rechaj Digicel/Natcom", "Direkteman depi USDC", GREEN, "Gratis"),
    ]
    for i, (title, sub, col, tag_lbl) in enumerate(items):
        iy = 490 + i*200
        card(c, 70, iy, 940, 172, 34)
        txt(c, title, 130, iy+72, 44, WHITE, align='left')
        txta(c, sub, 130, iy+124, 32, GRAY, 0.8, bold=False, align='left')
        # Tag pill
        tw = len(tag_lbl)*24+40
        tx = 970 - tw
        rrect(c, tx, iy+56, tw, 58, 18)
        c.set_source_rgba(*col, 0.15); c.fill_preserve()
        c.set_source_rgba(*col, 0.5); c.set_line_width(1.5); c.stroke()
        txt(c, tag_lbl, tx+tw//2, iy+94, 32, col)
    watermark(c)
    return surf

def r3_s5():
    surf, c = new_surface()
    bg(c)
    header(c, "Toupatou nan mond")
    # Globe visual (circles)
    c.set_source_rgba(*BLUE, 0.35)
    c.arc(CX, 720, 260, 0, 2*math.pi); c.fill()
    c.set_source_rgba(*CYAN, 0.6)
    c.arc(CX, 720, 260, 0, 2*math.pi)
    c.set_line_width(3); c.stroke()
    # Grid lines
    c.set_source_rgba(*CYAN, 0.2)
    c.set_line_width(1.5)
    for lat in [-120,-60,0,60,120]:
        c.arc(CX, 720, 260, 0, 2*math.pi)
        c.move_to(CX-260, 720+lat); c.line_to(CX+260, 720+lat); c.stroke()
    for lon in [-120,-60,0,60,120]:
        c.move_to(CX+lon, 460); c.line_to(CX+lon, 980); c.stroke()
    txt(c, "Voye depi nenpot ki kote", CX, 1050, 56, WHITE)
    txt(c, "nan mond lan", CX, 1122, 56, WHITE)
    # Country pills
    countries = ["Etazini", "Kanada", "Frans", "UK", "Ayiti"]
    px = 65
    for ctry in countries:
        pw = len(ctry)*28+44
        rrect(c, px, 1195, pw, 76, 28)
        c.set_source_rgba(*BLUE, 0.8); c.fill_preserve()
        c.set_source_rgba(1,1,1,0.12); c.set_line_width(1.5); c.stroke()
        txt(c, ctry, px+pw//2, 1244, 32, WHITE, bold=False)
        px += pw+16
    txta(c, "Bay fanmi ou, nenpot ki le!", CX, 1340, 44, (0.75,0.85,0.95), 0.85, bold=False)
    watermark(c)
    return surf

def r3_s6():
    surf, c = new_surface()
    bg(c)
    header(c, "TchotchoPay")
    txt(c, "Senp. Vit.", CX, 380, 88, WHITE)
    txt(c, "Fre ba.", CX, 475, 88, GREEN)
    cta_box(c, "Eseye TchotchoPay gratis", "Kòmanse Jodi a", "tchotchopay.com", "Kòmanse Gratis", 560)
    watermark(c)
    return surf

# ═════════════════════════════════════════════════════════════════
#  REEL 4 — REFERE YON ZANMI (Referral Program)
# ═════════════════════════════════════════════════════════════════
def r4_s1():
    surf, c = new_surface()
    bg(c, glow=GOLD)
    header(c, "Pwogram Referans", tc=GOLD)
    txt(c, "Fe lajan ak", CX, 352, 76, WHITE)
    txt(c, "TchotchoPay", CX, 438, 76, WHITE)
    # Big reward badge
    rrect(c, 130, 488, 820, 430, 50)
    c.set_source(lga(130, 488, 130+820, 488+430, [(0,(*GOLD,0.2)),(1,(*GOLD,0.06))]))
    c.fill_preserve()
    c.set_source_rgba(*GOLD, 0.55); c.set_line_width(3); c.stroke()
    txt(c, "$10", CX, 700, 178, GOLD)
    txt(c, "Chak zanmi ou refere", CX, 790, 44, WHITE, bold=False)
    txta(c, "Zanmi ou resevwa $5 tou", CX, 848, 38, (0.75,0.82,0.95), 0.85, bold=False)
    # Glow
    c.set_source(radg(CX, 703, 220, [(0,(*GOLD,0.15)),(1,(*GOLD,0.0))]))
    c.paint()
    watermark(c)
    return surf

def r4_s2():
    surf, c = new_surface()
    bg(c, glow=GOLD)
    header(c, "Tre fasil", tc=GOLD)
    txt(c, "3 etap pou", CX, 348, 72, WHITE)
    txt(c, "komanse genyen", CX, 430, 72, WHITE)
    steps = [
        ("Pataje lyen ou", "Voye pa WhatsApp, SMS oswa rezo sosyal"),
        ("Zanmi ou enskri", "Li kreye kont epi verifye idantite li"),
        ("Tou de genyen", "Ou jwenn $10 USDC, li jwenn $5 USDC"),
    ]
    for i, (title, sub) in enumerate(steps):
        sy = 490 + i*225
        card(c, 70, sy, 940, 196, 38)
        # Circle num
        c.set_source_rgb(*NAVY)
        c.arc(168, sy+98, 55, 0, 2*math.pi); c.fill()
        c.set_source_rgb(*GOLD)
        c.arc(168, sy+98, 55, 0, 2*math.pi)
        c.set_line_width(4); c.stroke()
        txt(c, str(i+1), 168, sy+116, 58, GOLD)
        txt(c, title, 250, sy+82, 46, WHITE, align='left')
        txta(c, sub, 250, sy+138, 33, GRAY, 0.8, bold=False, align='left')
        # Connecting dot line
        if i < 2:
            c.set_source_rgba(*GOLD, 0.2)
            c.set_line_width(2)
            c.move_to(168, sy+196); c.line_to(168, sy+225); c.stroke()
    watermark(c)
    return surf

def r4_s3():
    surf, c = new_surface()
    bg(c, glow=GOLD)
    header(c, "Pataje lyen ou", tc=GOLD)
    txt(c, "Yon klik,", CX, 348, 74, WHITE)
    txt(c, "yon zanmi", CX, 432, 74, WHITE)
    card(c, 70, 480, 940, 500)
    # Ref code box
    rrect(c, 110, 516, 860, 150, 30)
    c.set_source_rgba(*GOLD, 0.12); c.fill_preserve()
    c.set_source_rgba(*GOLD, 0.4); c.set_line_width(1.5); c.stroke()
    txta(c, "KOD REFERANS OU", CX, 566, 26, GOLD, 0.75, bold=False)
    txt(c, "JEAN25", CX, 640, 72, GOLD)
    # Share link
    txta(c, "tchotchopay.com/r/JEAN25", CX, 730, 34, CYAN, 0.9, bold=False)
    hline(c, 760, 110, 970)
    # Share buttons
    sbtns = [("WhatsApp","#25d366",(0.145,0.827,0.396)), ("SMS","#00AEEF",CYAN), ("Kopye","#F7B731",GOLD)]
    bw = 270
    for i, (lbl, _, col) in enumerate(sbtns):
        bx = 110 + i*(bw+15)
        rrect(c, bx, 790, bw, 95, 26)
        c.set_source_rgba(*col, 0.15); c.fill_preserve()
        c.set_source_rgba(*col, 0.5); c.set_line_width(1.5); c.stroke()
        txt(c, lbl, bx+bw//2, 848, 36, col)
    watermark(c)
    return surf

def r4_s4():
    surf, c = new_surface()
    bg(c, glow=GOLD)
    header(c, "Tou de genyen", tc=GOLD)
    txt(c, "Rekonpans pou toulede", CX, 348, 62, WHITE)
    # You card
    rrect(c, 60, 400, 450, 480, 42)
    c.set_source_rgba(*GOLD, 0.15); c.fill_preserve()
    c.set_source_rgba(*GOLD, 0.45); c.set_line_width(2.5); c.stroke()
    txta(c, "OU", 285, 462, 32, GOLD, 0.9, bold=False)
    txt(c, "$10", 285, 610, 110, WHITE)
    txt(c, "USDC", 285, 680, 40, GOLD)
    txta(c, "Chak zanmi ki", 285, 742, 30, GRAY, 0.8, bold=False)
    txta(c, "enskri ak verifye", 285, 778, 30, GRAY, 0.8, bold=False)
    # Friend card
    rrect(c, 570, 400, 450, 480, 42)
    c.set_source_rgba(*GREEN, 0.12); c.fill_preserve()
    c.set_source_rgba(*GREEN, 0.45); c.set_line_width(2.5); c.stroke()
    txta(c, "ZANMI OU", 795, 462, 32, GREEN, 0.9, bold=False)
    txt(c, "$5", 795, 610, 110, WHITE)
    txt(c, "USDC", 795, 680, 40, GREEN)
    txta(c, "Bonis byenveni", 795, 742, 30, GRAY, 0.8, bold=False)
    txta(c, "nan premye depo", 795, 778, 30, GRAY, 0.8, bold=False)
    # Total
    card(c, 70, 930, 940, 130, 36)
    txta(c, "Valè total pou 2 moun", CX, 987, 32, GRAY, 0.8, bold=False)
    txt(c, "$15 USDC", CX, 1040, 54, GOLD)
    watermark(c)
    return surf

def r4_s5():
    surf, c = new_surface()
    bg(c, glow=GOLD)
    header(c, "Kalkil Reyel", tc=GOLD)
    txt(c, "Refere zanmi,", CX, 348, 72, WHITE)
    txt(c, "ou genyen...", CX, 430, 72, WHITE)
    rows = [("1 zanmi refere","$10"), ("3 zanmi refere","$30"), ("5 zanmi refere","$50"), ("10 zanmi refere","$100")]
    for i, (lbl, val) in enumerate(rows):
        ry = 490 + i*165
        card(c, 70, ry, 940, 140, 34)
        txt(c, lbl, 130, ry+80, 44, GRAY, bold=False, align='left')
        txt(c, val, 950, ry+80, 52, GOLD, align='right')
    # No limit row
    rrect(c, 70, 1145, 940, 130, 36)
    c.set_source(lga(70,1145,1010,1275,[(0,(*GOLD,0.18)),(1,(*GOLD,0.06))])); c.fill_preserve()
    c.set_source_rgba(*GOLD,0.45); c.set_line_width(2); c.stroke()
    txt(c, "Limit referans:", 130, 1223, 44, GOLD, bold=False, align='left')
    txt(c, "San limit!", 950, 1223, 52, GOLD, align='right')
    watermark(c)
    return surf

def r4_s6():
    surf, c = new_surface()
    bg(c, glow=GOLD)
    header(c, "TchotchoPay", tc=GOLD)
    txt(c, "Envite zanmi.", CX, 380, 82, WHITE)
    txt(c, "Genyen lajan.", CX, 472, 82, GOLD)
    # Gold CTA box
    bh = 460
    rrect(c, 70, 560, 940, bh, 44)
    c.set_source(lga(70,560,1010,1020,[(0,(*GOLD,0.18)),(1,(*BLUE,0.18))])); c.fill_preserve()
    c.set_source_rgba(*GOLD, 0.5); c.set_line_width(2.5); c.stroke()
    txt(c, "Jwenn kod referans ou", CX, 655, 58, WHITE)
    txt(c, "Kòmanse Genyen $10", CX, 735, 58, GOLD)
    txta(c, "tchotchopay.com/refer", CX, 815, 36, CYAN, 1.0, bold=False)
    gold_btn(c, "Kòmanse Genyen $10", 860)
    watermark(c)
    return surf

# ═════════════════════════════════════════════════════════════════
#  MAIN
# ═════════════════════════════════════════════════════════════════
REELS = [
    {
        "name": "Voye Lajan (Send Money)",
        "scenes": [r1_s1, r1_s2, r1_s3, r1_s4, r1_s5, r1_s6],
        "durations": [5, 5, 5, 6, 5, 4],
        "prefix": "reel-sm-kr",
        "output": "reel-voye-lajan-kr.mp4",
    },
    {
        "name": "Kont USDC (Digital Savings)",
        "scenes": [r2_s1, r2_s2, r2_s3, r2_s4, r2_s5, r2_s6],
        "durations": [5, 5, 5, 6, 5, 4],
        "prefix": "reel-usdc-kr",
        "output": "reel-usdc-kr.mp4",
    },
    {
        "name": "Koman li Travay (How It Works)",
        "scenes": [r3_s1, r3_s2, r3_s3, r3_s4, r3_s5, r3_s6],
        "durations": [5, 5, 5, 6, 5, 4],
        "prefix": "reel-how-kr",
        "output": "reel-kouman-kr.mp4",
    },
    {
        "name": "Refere yon Zanmi (Referral)",
        "scenes": [r4_s1, r4_s2, r4_s3, r4_s4, r4_s5, r4_s6],
        "durations": [5, 5, 5, 6, 5, 4],
        "prefix": "reel-ref-kr",
        "output": "reel-refere-kr.mp4",
    },
]

def main():
    print("TchotchoPay Reel Renderer")
    print("=" * 44)
    for reel in REELS:
        print(f"\nRendering: {reel['name']}")
        frames = []
        for i, scene_fn in enumerate(reel["scenes"]):
            path = os.path.join(BASE, f"{reel['prefix']}-s{i+1}.png")
            surf = scene_fn()
            surf.write_to_png(path)
            frames.append(path)
            print(f"  Frame {i+1}/6  {os.path.basename(path)}")
        output = os.path.join(BASE, reel["output"])
        make_mp4(frames, reel["durations"], output)
        # Clean up PNGs
        for f in frames:
            try: os.remove(f)
            except: pass

    print("\nDone! MP4 files saved to:", BASE)

if __name__ == "__main__":
    main()
