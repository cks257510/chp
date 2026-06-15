@echo off
chcp 65001 >nul
title Character PVP Node Server
cd /d "%~dp0"

echo Node.js serve 실행을 시도합니다.
echo 이 창은 닫지 마세요.
start http://localhost:3000
npx serve -l 3000
pause
