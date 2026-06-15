@echo off
chcp 65001 >nul
title Character PVP Local Server
cd /d "%~dp0"

echo.
echo ========================================
echo   Character PVP 로컬 서버 실행
echo ========================================
echo.
echo 이 창은 닫지 마세요.
echo Chrome에서 http://localhost:8080 주소로 실행됩니다.
echo.

where python >nul 2>nul
if %errorlevel%==0 (
  start http://localhost:8080
  python -m http.server 8080
  pause
  exit /b
)

where py >nul 2>nul
if %errorlevel%==0 (
  start http://localhost:8080
  py -m http.server 8080
  pause
  exit /b
)

echo Python이 설치되어 있지 않습니다.
echo 아래 중 하나를 선택하세요.
echo 1. Python 설치 후 다시 실행
echo 2. Node.js가 있으면 터미널에서 npx serve 실행
echo 3. GitHub Pages에 업로드해서 실행
pause
