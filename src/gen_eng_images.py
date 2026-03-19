from PIL import Image, ImageDraw, ImageFont
import os

# Canvas settings
W, H = 1080, 1440
BG = "#FAF7F2"
ACCENT = "#E8A87C"
DARK = "#2C2C2C"
GRAY = "#888888"
MARGIN = 100
FONT_PATH = "/System/Library/Fonts/Helvetica.ttc"
OUT_DIR = "/Users/zhengyi/my-app/src"

def get_font(size, bold=False):
    try:
        return ImageFont.truetype(FONT_PATH, size, index=1 if bold else 0)
    except:
        try:
            return ImageFont.truetype("/System/Library/Fonts/Arial.ttf", size)
        except:
            return ImageFont.load_default()

def draw_brand(draw):
    # Orange square
    draw.rectangle([MARGIN, MARGIN, MARGIN+36, MARGIN+36], fill=ACCENT)
    font = get_font(22, bold=True)
    draw.text((MARGIN+46, MARGIN+6), "AI Era", font=font, fill=DARK)

def draw_page_num(draw, n, total=5):
    font = get_font(26)
    text = f"{n}/{total}"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((W - MARGIN - tw, H - MARGIN - 30), text, font=font, fill=GRAY)

def draw_accent_line(draw, y):
    draw.rectangle([MARGIN, y, MARGIN+60, y+5], fill=ACCENT)

def wrap_text(text, font, max_width, draw):
    lines = []
    for paragraph in text.split('\n'):
        if paragraph.strip() == '':
            lines.append('')
            continue
        words = paragraph.split(' ')
        current = ''
        for word in words:
            test = (current + ' ' + word).strip()
            bbox = draw.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] <= max_width:
                current = test
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
    return lines

def draw_body_text(draw, text, x, y, max_width, font, line_height_mult=1.6):
    lines = wrap_text(text, font, max_width, draw)
    font_size = 30
    line_h = int(font_size * line_height_mult)
    for line in lines:
        if line == '':
            y += int(line_h * 0.6)
        else:
            draw.text((x, y), line, font=font, fill=DARK)
            y += line_h
    return y

# ── Illustrations ──────────────────────────────────────────────

def draw_robot(draw, cx, cy):
    # Head
    draw.rectangle([cx-45, cy-80, cx+45, cy-20], outline=DARK, width=3)
    # Eyes
    draw.ellipse([cx-28, cy-65, cx-14, cy-51], outline=ACCENT, width=3)
    draw.ellipse([cx+14, cy-65, cx+28, cy-51], outline=ACCENT, width=3)
    # Mouth
    draw.line([cx-20, cy-32, cx+20, cy-32], fill=ACCENT, width=3)
    # Antenna
    draw.line([cx, cy-80, cx, cy-100], fill=DARK, width=3)
    draw.ellipse([cx-6, cy-108, cx+6, cy-96], fill=ACCENT)
    # Body
    draw.rectangle([cx-55, cy-18, cx+55, cy+60], outline=DARK, width=3)
    # Arms
    draw.line([cx-55, cy, cx-80, cy+30], fill=DARK, width=3)
    draw.line([cx+55, cy, cx+80, cy+30], fill=DARK, width=3)
    # Legs
    draw.line([cx-25, cy+60, cx-25, cy+95], fill=DARK, width=3)
    draw.line([cx+25, cy+60, cx+25, cy+95], fill=DARK, width=3)
    # Chest detail
    draw.rectangle([cx-20, cy+5, cx+20, cy+35], outline=ACCENT, width=2)

def draw_boat(draw, cx, cy):
    # Hull
    draw.polygon([(cx-70, cy), (cx+70, cy), (cx+50, cy+40), (cx-50, cy+40)], outline=DARK, width=3)
    # Mast
    draw.line([cx, cy, cx, cy-90], fill=DARK, width=3)
    # Sail
    draw.polygon([(cx, cy-85), (cx, cy-20), (cx+55, cy-40)], outline=DARK, width=2)
    draw.polygon([(cx, cy-85), (cx, cy-20), (cx-40, cy-50)], outline=ACCENT, width=2)
    # Waves
    for i in range(3):
        ox = cx - 80 + i*20
        oy = cy + 50 + i*8
        draw.arc([ox, oy, ox+40, oy+20], 180, 0, fill=DARK, width=2)

def draw_question_marks(draw, cx, cy):
    font_big = get_font(90, bold=True)
    for i, (dx, col) in enumerate([(-90, GRAY), (0, ACCENT), (90, GRAY)]):
        draw.text((cx + dx - 22, cy - 55), "?", font=font_big, fill=col)

def draw_wave(draw, y):
    import math
    points = []
    for x in range(MARGIN, W - MARGIN, 4):
        wy = y + int(18 * math.sin((x - MARGIN) * 0.025))
        points.append((x, wy))
    for i in range(len(points) - 1):
        draw.line([points[i], points[i+1]], fill=ACCENT, width=3)
    # Second wave offset
    points2 = []
    for x in range(MARGIN, W - MARGIN, 4):
        wy = y + 28 + int(14 * math.sin((x - MARGIN) * 0.025 + 1.2))
        points2.append((x, wy))
    for i in range(len(points2) - 1):
        draw.line([points2[i], points2[i+1]], fill=DARK, width=2)

def draw_compass(draw, cx, cy):
    r = 55
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=DARK, width=3)
    draw.ellipse([cx-r+10, cy-r+10, cx+r-10, cy+r-10], outline=ACCENT, width=1)
    # Cardinal points
    font_sm = get_font(20, bold=True)
    for label, dx, dy in [("N", 0, -r+8), ("S", 0, r-22), ("E", r-18, -6), ("W", -r+8, -6)]:
        draw.text((cx+dx-6, cy+dy), label, font=font_sm, fill=DARK)
    # Needle
    draw.polygon([(cx, cy-r+22), (cx-8, cy+10), (cx, cy+5), (cx+8, cy+10)], fill=ACCENT)
    draw.polygon([(cx, cy+r-22), (cx-8, cy-10), (cx, cy-5), (cx+8, cy-10)], fill=DARK)
    # Center dot
    draw.ellipse([cx-5, cy-5, cx+5, cy+5], fill=DARK)

# ── Pages ──────────────────────────────────────────────────────

def make_page1():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_brand(draw)
    draw_page_num(draw, 1)

    # Robot illustration centered upper area
    draw_robot(draw, W//2, 340)

    # Accent line
    draw_accent_line(draw, 530)

    # Title
    title_font = get_font(52, bold=True)
    title = "OpenClaw & The Layoff Wave"
    # wrap title
    lines = wrap_text(title, title_font, W - 2*MARGIN, draw)
    y = 560
    for line in lines:
        draw.text((MARGIN, y), line, font=title_font, fill=DARK)
        bbox = draw.textbbox((0,0), line, font=title_font)
        y += int((bbox[3]-bbox[1]) * 1.2)

    # Subtitle
    sub_font = get_font(34)
    sub = "Navigating the AI Odyssey Era"
    draw.text((MARGIN, y + 20), sub, font=sub_font, fill=ACCENT)

    # Decorative bottom line
    draw.rectangle([MARGIN, H - MARGIN - 8, W - MARGIN, H - MARGIN - 3], fill=ACCENT)

    img.save(os.path.join(OUT_DIR, "eng_01.png"))
    print("Saved eng_01.png")

def make_page2():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_brand(draw)
    draw_page_num(draw, 2)

    draw_accent_line(draw, 180)

    title_font = get_font(52, bold=True)
    draw.text((MARGIN, 200), "Why Is This the", font=title_font, fill=DARK)
    draw.text((MARGIN, 270), "Odyssey Era?", font=title_font, fill=ACCENT)

    body_font = get_font(30)
    body = (
        "OpenClaw laid off 200 engineers overnight.\n"
        "Not because they underperformed —\n"
        "but because AI can now do their jobs.\n"
        "\n"
        "This isn't a typical recession.\n"
        "It's a structural shift.\n"
        "\n"
        "Like Odysseus lost at sea,\n"
        "we're between two worlds:\n"
        "the old one has ended,\n"
        "the new one hasn't arrived yet."
    )
    draw_body_text(draw, body, MARGIN, 380, W - 2*MARGIN, body_font)

    # Boat bottom right
    draw_boat(draw, W - MARGIN - 100, H - MARGIN - 120)

    img.save(os.path.join(OUT_DIR, "eng_02.png"))
    print("Saved eng_02.png")

def make_page3():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_brand(draw)
    draw_page_num(draw, 3)

    draw_accent_line(draw, 180)

    title_font = get_font(52, bold=True)
    draw.text((MARGIN, 200), "Why Are We", font=title_font, fill=DARK)
    draw.text((MARGIN, 270), "So Afraid?", font=title_font, fill=ACCENT)

    body_font = get_font(30)
    body = (
        "Because this time, it's different.\n"
        "\n"
        "Past automation replaced physical labor.\n"
        "AI is replacing cognitive work —\n"
        "writing, coding, analysis, design.\n"
        "\n"
        "The skills we spent years building\n"
        "may become obsolete overnight.\n"
        "\n"
        "That's not irrational fear.\n"
        "That's a rational response\n"
        "to a real disruption."
    )
    draw_body_text(draw, body, MARGIN, 380, W - 2*MARGIN, body_font)

    # Question marks decoration center-bottom area
    draw_question_marks(draw, W//2, H - 280)

    img.save(os.path.join(OUT_DIR, "eng_03.png"))
    print("Saved eng_03.png")

def make_page4():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_brand(draw)
    draw_page_num(draw, 4)

    draw_accent_line(draw, 180)

    title_font = get_font(52, bold=True)
    draw.text((MARGIN, 200), "A Deeper", font=title_font, fill=DARK)
    draw.text((MARGIN, 270), "Fracture", font=title_font, fill=ACCENT)

    body_font = get_font(30)
    body = (
        "It's not just about jobs.\n"
        "\n"
        "It's about identity.\n"
        "We defined ourselves by our work.\n"
        "'I am an engineer.'\n"
        "'I am a designer.'\n"
        "\n"
        "When AI can do that work,\n"
        "who are we?\n"
        "\n"
        "This is the real crisis —\n"
        "not economic, but existential."
    )
    draw_body_text(draw, body, MARGIN, 380, W - 2*MARGIN, body_font)

    # Wave at bottom
    draw_wave(draw, H - MARGIN - 80)

    img.save(os.path.join(OUT_DIR, "eng_04.png"))
    print("Saved eng_04.png")

def make_page5():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_brand(draw)
    draw_page_num(draw, 5)

    # Compass top right
    draw_compass(draw, W - MARGIN - 70, MARGIN + 70)

    draw_accent_line(draw, 220)

    title_font = get_font(48, bold=True)
    draw.text((MARGIN, 240), "How to Navigate", font=title_font, fill=DARK)
    draw.text((MARGIN, 300), "the Odyssey Era", font=title_font, fill=ACCENT)

    body_font = get_font(28)
    body = (
        "1. Stop optimizing for the old world.\n"
        "   Learn to work with AI, not against it.\n"
        "\n"
        "2. Invest in what AI can't replicate:\n"
        "   judgment, relationships, creativity.\n"
        "\n"
        "3. Embrace the uncertainty.\n"
        "   Odysseus didn't know the way home —\n"
        "   he kept moving anyway.\n"
        "\n"
        "4. Build a portfolio of skills,\n"
        "   not a single identity.\n"
        "\n"
        "The sea is rough.\n"
        "But you have a ship."
    )
    draw_body_text(draw, body, MARGIN, 400, W - 2*MARGIN, body_font, line_height_mult=1.55)

    # Bottom accent bar
    draw.rectangle([MARGIN, H - MARGIN - 8, W - MARGIN, H - MARGIN - 3], fill=ACCENT)

    img.save(os.path.join(OUT_DIR, "eng_05.png"))
    print("Saved eng_05.png")

if __name__ == "__main__":
    make_page1()
    make_page2()
    make_page3()
    make_page4()
    make_page5()
    print("All done.")
