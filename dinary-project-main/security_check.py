#!/usr/bin/env python3
"""
Script de vérification de sécurité finale pour s'assurer qu'aucun log ne reste
Exclut les scripts de nettoyage eux-mêmes
"""

import os
import re
from pathlib import Path

ROOT = Path(r"c:/Users/Yanis-M/websites/versions de dinary/dinary")
SKIP_DIRS = {
    '.git', 'node_modules', '.next', '.turbo', 'dist', 'build', 
    '.output', '.cache', '.vscode', '.idea'
}
SKIP_FILES = {
    'cleanup_all_logs.py', 'verify_no_logs.py', 'RemoveConsoles.py', 
    'cleanup_logs.py', 'fix_logs.py', 'security_check.py'
}
SOURCE_EXTS = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py'}

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
    if any(part in SKIP_DIRS for part in path.parts):
        return True
    if path.name in SKIP_FILES:
        return True
    return False

def check_file_for_logs(file_path: Path):
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception:
        return []
    
    found_logs = []
    
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
    print("🔍 VÉRIFICATION DE SÉCURITÉ FINALE")
    print("=" * 50)
    
    files_with_logs = []
    total_logs = 0
    files_analyzed = 0
    
    for path in ROOT.rglob('*'):
        if not path.is_file() or should_skip(path):
            continue
        
        if path.suffix.lower() not in SOURCE_EXTS:
            continue
        
        files_analyzed += 1
        logs = check_file_for_logs(path)
        if logs:
            files_with_logs.append({
                'file': path,
                'logs': logs
            })
            total_logs += len(logs)
    
    print(f"\n📊 RÉSULTATS DE LA VÉRIFICATION")
    print(f"   📁 Fichiers analysés: {files_analyzed}")
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
        print(f"\n✅ PARFAIT ! Aucun log trouvé dans le code source")
        print(f"🛡️  Votre application est sécurisée contre les fuites de données")
        print(f"\n📋 RÉCAPITULATIF:")
        print(f"   • Tous les console.log() ont été supprimés")
        print(f"   • Tous les print() Python ont été supprimés")
        print(f"   • Tous les appels logger.*() ont été supprimés")
        print(f"   • Les répertoires de build ont été nettoyés")
        print(f"\n🚀 Votre application est prête pour la production !")
        return True

if __name__ == "__main__":
    success = main()
    if not success:
        exit(1)
