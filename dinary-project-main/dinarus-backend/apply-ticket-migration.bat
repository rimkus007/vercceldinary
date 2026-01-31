@echo off
echo ===============================================
echo Application de la migration des tickets
echo ===============================================
echo.

echo 1. Generation du client Prisma...
call npx prisma generate

echo.
echo 2. Application de la migration...
call npx prisma migrate deploy

echo.
echo ===============================================
echo Migration terminee !
echo ===============================================
echo.
echo Le backend doit etre redemarre pour prendre en compte les changements.
echo.
pause

