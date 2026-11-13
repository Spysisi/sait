@echo off
setlocal
cd /d "%~dp0"
set "PORT=8000"
where py >nul 2>nul
if not errorlevel 1 (
  start "" /b cmd /c "timeout /t 2 >nul & start http://127.0.0.1:%PORT%/"
  echo Site: http://127.0.0.1:%PORT%/
  echo Keep this window open. Press Ctrl+C to stop.
  py -m http.server %PORT%
  goto :eof
)
where python >nul 2>nul
if not errorlevel 1 (
  start "" /b cmd /c "timeout /t 2 >nul & start http://127.0.0.1:%PORT%/"
  echo Site: http://127.0.0.1:%PORT%/
  echo Keep this window open. Press Ctrl+C to stop.
  python -m http.server %PORT%
  goto :eof
)
echo Python 3 was not found. Install it from https://www.python.org/downloads/
pause
