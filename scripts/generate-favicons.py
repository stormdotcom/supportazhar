"""Build site icons from public/favicon.svg with CairoSVG and Pillow."""

from io import BytesIO
from pathlib import Path

import cairosvg
from PIL import Image


root = Path(__file__).resolve().parents[1]
public = root / "public"
source = public / "favicon.svg"


def render(size: int) -> Image.Image:
    data = cairosvg.svg2png(url=str(source), output_width=size, output_height=size)
    return Image.open(BytesIO(data)).convert("RGBA")


for size in (16, 32):
    render(size).save(public / f"favicon-{size}x{size}.png")

for size in (120, 152, 167):
    render(size).save(public / f"apple-touch-icon-{size}x{size}.png")

render(180).save(public / "apple-touch-icon.png")
for size in (192, 512):
    render(size).save(public / f"android-chrome-{size}x{size}.png")

render(48).save(public / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
