#!/usr/bin/env python3
"""
Script de vérification finale pour s'assurer qu'aucun log ne reste dans le code source
"""

import os
import re
from pathlib import Path

ROOT = Path(r"c:/Users/Yanis-M/websites/versions de dinary/dinary")
SKIP_DIRS = {
    '.git', 'node_modules', '.next', '.turbo', 'dist', 'build', 
    '.output', '.cache', '.vscode', '.idea'
}
SOURCE_EXTS = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py'}

# Patterns de logs à rechercher
LOG_PATTERNS = {
    'javascript': [
        r'console\.log\s*\(',
        r'console\.error\s*\(',
        r'console\.warn\s*\(',
        r'console\.info\s*\(',
        r'console\.debug\s*\(',
        r'console\.trace\s*\(',
    ],
    'python': [
        r'print\s*\(',
        r'logger\.debug\s*\(',
        r'logger\.info\s*\(',
        r'logger\.warning\s*\(',
        r'logger\.error\s*\(',
        r'logger\.critical\s*\(',
    ]
}

def should_skip(path: Path) -> bool:
    """Vérifie si le chemin doit être ignoré"""
    return any(part in SKIP_DIRS for part in path.parts)

def check_file_for_logs(file_path: Path):
    """Vérifie un fichier pour la présence de logs"""
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception:
        return []
    
    found_logs = []
    
    # Vérifier les logs JavaScript/TypeScript
    if file_path.suffix.lower() in {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'}:
        for pattern in LOG_PATTERNS['javascript']:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                line_num = content[:match.start()].count('\n') + 1
                found_logs.append({
                    'type': 'JavaScript',
                    'pattern': pattern,
                    'line': line_num,
                    'match': match.group()
                })
    
    # Vérifier les logs Python
    elif file_path.suffix.lower() == '.py':
        for pattern in LOG_PATTERNS['python']:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                line_num = content[:match.start()].count('\n') + 1
                found_logs.append({
                    'type': 'Python',
                    'pattern': pattern,
                    'line': line_num,
                    'match': match.group()
                })
    
    return found_logs

def main():
    print("🔍 VÉRIFICATION FINALE DES LOGS")
    print("=" * 50)
    
    files_with_logs = []
    total_logs = 0
    
    # Parcourir tous les fichiers source
    for path in ROOT.rglob('*'):
        if not path.is_file() or should_skip(path):
            continue
        
        if path.suffix.lower() not in SOURCE_EXTS:
            continue
        
        logs = check_file_for_logs(path)
        if logs:
            files_with_logs.append({
                'file': path,
                'logs': logs
            })
            total_logs += len(logs)
    
    # Afficher les résultats
    print(f"\n📊 RÉSULTATS DE LA VÉRIFICATION")
    print(f"   📁 Fichiers analysés: {sum(1 for _ in ROOT.rglob('*') if _.is_file() and _.suffix.lower() in SOURCE_EXTS and not should_skip(_))}")
    print(f"   🔍 Fichiers avec logs: {len(files_with_logs)}")
    print(f"   ⚠️  Total de logs trouvés: {total_logs}")
    
    if files_with_logs:
        print(f"\n❌ ALERTES DE SÉCURITÉ - LOGS TROUVÉS:")
        for file_info in files_with_logs:
            relative_path = file_info['file'].relative_to(ROOT)
            print(f"\n   📁 {relative_path}")
            for log in file_info['logs']:
                print(f"      • Ligne {log['line']}: {log['match']} ({log['type']})")
        
        print(f"\n⚠️  ACTION REQUISE: Supprimez manuellement les logs ci-dessus")
        return False
    else:
        print(f"\n✅ EXCELLENT ! Aucun log trouvé dans le code source")
        print(f"🛡️  Votre application est protégée contre les fuites de données")
        return True

if __name__ == "__main__":
    success = main()
    if not success:
        exit(1)
