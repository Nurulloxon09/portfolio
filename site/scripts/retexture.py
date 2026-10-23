"""Removes Henry Heffernan's branding from the baked 3D textures and draws
Nurulloxon's own marks in the same places: the monitor and keyboard logos, the
two stickers on the back, and the sheet of paper on the desk.

The scores on the paper and the stickers are written here, so run this again
if they change. It needs the original textures, which are not in this repo:

    git clone --depth 1 https://github.com/henryjeff/portfolio-website /tmp/henry
    pip install pillow numpy
    python3 scripts/retexture.py /tmp/henry/static public/scene

It writes public/scene/models/baked_computer.jpg and baked_decor.jpg, and uses
the FreeSans and Liberation Mono fonts (Debian/Ubuntu: fonts-freefont-ttf,
fonts-liberation).
"""

import random
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

SRC, DEST = sys.argv[1], sys.argv[2]

FONT_DIR = "/usr/share/fonts/truetype"
BOLD_OBLIQUE = f"{FONT_DIR}/freefont/FreeSansBoldOblique.ttf"
OBLIQUE = f"{FONT_DIR}/freefont/FreeSansOblique.ttf"
SANS = f"{FONT_DIR}/freefont/FreeSans.ttf"
MONO = f"{FONT_DIR}/liberation/LiberationMono-Regular.ttf"
MONO_BOLD = f"{FONT_DIR}/liberation/LiberationMono-Bold.ttf"

random.seed(7)


def font(path, size):
    return ImageFont.truetype(path, size)


def fill_from_border(arr, box, grain=0.0):
    """Paints over box (x0, y0, x1, y1) by interpolating the pixels on its
    border (a Coons patch), so smooth shading carries straight across."""
    x0, y0, x1, y1 = box
    top = arr[y0, x0:x1].astype(float)
    bottom = arr[y1, x0:x1].astype(float)
    left = arr[y0:y1, x0].astype(float)
    right = arr[y0:y1, x1].astype(float)
    h, w = y1 - y0, x1 - x0
    v = np.linspace(0, 1, h)[:, None, None]
    u = np.linspace(0, 1, w)[None, :, None]
    vertical = top[None] * (1 - v) + bottom[None] * v
    horizontal = left[:, None] * (1 - u) + right[:, None] * u
    corners = (
        arr[y0, x0] * (1 - u) * (1 - v)
        + arr[y0, x1] * u * (1 - v)
        + arr[y1, x0] * (1 - u) * v
        + arr[y1, x1] * u * v
    )
    patch = vertical + horizontal - corners
    if grain:
        patch += np.random.default_rng(1).normal(0, grain, (h, w, 1))
    arr[y0:y1, x0:x1] = np.clip(patch, 0, 255).astype(np.uint8)


def fill_rounded(img, box, color, radius):
    ImageDraw.Draw(img).rounded_rectangle(box, radius=radius, fill=color)


def pi_badge(size, color, stroke):
    """The new logo mark: a pi in a circle (instead of the original globe)."""
    mark = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(mark)
    d.ellipse((stroke // 2, stroke // 2, size - stroke // 2 - 1, size - stroke // 2 - 1), outline=color, width=stroke)
    f = font(SANS, int(size * 0.72))
    d.text((size / 2, size / 2 + size * 0.02), "π", font=f, fill=color, anchor="mm")
    return mark


def logo(height, name_size, sub_size, color):
    """'Nurulloxon / sat math' wordmark with the pi badge, on transparency.
    The layer is as wide as the wordmark needs."""
    name_font = font(BOLD_OBLIQUE, name_size)
    badge = pi_badge(int(height * 0.86), color, max(2, height // 18))
    x = badge.width + int(height * 0.14)
    width = x + int(name_font.getlength("Nurulloxon")) + name_size // 4
    layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    layer.alpha_composite(badge, (0, (height - badge.height) // 2))
    d.text((x, height * 0.06), "Nurulloxon", font=name_font, fill=color, anchor="lt")
    d.text((x + name_size * 0.1, height * 0.94), "sat teacher", font=font(OBLIQUE, sub_size), fill=color, anchor="lb")
    return layer


def label(width, height, base, ink):
    """The product sticker on the back of the monitor and the PC case."""
    layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    s = height / 145
    d.text((14 * s, 12 * s), "Nurulloxon Showcase 2026", font=font(BOLD_OBLIQUE, int(15 * s)), fill=ink)
    d.text((14 * s, 30 * s), "sat teacher", font=font(OBLIQUE, int(10 * s)), fill=ink)
    small = font(SANS, int(8 * s))
    d.text((14 * s, 50 * s), "SAT 1440  ·  Math 750  ·  R&W 690  ·  IELTS 7.0", font=small, fill=ink)
    d.text((14 * s, 62 * s), "Math and Reading & Writing. Diagnostic on day one.", font=small, fill=ink)
    d.text((14 * s, 84 * s), "Model No.", font=small, fill=ink)
    d.text((60 * s, 84 * s), "SAT-750", font=small, fill=ink)
    d.text((14 * s, 96 * s), "Input", font=small, fill=ink)
    d.text((60 * s, 96 * s), "220V", font=small, fill=ink)
    d.text((14 * s, 124 * s), "Assembled in Namangan", font=small, fill=ink)
    badge = pi_badge(int(26 * s), ink, max(1, int(2 * s)))
    layer.alpha_composite(badge, (int(width - 116 * s), int(80 * s)))
    d.text((width - 86 * s, 82 * s), "Nurulloxon", font=font(BOLD_OBLIQUE, int(12 * s)), fill=ink)
    d.text((width - 84 * s, 96 * s), "sat teacher", font=font(OBLIQUE, int(8 * s)), fill=ink)
    # A made-up barcode
    x = width - 118 * s
    while x < width - 14 * s:
        bar = random.choice((1, 1, 2, 3)) * s
        d.rectangle((x, 116 * s, x + max(bar - 1, 0), 134 * s), fill=ink)
        x += bar + random.choice((1, 2)) * s
    return layer


def computer():
    img = Image.open(f"{SRC}/models/Computer/baked_computer.jpg").convert("RGB")
    arr = np.asarray(img).copy()

    # 1. Monitor bezel wordmark (stored upside down in the UV layout)
    fill_from_border(arr, (1328, 2646, 1666, 2742), grain=2.5)
    # 2. Keyboard badge wordmark
    fill_from_border(arr, (2268, 1932, 2398, 1977), grain=1.5)
    img = Image.fromarray(arr)

    # Right-aligned to where the original mark ended (the layout is rotated 180°)
    mark = logo(76, 44, 24, (52, 52, 52, 255)).rotate(180)
    img.paste(mark, (1656 - mark.width, 2658), mark)
    mark = logo(32, 18, 10, (92, 92, 92, 255))
    img.paste(mark, (2332 - mark.width // 2, 1938), mark)

    # 3. Sticker on the back of the monitor (rotated 90° in the layout)
    base = tuple(int(c) for c in np.median(np.asarray(img)[600:700, 1720:1730].reshape(-1, 3), axis=0))
    fill_rounded(img, (1702, 541, 1828, 741), base, 10)
    sticker = label(198, 124, base, (205, 205, 205, 255)).rotate(90, expand=True)
    img.paste(sticker, (1704, 542), sticker)

    # 4. Sticker on the back of the PC case
    base = tuple(int(c) for c in np.median(np.asarray(img)[3300:3310, 2800:2900].reshape(-1, 3), axis=0))
    fill_rounded(img, (2774, 3295, 2992, 3440), base, 12)
    sticker = label(214, 140, base, (205, 205, 205, 255))
    img.paste(sticker, (2776, 3298), sticker)

    img.save(f"{DEST}/models/baked_computer.jpg", quality=88, optimize=True, progressive=True)


def decor():
    img = Image.open(f"{SRC}/models/Decor/baked_decor_modified.jpg").convert("RGB")
    arr = np.asarray(img).copy()
    # The credits sheet lying on the desk
    fill_from_border(arr, (380, 288, 1612, 2684), grain=1.2)
    img = Image.fromarray(arr)
    d = ImageDraw.Draw(img)
    ink = (112, 112, 112)
    head = font(MONO_BOLD, 50)
    body = font(MONO, 48)
    cx = 996

    def center(y, text, f=body):
        d.text((cx, y), text, font=f, fill=ink, anchor="mm")

    def row(y, left, right):
        d.text((400, y), left, font=body, fill=ink, anchor="lm")
        d.text((1592, y), right, font=body, fill=ink, anchor="rm")

    center(330, '"Nurulloxon Showcase 2026"', head)
    center(420, "SAT TEACHER", head)
    center(510, "Namangan")

    center(700, "SCORES", head)
    row(790, "SAT Total", "1440")
    row(860, "Math", "750 / 800")
    row(930, "Reading & Writing", "690 / 800")
    row(1000, "IELTS", "7.0")

    center(1160, "WHAT I TEACH", head)
    center(1245, "- Math -")
    center(1310, "Algebra · Advanced Math")
    center(1375, "Problem-Solving & Data Analysis")
    center(1440, "Geometry & Trigonometry")
    center(1525, "- Reading and Writing -")
    center(1590, "Information and Ideas")
    center(1655, "Craft and Structure")
    center(1720, "Expression of Ideas")
    center(1785, "Standard English Conventions")

    center(1940, "HOW I TEACH", head)
    center(2025, "1. A diagnostic on day one")
    center(2090, "2. Lessons on the weak topics")
    center(2155, "3. Every mistake analyzed")
    center(2220, "4. Timed mock tests")
    center(2285, "5. Progress tracked and shared")

    center(2540, "Thank you for checking out")
    center(2610, "my portfolio <3")

    img.save(f"{DEST}/models/baked_decor.jpg", quality=88, optimize=True, progressive=True)


computer()
decor()
