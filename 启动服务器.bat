@echo off
chcp 65001 >nul
title 我的爱好世界 - 本地服务器

echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║     🌟 我的爱好世界 - 本地服务器 🌟       ║
echo  ╚═══════════════════════════════════════════╝
echo.
echo  正在启动服务器，端口: 8080
echo  访问地址: http://localhost:8080
echo.
echo  按 Ctrl+C 停止服务器
echo.
echo ─────────────────────────────────────────────
echo.

:: 使用 Python 的 http.server (如果有 Python)
where python >nul 2>&1
if %errorlevel% == 0 (
    echo  使用 Python HTTP Server...
    start http://localhost:8080
    python -m http.server 8080
    goto :end
)

:: 使用 npx serve (如果有 Node.js)
where npx >nul 2>&1
if %errorlevel% == 0 (
    echo  使用 Node.js Serve...
    start http://localhost:8080
    npx -y serve . -p 8080
    goto :end
)

:: 如果都没有，提示用户
echo  ❌ 未找到 Python 或 Node.js
echo  请安装其中一个后重试
echo.
pause

:end
