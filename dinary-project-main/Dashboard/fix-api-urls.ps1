# Script PowerShell pour corriger toutes les URLs d'API dans le Dashboard
Write-Host "🔧 Correction des URLs d'API dans le Dashboard..." -ForegroundColor Yellow

# Récupérer tous les fichiers TypeScript/JavaScript concernés
$files = Get-ChildItem -Path "app\admin" -Recurse -Include "*.tsx", "*.ts" -File
$files += Get-ChildItem -Path "components\admin" -Recurse -Include "*.tsx", "*.ts" -File
$files += Get-ChildItem -Path "lib" -Recurse -Include "*.ts" -File

$corrections = 0
$fichiersModifies = 0

foreach ($file in $files) {
    $contenu = Get-Content -Path $file.FullName -Raw
    
    # Vérifier si le fichier contient les URLs à corriger
    if ($contenu -match "process\.env\.NEXT_PUBLIC_API_URL") {
        Write-Host "📝 Traitement du fichier: $($file.Name)" -ForegroundColor Cyan
        
        # Ajouter l'import de API_URL s'il n'existe pas déjà
        if ($contenu -notmatch "import.*API_URL.*from.*@/lib/api") {
            # Trouver la ligne des imports existants
            $importLines = @()
            $lines = $contenu -split "`n"
            $importSectionEnd = 0
            
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "^import.*from") {
                    $importLines += $lines[$i]
                    $importSectionEnd = $i
                } elseif ($importLines.Count -gt 0 -and $lines[$i] -match "^$|^//|^/\*|^export|^interface|^type|^function|^const|^class") {
                    break
                }
            }
            
            if ($importLines.Count -gt 0) {
                # Ajouter l'import après le dernier import
                $lines[$importSectionEnd] = $lines[$importSectionEnd] + "`nimport { API_URL } from `"@/lib/api`";"
                $contenu = $lines -join "`n"
            }
        }
        
        # Remplacer toutes les occurrences de process.env.NEXT_PUBLIC_API_URL
        $ancienContenu = $contenu
        $contenu = $contenu -replace 'process\.env\.NEXT_PUBLIC_API_URL(?!\s*\|\|)', 'API_URL'
        
        # Compter les corrections
        if ($ancienContenu -ne $contenu) {
            Set-Content -Path $file.FullName -Value $contenu -Encoding UTF8
            $corrections += ($ancienContenu -split 'process\.env\.NEXT_PUBLIC_API_URL').Count - 1
            $fichiersModifies++
            Write-Host "  ✅ Fichier modifié avec succès" -ForegroundColor Green
        }
    }
}

Write-Host "`n🎉 Opération terminée!" -ForegroundColor Green
Write-Host "📊 Statistiques:" -ForegroundColor Yellow
Write-Host "  • Fichiers modifiés: $fichiersModifies" -ForegroundColor White
Write-Host "  • Corrections effectuées: $corrections" -ForegroundColor White
Write-Host "`n✨ Toutes les URLs d'API ont été centralisées avec API_URL!" -ForegroundColor Green
