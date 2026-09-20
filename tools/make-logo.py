#!/usr/bin/env python3
"""Generate brand-coloured logo assets from the client-supplied PDF logo."""
import re
import subprocess
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent   # repo root
SRC_PDF = ROOT / "brief" / "Aiki_Dent_logo_h.pdf"
OUT = ROOT / "static"
BUILD = ROOT / ".logo-build"

BUILD.mkdir(parents=True, exist_ok=True)
(BUILD / "logo.svg").unlink(missing_ok=True)
subprocess.run(["pdftocairo", "-svg", str(SRC_PDF), str(BUILD / "logo.svg")], check=True)

raw = (BUILD / "logo.svg").read_text(encoding="utf-8")
ORIG_FILL = 'fill="rgb(75.02594%, 10.392761%, 17.410278%)"'
assert ORIG_FILL in raw, "unexpected logo fill colour"

# Full logo geometry (points, from the PDF MediaBox)
FULL_BOX = "0 0 1001.15 441.448"
# Emblem-only geometry: the round mark sits left of the "Aiki Dent" wordmark
MARK_BOX = "97.2 37.8 364.6 346.3"


def recolour(svg: str, colour: str) -> str:
    return svg.replace(ORIG_FILL, f'fill="{colour}"')


def with_viewbox(svg: str, box: str) -> str:
    svg = re.sub(r'viewBox="[^"]*"', f'viewBox="{box}"', svg, count=1)
    w, h = box.split()[2:4]
    svg = re.sub(r'width="[^"]*"', f'width="{w}pt"', svg, count=1)
    svg = re.sub(r'height="[^"]*"', f'height="{h}pt"', svg, count=1)
    return svg


WINE = "#811331"
CREAM = "#fffaf8"

(OUT / "img").mkdir(parents=True, exist_ok=True)

variants = {
    "img/logo.svg": with_viewbox(recolour(raw, WINE), FULL_BOX),
    "img/logo-white.svg": with_viewbox(recolour(raw, CREAM), FULL_BOX),
    "img/logo-mark.svg": with_viewbox(recolour(raw, WINE), MARK_BOX),
    "img/logo-mark-white.svg": with_viewbox(recolour(raw, CREAM), MARK_BOX),
}
for name, svg in variants.items():
    (OUT / name).write_text(svg, encoding="utf-8")
    print("wrote", name, len(svg), "bytes")

# Raster favicons from the emblem-only artwork
png = BUILD / "mark.png"
subprocess.run(
    ["pdftocairo", "-png", "-transp", "-r", "600", "-x", "810", "-y", "315",
     "-W", "3040", "-H", "2890", str(SRC_PDF), str(BUILD / "markfull")],
    check=True,
)
src = BUILD / "markfull-1.png"
from PIL import Image  # noqa: E402

im = Image.open(src).convert("RGBA")
im = im.crop(im.getbbox())
side = max(im.size)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
for size in (180, 192, 512, 32):
    canvas.resize((size, size), Image.LANCZOS).save(OUT / f"img/favicon-{size}.png")
canvas.resize((32, 32), Image.LANCZOS).save(OUT / "favicon.ico", sizes=[(32, 32), (16, 16)])
canvas.resize((180, 180), Image.LANCZOS).save(OUT / "img/apple-touch-icon.png")
(OUT / "favicon.svg").write_text(variants["img/logo-mark.svg"], encoding="utf-8")
print("favicons written")
