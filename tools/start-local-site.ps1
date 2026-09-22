param(
    [ValidateRange(1, 65535)]
    [int]$PreferredPort = 8940,
    [switch]$NoOpen
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$serverScript = Join-Path $PSScriptRoot "run-local-release.js"
$baseline = Get-Content -LiteralPath (Join-Path $projectRoot '.tmp/translation-deployments/baseline.json') -Raw | ConvertFrom-Json
$siteMarker = 'data-i18n="app.title.graph"'

function Test-ProjectSite {
    param([int]$Port)

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/index.html" -TimeoutSec 1
        return $response.StatusCode -eq 200 `
            -and $response.Content.Contains($siteMarker) `
            -and $response.Headers["X-AIMap-Local-Release"] -eq $baseline.commit `
            -and $response.Headers["Cache-Control"] -eq "no-store"
    }
    catch {
        return $false
    }
}

function Test-PortAvailable {
    param([int]$Port)

    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    try {
        $listener.Start()
        return $true
    }
    catch {
        return $false
    }
    finally {
        $listener.Stop()
    }
}

if (-not (Test-Path -LiteralPath $serverScript -PathType Leaf)) {
    throw "Local site server not found: $serverScript"
}

$port = $PreferredPort
$process = $null

if (-not (Test-ProjectSite -Port $port)) {
    $port = $null
    foreach ($candidate in $PreferredPort..([Math]::Min($PreferredPort + 59, 65535))) {
        if (Test-PortAvailable -Port $candidate) {
            $port = $candidate
            break
        }
    }

    if ($null -eq $port) {
        throw "No available local port was found."
    }

    $node = (Get-Command node -ErrorAction Stop).Source
    $process = Start-Process -FilePath $node `
        -ArgumentList @(('"' + $serverScript + '"'), $port) `
        -WorkingDirectory $projectRoot `
        -WindowStyle Hidden `
        -PassThru

    $ready = $false
    foreach ($attempt in 1..50) {
        if (Test-ProjectSite -Port $port) {
            $ready = $true
            break
        }
        if ($process.HasExited) {
            break
        }
        Start-Sleep -Milliseconds 100
    }

    if (-not $ready) {
        if (-not $process.HasExited) {
            Stop-Process -Id $process.Id
        }
        throw "The local site server did not start successfully."
    }
}

$url = "http://127.0.0.1:$port/index.html"
if (-not $NoOpen) {
    Start-Process $url
}

[PSCustomObject]@{
    Status = "ready"
    Url = $url
    Port = $port
    ProcessId = if ($null -eq $process) { $null } else { $process.Id }
}
