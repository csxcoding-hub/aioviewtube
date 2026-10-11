@echo off
title LoopTube PRO - Push to GitHub
echo ========================================================
echo   LoopTube PRO - Auto Push to GitHub
echo   KiosKode: https://kioskode.my.id/
echo ========================================================
echo.
set DEFAULT_REPO=https://github.com/csxcoding-hub/aioviewtube.git
set /p REPO_URL="Masukkan URL Repository GitHub [%DEFAULT_REPO%]: "
if "%REPO_URL%"=="" set REPO_URL=%DEFAULT_REPO%

echo.
echo [1/4] Menginisialisasi git...
git init
echo [2/4] Menyiapkan branch main...
git branch -M main
echo [3/4] Menambahkan remote origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
echo [4/4] Mengunggah semua kode ke GitHub...
git add .
git commit -m "feat: Siap build LoopTube PRO Windows installer"
git push -u origin main --force

echo.
echo ========================================================
echo Selesai! Buka tab 'Actions' di repository GitHub Anda:
echo File Installer Windows (.exe) akan otomatis ter-build!
echo ========================================================
pause
