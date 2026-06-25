@echo off
title Te Quiero Verde Cusco
echo.
echo ====================================================
echo   INICIANDO SISTEMA INTELIGENTE DE RECOLECCION
echo ====================================================
echo.
echo Ejecutando el script de inicio de dependencias y servidores...
powershell -ExecutionPolicy Bypass -File "%~dp0run-project.ps1"

echo.
echo Esperando a que los servidores se inicialicen...
timeout /t 4 >nul

echo Abriendo el navegador en http://localhost:5173 ...
start http://localhost:5173
echo.
echo [Exito] Servidores levantados y aplicacion abierta en el navegador.
echo Puedes mantener esta ventana abierta o cerrarla.
pause
