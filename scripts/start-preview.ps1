param(
  [switch] $NoBrowser,
  [int] $Port = 0
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

function Test-LocalPortOpen {
  param([int] $Port)

  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $connect = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    $connected = $connect.AsyncWaitHandle.WaitOne(300)
    if ($connected) {
      $client.EndConnect($connect)
    }
    return $connected
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

function Wait-ForPreviewAndOpen {
  param(
    [string] $Url,
    [int] $Attempts = 60
  )

  for ($i = 0; $i -lt $Attempts; $i++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        Start-Process $Url
        return
      }
    } catch {
      Start-Sleep -Seconds 1
    }
  }

  Start-Process $Url
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js/npm was not found. Install Node.js, then run start-preview.cmd again." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path -LiteralPath "package.json")) {
  Write-Host "package.json was not found. Run this script from the WebImage project folder." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path -LiteralPath "node_modules")) {
  Write-Host "Installing dependencies..."
  npm.cmd install --cache .npm-cache
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

$port = $Port
if ($port -gt 0 -and (Test-LocalPortOpen $port)) {
  Write-Host "Port $port is already in use." -ForegroundColor Red
  exit 1
}

if ($port -le 0) {
  $port = 3000..3005 | Where-Object { -not (Test-LocalPortOpen $_) } | Select-Object -First 1
}

if (-not $port) {
  Write-Host "No free preview port was found in 3000-3005." -ForegroundColor Red
  exit 1
}

$url = "http://127.0.0.1:$port"

Write-Host ""
Write-Host "Starting WebImage local preview..." -ForegroundColor Cyan
Write-Host "Project: $projectRoot"
Write-Host "URL: $url"
Write-Host "Keep this window open. Press Ctrl+C to stop the preview."
Write-Host ""

$browserJob = $null
if (-not $NoBrowser) {
  $browserJob = Start-Job -ScriptBlock ${function:Wait-ForPreviewAndOpen} -ArgumentList $url
}

try {
  npm.cmd run dev -- --hostname 127.0.0.1 --port $port
  exit $LASTEXITCODE
} finally {
  if ($browserJob) {
    Stop-Job -Job $browserJob -ErrorAction SilentlyContinue | Out-Null
    Remove-Job -Job $browserJob -Force -ErrorAction SilentlyContinue | Out-Null
  }
}
