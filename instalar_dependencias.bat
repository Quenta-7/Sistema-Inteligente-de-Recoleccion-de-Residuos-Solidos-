@echo off
echo ===================================================
echo   INICIALIZANDO SISTEMA DE RESIDUOS (MVP)
echo ===================================================
echo.
echo Verificando Node.js...
node -v
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js no esta instalado o no esta en el PATH.
    pause
    exit /b
)

echo.
echo ---------------------------------------------------
echo 1. CONFIGURANDO EL BACKEND
echo ---------------------------------------------------
if not exist "backend" mkdir backend
cd backend

echo Inicializando package.json...
call npm init -y

echo Instalando dependencias de produccion del backend...
call npm install express @prisma/client cors jsonwebtoken bcrypt dotenv

echo Instalando dependencias de desarrollo del backend...
call npm install -D typescript @types/express @types/node @types/cors @types/jsonwebtoken @types/bcrypt ts-node-dev prisma

echo Inicializando TypeScript...
call npx tsc --init

echo Inicializando Prisma con SQLite (MVP)...
call npx prisma init --datasource-provider sqlite

cd ..

echo.
echo ---------------------------------------------------
echo 2. CONFIGURANDO EL FRONTEND
echo ---------------------------------------------------
echo Creando proyecto de React con Vite y TypeScript...
call npx --yes create-vite@latest frontend --template react-ts

cd frontend

echo Instalando dependencias de React...
call npm install

echo Instalando dependencias adicionales (Router, Axios, TailwindCSS)...
call npm install react-router-dom axios tailwindcss postcss autoprefixer lucide-react

echo Inicializando TailwindCSS...
call npx --yes tailwindcss init -p

cd ..

echo.
echo ===================================================
echo ¡INSTALACION COMPLETADA CON EXITO!
echo ===================================================
echo Estructura creada:
echo - /backend  (Node.js + Express + Prisma)
echo - /frontend (React + Vite + TailwindCSS)
echo.
pause
