"""Optimise les illustrations sources (art-src/) vers public/art/ + icônes PWA.

Les PNG d'origine (lourds) restent dans art-src/, hors du site déployé.
Usage : python3 scripts/optimize-art.py   (nécessite Pillow)
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art-src"
OUT = ROOT / "public" / "art"
PUB = ROOT / "public"
OUT.mkdir(parents=True, exist_ok=True)


def webp(name, width, quality=82):
    img = Image.open(SRC / f"{name}.png").convert("RGBA")
    h = round(img.height * width / img.width)
    img.resize((width, h), Image.LANCZOS).save(OUT / f"{name}.webp", "WEBP", quality=quality, method=6)


# Personnages et scène : affichés ≤ 400 px de large (×2 pour les écrans denses).
for pose in ("idle", "happy", "oops", "cheer"):
    webp(f"miner_{pose}", 640)
webp("forge_hero", 960, quality=80)
webp("ingot", 512)

# Icône choisie : app_icon_b. "any" = pleine, "maskable" = réduite dans la zone sûre (80 %).
icon = Image.open(SRC / "app_icon_b.png").convert("RGB")
for size in (192, 512):
    icon.resize((size, size), Image.LANCZOS).save(PUB / f"icon-{size}.png", optimize=True)
bg = icon.getpixel((6, 6))
mask = Image.new("RGB", (512, 512), bg)
inner = icon.resize((360, 360), Image.LANCZOS)  # 70 % → reste dans le cercle de sécurité
mask.paste(inner, (76, 76))
mask.save(PUB / "icon-maskable-512.png", optimize=True)
print("ok", bg)
