[CmdletBinding()]
param(
    [switch]$ForceInstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $Root 'backend'
$FrontendDir = Join-Path $Root 'frontend'
$VenvDir = Join-Path $BackendDir '.venv'
$PythonExe = Join-Path $VenvDir 'Scripts\python.exe'
$RequirementsFile = Join-Path $BackendDir 'requirements.txt'
$NodeModulesDir = Join-Path $FrontendDir 'node_modules'
$SeedMarker = Join-Path $BackendDir '.seeded'

function Write-Section($text) {
    Write-Host "`n=== $text ===" -ForegroundColor Cyan
}

function Assert-Command($name, $friendlyName) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "No se encontró '$name'. Instala $friendlyName y vuelve a intentar."
    }
}

function Get-SystemPython() {
    Assert-Command python 'Python 3.x'
    $pythonInfo = & python --version 2>&1
    if ($pythonInfo -notmatch '^Python 3') {
        throw "Se encontró '$pythonInfo'. Este script requiere Python 3.x."
    }
    return (Get-Command python).Source
}

function Ensure-Venv() {
    if ($ForceInstall -or -not (Test-Path $PythonExe)) {
        Write-Host 'Creando entorno virtual de backend...' -ForegroundColor Yellow
        $python = Get-SystemPython
        & $python -m venv $VenvDir
        if (-not (Test-Path $PythonExe)) {
            throw "No se pudo crear el entorno virtual en '$VenvDir'."
        }
    }
}

function Install-BackendDependencies() {
    if ($ForceInstall -or -not (Test-Path $VenvDir)) {
        Ensure-Venv
    }

    Write-Section 'Instalando dependencias backend'
    & $PythonExe -m pip install --upgrade pip
    & $PythonExe -m pip install -r $RequirementsFile

    # Asegurar que Pillow esté instalado (requerido por ImageField de Django)
    Write-Host 'Verificando Pillow...' -ForegroundColor Yellow
    & $PythonExe -m pip install Pillow
}

function Install-FrontendDependencies() {
    Assert-Command npm 'Node.js y npm'
    if ($ForceInstall -or -not (Test-Path $NodeModulesDir)) {
        Write-Section 'Instalando dependencias frontend'
        Push-Location $FrontendDir
        npm install
        Pop-Location
    }
}

function Ensure-Database() {
    Write-Section 'Aplicando migraciones'
    & $PythonExe manage.py migrate

    if (-not (Test-Path $SeedMarker)) {
        Write-Section 'Inicializando base de datos por primera vez'
        & $PythonExe manage.py seed_db
        New-Item -Path $SeedMarker -ItemType File -Force | Out-Null
    }
}

function Start-Terminal($title, $command, $workingDir) {
    $shell = if (Get-Command pwsh -ErrorAction SilentlyContinue) { 'pwsh' } else { 'powershell.exe' }
    $arguments = "-NoExit -Command Set-Location -LiteralPath '$workingDir'; $command"
    Write-Host "Iniciando $title..." -ForegroundColor Green
    Start-Process -FilePath $shell -ArgumentList $arguments
}

Write-Section 'Verificando entorno'
Assert-Command python 'Python 3.x'
Assert-Command npm 'Node.js y npm'

Install-BackendDependencies
Install-FrontendDependencies

Push-Location $BackendDir
Ensure-Database
Pop-Location

Start-Terminal 'backend' "& '$PythonExe' manage.py runserver" $BackendDir
Start-Terminal 'frontend' 'npm run dev' $FrontendDir

Write-Host "`nEl backend se ejecutará en http://localhost:8000" -ForegroundColor Cyan
Write-Host "El frontend se ejecutará en la URL que indique Vite (normalmente http://localhost:5173)." -ForegroundColor Cyan
Write-Host "Si necesitas forzar reinstalación usa: .\run-project.ps1 -ForceInstall" -ForegroundColor Yellow