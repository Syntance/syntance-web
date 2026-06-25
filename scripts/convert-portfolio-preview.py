from pathlib import Path
import sys

from PIL import Image

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2])

im = Image.open(SRC).convert("RGB")
im.resize((1200, 630), Image.Resampling.LANCZOS).save(
    OUT,
    format="WEBP",
    quality=92,
    method=6,
)
SRC.unlink(missing_ok=True)
print(f"saved {OUT} from {im.size[0]}x{im.size[1]}")
