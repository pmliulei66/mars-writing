@echo off
setlocal enabledelayedexpansion

REM mars-writing setup script for Windows
REM Usage: setup.bat

echo === mars-writing setup ===
echo.

REM 1. Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js not found. Please install Node.js ^>= 20.0.0
    echo   https://nodejs.org/
    exit /b 1
)
for /f "tokens=1 delims=." %%a in ('node -v') do set NODE_VER=%%a
set NODE_VER=%NODE_VER:v=%
if %NODE_VER% lss 20 (
    echo Error: Node.js ^>= 20.0.0 required
    exit /b 1
)
echo [OK] Node.js found

REM 2. Setup paths
set "SCRIPT_DIR=%~dp0"
set "SKILLS_DIR=%USERPROFILE%\.claude\skills"
set "DATA_DIR=%USERPROFILE%\.mars-writing"

if not exist "%SKILLS_DIR%" mkdir "%SKILLS_DIR%"
echo [OK] Skills directory: %SKILLS_DIR%

REM 3. Create junctions (or copy)
echo.
echo Installing skills...

call :install_skill mars-writing
call :install_skill wechat-studio

REM 4. Install npm dependencies
echo.
echo Installing npm dependencies...
set "WECHAT_DIR=%SKILLS_DIR%\wechat-studio"
if exist "%WECHAT_DIR%\package.json" (
    call npm install --prefix "%WECHAT_DIR%" --production 2>nul
    echo [OK] npm dependencies installed
) else (
    echo [SKIP] package.json not found
)

REM 5. Create data directory
if not exist "%DATA_DIR%\articles" mkdir "%DATA_DIR%\articles"
if not exist "%DATA_DIR%\records" mkdir "%DATA_DIR%\records"
if not exist "%DATA_DIR%\read-books.json" (
    echo {"books":[]} > "%DATA_DIR%\read-books.json"
)
echo [OK] Data directory: %DATA_DIR%

REM 6. Check WeChat config
echo.
set "WECHAT_CONFIG=%USERPROFILE%\.config\wechat-studio\config.yaml"
if exist "%WECHAT_CONFIG%" (
    echo [OK] WeChat config found: %WECHAT_CONFIG%
) else (
    echo [WARN] WeChat config not found.
    echo   Create: %WECHAT_CONFIG%
    echo   Content:
    echo     wechat:
    echo       appid: YOUR_APP_ID
    echo       secret: YOUR_APP_SECRET
    echo.
    echo   Get credentials at: https://developers.weixin.qq.com/platform
)

echo.
echo === Setup complete ===
echo.
echo Restart Claude Code to load the new skills.
goto :eof

:install_skill
set "SKILL_NAME=%~1"
set "SRC=%SCRIPT_DIR%skills\%SKILL_NAME%"
set "DST=%SKILLS_DIR%\%SKILL_NAME%"

if exist "%DST%" (
    echo   [WARN] %DST% already exists, skipping
    goto :eof
)

REM Try junction first (works without admin)
mklink /J "%DST%" "%SRC%" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Junction created: %SKILL_NAME%
    goto :eof
)

REM Fallback: copy
xcopy "%SRC%" "%DST%\" /E /I /Q >nul 2>&1
echo [OK] Copied: %SKILL_NAME%
goto :eof
