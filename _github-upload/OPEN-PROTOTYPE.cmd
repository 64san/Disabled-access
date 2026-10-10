@echo off
title DisabledAccess v4
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not on PATH. Install the LTS version from https://nodejs.org and try again.
  pause
  exit /b 1
)
node start.cjs
echo.
echo The launcher stopped. Any error is shown above and saved in launch-log.txt.
pause
