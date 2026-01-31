#!/usr/bin/env python3
"""
Script de nettoyage complet des logs pour éviter les fuites de données
Supprime tous les types de logs: console.log, print, logger, etc.
"""

import os
import shutil
from pathlib import Path

ROOT = Path(r"c:/Users/Yanis-M/websites/versions de dinary/dinary")
SKIP_DIRS = {
    '.git', 'node_modules', '.next', '.turbo', 'dist', 'build', 
    '.output', '.cache', '.vscode', '.idea'
}
SOURCE_EXTS = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py'}
BUILD_DIRS = ['.next', 'dist', 'build', '.output', '.cache']

def should_skip(path: Path) -> bool:
    """Vérifie si le chemin doit être ignoré"""
    return any(part in SKIP_DIRS for part in path.parts)

def strip_console_logs(text: str):
    """Supprime tous les console.log, console.error, etc."""
    patterns = [
        'console.log',
        'console.error', 
        'console.warn',
        'console.info',
        'console.debug',
        'console.trace'
    ]
    
    result = text
    total_replacements = 0
    
    for pattern in patterns:
        if pattern in result:
            result, count = strip_console_calls(result, pattern)
            total_replacements += count
    
    return result, total_replacements

def strip_console_calls(text: str, target: str):
    """Supprime les appels console spécifiques"""
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
        
        # Remplacer par void 0; pour maintenir la syntaxe valide
        res.append('void 0;')
        replacements += 1
        i = j
    
    return ''.join(res), replacements

def strip_python_logs(text: str):
    """Supprime les logs Python (print, logger)"""
    result = text
    replacements = 0
    
    # Supprimer les pass
    import re
    print_pattern = r'print\s*\([^)]*\)'
    matches = re.findall(print_pattern, result)
    if matches:
        result = re.sub(print_pattern, 'pass', result)
        replacements += len(matches)
    
    # Supprimer les logger()
    logger_patterns = [
        r'logger\.debug\s*\([^)]*\)',
        r'logger\.info\s*\([^)]*\)',
        r'logger\.warning\s*\([^)]*\)',
        r'logger\.error\s*\([^)]*\)',
        r'logger\.critical\s*\([^)]*\)'
    ]
    
    for pattern in logger_patterns:
        matches = re.findall(pattern, result)
        if matches:
            result = re.sub(pattern, 'pass', result)
            replacements += len(matches)
    
    return result, replacements

def clean_build_directories():
    """Supprime les répertoires de build contenant des logs compilés"""
    pass
    cleaned = []
    
    for build_dir in BUILD_DIRS:
        for path in ROOT.rglob(build_dir):
            if path.is_dir():
                try:
                    shutil.rmtree(path)
                    cleaned.append(str(path))
                    pass
                except Exception as e:
                    pass
    
    return cleaned

def main():
    pass
    pass
    
    # 1. Nettoyer les fichiers source
    pass
    edited_files = []
    
    for path in ROOT.rglob('*'):
        if not path.is_file() or should_skip(path):
            continue
        
        if path.suffix.lower() not in SOURCE_EXTS:
            continue
        
        try:
            text = path.read_text(encoding='utf-8')
        except Exception:
            continue
        
        new_text = text
        total_replacements = 0
        
        # Nettoyer les logs JavaScript/TypeScript
        if path.suffix.lower() in {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'}:
            cleaned_text, replacements = strip_console_logs(new_text)
            new_text = cleaned_text
            total_replacements += replacements
        
        # Nettoyer les logs Python
        elif path.suffix.lower() == '.py':
            cleaned_text, replacements = strip_python_logs(new_text)
            new_text = cleaned_text
            total_replacements += replacements
        
        # Écrire le fichier si des modifications ont été faites
        if total_replacements > 0:
            path.write_text(new_text, encoding='utf-8')
            edited_files.append((path, total_replacements))
            pass}")
    
    # 2. Nettoyer les répertoires de build
    cleaned_dirs = clean_build_directories()
    
    # 3. Résumé
    pass
    pass
    pass}")
    pass}")
    
    if edited_files:
        pass
        for path, count in edited_files[:20]:  # Limiter l'affichage
            pass}")
        if len(edited_files) > 20:
            pass - 20} autres fichiers")
    
    if cleaned_dirs:
        pass
        for dir_path in cleaned_dirs[:10]:
            pass
        if len(cleaned_dirs) > 10:
            pass - 10} autres répertoires")
    
    pass
    pass

if __name__ == "__main__":
    main()
