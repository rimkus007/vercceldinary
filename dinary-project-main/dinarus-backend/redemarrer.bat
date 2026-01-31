@echo off
echo ========================================
echo   REDEMARRAGE DU BACKEND DINARY
echo ========================================
echo.

echo 1. Nettoyage du cache...
if exist dist (
    rmdir /s /q dist
    echo    - Dossier dist supprime
)
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo    - Cache node_modules supprime
)

echo.
echo 2. Redemarrage du serveur...
echo.
npm run start:dev

