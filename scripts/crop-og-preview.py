from PIL import Image, ImageDraw

SRC = r"C:\Users\ADMIN\.cursor\projects\e-Software-development-syntance-web\assets\c__Users_ADMIN_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image__1_-c9b5e5f7-ddb9-4122-a762-dbeb4fc5f0fd.png"
OUT = r"E:\Software development\syntance-web\public\portfolio\lumine-concept-preview.webp"

OG_W, OG_H = 1200, 630

im = Image.open(SRC).convert("RGB")
w, h = im.size
crop_h = min(round(w * OG_H / OG_W), h)
crop = im.crop((0, 0, w, crop_h))
og = crop.resize((OG_W, OG_H), Image.Resampling.LANCZOS)

draw = ImageDraw.Draw(og)
draw.rectangle((0, 0, OG_W - 1, OG_H - 1), outline=(60, 55, 70))

og.save(OUT, format="WEBP", quality=88, method=6)
print(f"saved {OUT} ({OG_W}x{OG_H}) from source {w}x{h}, crop top {crop_h}px")
