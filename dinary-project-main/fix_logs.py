from pathlib import Path
ROOT = Path(r"c:/Users/Yanis-M/websites/versions de dinary/dinary")
count = 0
for path in ROOT.rglob('*'):
    if not path.is_file():
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except Exception:
        continue
    if 'void 0;' not in text:
        continue
    text = text.replace('void 0;', 'void 0;')
    path.write_text(text, encoding='utf-8')
    count += 1
pass
