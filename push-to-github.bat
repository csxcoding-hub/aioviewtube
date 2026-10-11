@echo off
title LoopTube PRO - Push to GitHub
echo ========================================================
echo   LoopTube PRO - Auto Push to GitHub
echo   KiosKode: https://kioskode.my.id/
echo ========================================================
echo.
set /p REPO_URL="Masukkan URL Repository GitHub Anda (contoh: https://github.com/user/looptube.git): "
if "%REPO_URL%"=="" (
    echo Error: URL Repository tidak boleh kosong!
    pause
    exit /b
)

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
