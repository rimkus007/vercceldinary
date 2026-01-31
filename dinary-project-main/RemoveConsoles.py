import os
from pathlib import Path

ROOT = Path(r"c:/Users/Yanis-M/websites/versions de dinary/dinary")
SKIP_DIRS = {'.git', 'node_modules', '.next', '.turbo', 'dist', 'build', '.output', '.cache'}
EXTS = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'}


def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def strip_console(text: str):
    target = 'console.'
    if target not in text:
        return text, 0
    res = []
    i = 0
    length = len(text)
    replacements = 0
    while i < length:
        idx = text.find(target, i)
        if idx == -1:
            res.append(text[i:])
            break
        res.append(text[i:idx])
        j = idx
        paren = 0
        in_string = None
        escape = False
        started = False
        while j < length:
            ch = text[j]
            if not started and ch == '(':
                started = True
                paren = 1
                j += 1
                continue
            if in_string:
                if escape:
                    escape = False
                elif ch == '\\':
                    escape = True
                elif ch == in_string:
                    in_string = None
                j += 1
                continue
            if ch in '\"\'`':
                in_string = ch
                j += 1
                continue
            if ch == '(':
                paren += 1
            elif ch == ')':
                if paren > 0:
                    paren -= 1
            elif ch in ';\r\n' and paren == 0 and started:
                if ch == ';':
                    j += 1
                break
            j += 1
        else:
            j = length
        res.append('void 0;')
        replacements += 1
        i = j
    return ''.join(res), replacements


edited = []
for path in ROOT.rglob('*'):
    if not path.is_file():
        continue
    if should_skip(path):
        continue
    if path.suffix.lower() not in EXTS:
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except Exception:
        continue
    new_text, count = strip_console(text)
    if count:
        path.write_text(new_text, encoding='utf-8')
        edited.append((path, count))

pass} files")
for path, count in edited[:50]:
    pass
if len(edited) > 50:
    pass
