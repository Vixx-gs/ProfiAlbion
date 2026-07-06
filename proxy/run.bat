@echo off
cd /d "%~dp0"

echo ============================================
echo  ProfiAlbion - Local Market Proxy
echo ============================================
echo.

REM Start mitmproxy (intercept Albion traffic)
echo [1/2] Starting mitmproxy on port 8080...
echo       Configure your OS proxy to 127.0.0.1:8080
echo       or use a PAC file for Albion-only routing.
start "mitmproxy" cmd /c "mitmproxy -s addon.py --listen-port 8080 --set block_global=false"

REM Start local API server
echo [2/2] Starting local API server on port 3456...
start "albion-api" cmd /c "python server.py"

echo.
echo Proxy running. Configure your browser/game:
echo   HTTP/HTTPS Proxy: 127.0.0.1:8080
echo.
echo Your Angular app should use:
echo   http://127.0.0.1:3456/api/v2/stats/prices/...
echo.
echo Press any key to stop both servers...
pause >nul

echo Stopping...
taskkill /fi "WINDOWTITLE eq mitmproxy" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq albion-api" /f >nul 2>&1
echo Done.
