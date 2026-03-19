# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import os, math

W, H = 1080, 1440
BG      = "#FAF7F2"
ACCENT  = "#E8A87C"
BLACK   = "#1A1A1A"
GRAY    = "#888888"
MARGIN  = 100
TEXT_W  = W - MARGIN * 2

FONT_PATHS = [
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Light.ttc",
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/Library/Fonts/Arial Unicode MS.ttf",
]

def load_font(size):
    for p in FONT_PATHS:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()

def wrap_text(text, font, max_width, draw):
    lines = []
    for paragraph in text.split("\n"):
        if paragraph.strip() == "":
            lines.append("")
            continue
        line = ""
        for ch in paragraph:
            test = line + ch
            bbox = draw.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] > max_width and line:
                lines.append(line)
                line = ch
            else:
                line = test
        if line:
            lines.append(line)
    return lines

def draw_text_block(draw, text, font, x, y, max_width, line_spacing=1.6, color=BLACK):
    lines = wrap_text(text, font, max_width, draw)
    bbox = draw.textbbox((0, 0), "测", font=font)
    line_h = int((bbox[3] - bbox[1]) * line_spacing)
    for line in lines:
        draw.text((x, y), line, font=font, fill=color)
        y += line_h
    return y

def draw_base(img, draw, page, total=5):
    draw.rectangle([0, 0, W, H], fill=BG)
    draw.rectangle([MARGIN, 40, MARGIN + 44, 84], fill=ACCENT)
    brand_font = load_font(22)
    draw.text((MARGIN + 52, 48), "AI\u65f6\u4ee3", font=brand_font, fill=BLACK)
    draw.rectangle([MARGIN, H - 60, W - MARGIN, H - 57], fill=ACCENT)
    pg_font = load_font(26)
    pg_text = f"{page}/{total}"
    bbox = draw.textbbox((0, 0), pg_text, font=pg_font)
    pw = bbox[2] - bbox[0]
    draw.text((W - MARGIN - pw, H - 52), pg_text, font=pg_font, fill=GRAY)

# ── illustrations ─────────────────────────────────────────

def draw_robot(draw, cx, cy):
    lw = 4
    draw.rounded_rectangle([cx-60, cy-80, cx+60, cy+10], radius=12, outline=BLACK, width=lw)
    draw.ellipse([cx-30, cy-55, cx-10, cy-35], outline=BLACK, width=lw)
    draw.ellipse([cx+10, cy-55, cx+30, cy-35], outline=BLACK, width=lw)
    draw.arc([cx-20, cy-20, cx+20, cy], start=0, end=180, fill=BLACK, width=lw)
    draw.rectangle([cx-50, cy+18, cx+50, cy+90], outline=BLACK, width=lw)
    draw.line([cx, cy-80, cx, cy-110], fill=BLACK, width=lw)
    draw.ellipse([cx-8, cy-122, cx+8, cy-108], outline=ACCENT, width=lw)
    draw.line([cx-50, cy+30, cx-80, cy+60], fill=BLACK, width=lw)
    draw.line([cx+50, cy+30, cx+80, cy+60], fill=BLACK, width=lw)
    draw.line([cx-25, cy+90, cx-25, cy+130], fill=BLACK, width=lw)
    draw.line([cx+25, cy+90, cx+25, cy+130], fill=BLACK, width=lw)

def draw_boat(draw, cx, cy):
    lw = 4
    pts = [(cx-80, cy), (cx+80, cy), (cx+60, cy+40), (cx-60, cy+40)]
    for i in range(len(pts)):
        draw.line([pts[i], pts[(i+1) % len(pts)]], fill=BLACK, width=lw)
    draw.line([cx, cy, cx, cy-100], fill=BLACK, width=lw)
    draw.polygon([(cx, cy-100), (cx, cy-10), (cx+60, cy-40)], outline=BLACK, fill="#F0E8DC")
    for i in range(-2, 3):
        ox = cx + i * 30
        draw.arc([ox-15, cy+45, ox+15, cy+65], start=0, end=180, fill=BLACK, width=3)

def draw_question_marks(draw, cx, cy):
    font = load_font(80)
    positions = [cx - 100, cx, cx + 100]
    colors = [BLACK, ACCENT, BLACK]
    for px, col in zip(positions, colors):
        bbox = draw.textbbox((0, 0), "?", font=font)
        pw = bbox[2] - bbox[0]
        draw.text((px - pw // 2, cy - 50), "?", font=font, fill=col)

def draw_wave(draw, cy):
    lw = 4
    step = 60
    amp = 20
    x = MARGIN
    while x < W - MARGIN - step:
        draw.arc([x, cy - amp, x + step, cy + amp], start=0, end=180, fill=ACCENT, width=lw)
        draw.arc([x + step, cy - amp, x + step * 2, cy + amp], start=180, end=360, fill=BLACK, width=lw)
        x += step * 2

def draw_compass(draw, cx, cy):
    lw = 4
    r = 70
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=BLACK, width=lw)
    draw.ellipse([cx-6, cy-6, cx+6, cy+6], fill=BLACK)
    for angle_deg in [90, 0, 270, 180]:
        rad = math.radians(angle_deg)
        x1 = cx + int((r - 15) * math.cos(rad))
        y1 = cy - int((r - 15) * math.sin(rad))
        x2 = cx + int(r * math.cos(rad))
        y2 = cy - int(r * math.sin(rad))
        draw.line([x1, y1, x2, y2], fill=BLACK, width=lw)
    draw.polygon([(cx, cy - r + 20), (cx - 10, cy + 10), (cx, cy - 5), (cx + 10, cy + 10)],
                 fill=ACCENT, outline=BLACK)
    draw.polygon([(cx, cy + r - 20), (cx - 10, cy - 10), (cx, cy + 5), (cx + 10, cy - 10)],
                 fill=BLACK, outline=BLACK)



# ── page generators ───────────────────────────────────────

def make_01():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_base(img, draw, 1)
    draw_robot(draw, W // 2, 220)
    title_font = load_font(48)
    body_font  = load_font(30)
    sub_font   = load_font(32)

    y = 400
    draw.text((MARGIN, y), "OpenClaw", font=title_font, fill=ACCENT)
    y += 65
    draw.text((MARGIN, y), "& 裁员潮", font=title_font, fill=BLACK)
    y += 70
    draw.text((MARGIN, y), "一个时代失控的开始", font=sub_font, fill=GRAY)
    y += 60
    draw.rectangle([MARGIN, y, MARGIN + 80, y + 4], fill=ACCENT)
    y += 30

    body = (
        "最近有两个词在中国互联网同时爆火：OpenClaw 和 裁员潮。\n"
        "一个是让AI直接接管你电脑的工具，500元一次的上门部署供不应求，"
        "有人戟称「龙虾都没AI香」；另一个是各大厂陆续传出的消息——"
        "程序员、设计师、运营，那些曾经被视为「高薪铁饭碗」的岗位，正在成批消失。\n"
        "这两个词看似无关，实则是同一枚硬币的两面："
        "一边是人们疯狂地拥抱AI，另一边是AI正在疯狂地替代人。"
    )
    draw_text_block(draw, body, body_font, MARGIN, y, TEXT_W)
    img.save("/Users/zhengyi/my-app/src/xhs_01.png")
    print("xhs_01.png saved")


def make_02():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_base(img, draw, 2)
    title_font = load_font(48)
    body_font  = load_font(30)

    y = 120
    title = "为什么说现在是「奥德赛时期」？"
    y = draw_text_block(draw, title, title_font, MARGIN, y, TEXT_W, line_spacing=1.4)
    y += 20
    draw.rectangle([MARGIN, y, MARGIN + 80, y + 4], fill=ACCENT)
    y += 30

    body = (
        "我们正处在从「生成式工具」向「通用人工智能（AGI）」跨越的夹缝里。\n\n"
        "旧秩序已经失效——那些过去需要苦学4年的编程能力，现在被AI Coding"
        "轻松抒平。曾经被视为「专业壁垒」的硬技能，正在以肉眼可见的速度瓦解。\n\n"
        "新秩序尚未建立——人类已经窥见了AGI的一角，但没人知道它到底会带来"
        "新一轮的繁荣，还是彻底的失业海噚。\n\n"
        "我们就像奥德赛一样，离开了熟悉的战场，却还没望见那个可以安放余生的码头。"
    )
    y = draw_text_block(draw, body, body_font, MARGIN, y, TEXT_W)
    draw_boat(draw, W - 180, min(y + 130, H - 160))
    img.save("/Users/zhengyi/my-app/src/xhs_02.png")
    print("xhs_02.png saved")


def make_03():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_base(img, draw, 3)
    title_font = load_font(48)
    body_font  = load_font(30)
    num_font   = load_font(34)

    draw_question_marks(draw, W // 2, 130)

    y = 240
    draw.text((MARGIN, y), "我们为什么会如此恐慕？", font=title_font, fill=BLACK)
    y += 70
    draw.rectangle([MARGIN, y, MARGIN + 80, y + 4], fill=ACCENT)
    y += 30

    items = [
        ("① ", "我到底还能做什么？\n当编程、设计、写作都能被AI低成本替代时，人的价值究竟在哪里？"),
        ("② ", "我会属于哪个群体？\n是成为被AI赋能的少数派精英，还是沦为被技术浪潮甩下的多数派弃儿？"),
        ("③ ", "未来的生活会长什么样？\n当「努力就能成功」的叙事彻底失效，我们又该如何安放自己的存在价值？"),
    ]

    for num, text in items:
        draw.text((MARGIN, y), num, font=num_font, fill=ACCENT)
        bbox = draw.textbbox((0, 0), num, font=num_font)
        indent = bbox[2] - bbox[0] + 8
        y = draw_text_block(draw, text, body_font, MARGIN + indent, y, TEXT_W - indent)
        y += 24

    img.save("/Users/zhengyi/my-app/src/xhs_03.png")
    print("xhs_03.png saved")


def make_04():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_base(img, draw, 4)
    title_font = load_font(48)
    body_font  = load_font(30)

    y = 120
    draw.text((MARGIN, y), "这是一场更深层的断裂", font=title_font, fill=BLACK)
    y += 70
    draw.rectangle([MARGIN, y, MARGIN + 80, y + 4], fill=ACCENT)
    y += 30

    body = (
        "如果说蒸汽机革命是人类第一次被迫剥离「体力劳动」与自我价值的强绑定，\n"
        "那么2026年，则是人类第二次亲手推翻与「智力挂钉」的自我价值认同。\n\n"
        "当逻辑、推理甚至创造力都不再是人类的特权，那种「每一个决定都在赌未来」"
        "的深重惶恐，正是我们这个时代的集体底色。"
    )
    y = draw_text_block(draw, body, body_font, MARGIN, y, TEXT_W)
    draw_wave(draw, min(y + 80, H - 160))
    img.save("/Users/zhengyi/my-app/src/xhs_04.png")
    print("xhs_04.png saved")


def make_05():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_base(img, draw, 5)
    title_font = load_font(44)
    body_font  = load_font(29)
    label_font = load_font(30)

    draw_compass(draw, W // 2, 160)

    y = 300
    draw.text((MARGIN, y), "如何从容度过「奥德赛时期」？", font=title_font, fill=BLACK)
    y += 65
    draw.rectangle([MARGIN, y, MARGIN + 80, y + 4], fill=ACCENT)
    y += 28

    points = [
        ("第一点", "接受「技术流动的常态」，不要再试图寻找永远安全的工具。"),
        ("第二点", "价值驱动而非工具驱动，成为能定义复杂问题并利用AI闭环解决的人。"),
        ("第三点", "建立可掌控的「AI支线任务」，在宏观不确定中守住微观掌控权。"),
        ("第四点", "用「原型设计」的方式去生活，在奥德赛时期，身份通过实验获得，而非规划。"),
    ]

    for label, text in points:
        lb_bbox = draw.textbbox((0, 0), label, font=label_font)
        lb_w = lb_bbox[2] - lb_bbox[0] + 20
        lb_h = lb_bbox[3] - lb_bbox[1] + 10
        draw.rounded_rectangle([MARGIN, y, MARGIN + lb_w, y + lb_h], radius=6, fill=ACCENT)
        draw.text((MARGIN + 10, y + 5), label, font=label_font, fill="white")
        y += lb_h + 8
        y = draw_text_block(draw, text, body_font, MARGIN, y, TEXT_W)
        y += 18

    img.save("/Users/zhengyi/my-app/src/xhs_05.png")
    print("xhs_05.png saved")


if __name__ == "__main__":
    make_01()
    make_02()
    make_03()
    make_04()
    make_05()
    print("全部完成！")
