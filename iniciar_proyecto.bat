@echo off
echo ===================================================
echo   INICIANDO SISTEMA DE RESIDUOS (MVP)
echo ===================================================

echo.
echo 1. Preparando la Base de Datos (Backend)...
cd backend
call npx prisma db push
call npx prisma generate

echo.
echo 2. Iniciando Servidor Backend (Puerto 3000)...
start cmd /k "npm run dev"

echo.
echo 3. Preparando Frontend y Estilos Tailwind v4...
cd ../frontend
call npm install @tailwindcss/vite

echo.
echo 4. Iniciando Servidor Frontend (Puerto 5173)...
start cmd /k "npm run dev -- --open"

echo.
echo ===================================================
echo TODO LISTO. El navegador se abrira automaticamente.
echo ===================================================
pause
