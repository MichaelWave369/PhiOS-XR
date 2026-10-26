#requires -Version 5.1
<#
.SYNOPSIS
  Local-only PhiOS XR Quest 3 debug APK inspection and optional USB installation.
.DESCRIPTION
  Default mode only verifies the GitHub Actions APK, checksum, and package name.
  -Install additionally uses an explicitly approved ADB USB installation.
  -CaptureLogs captures a small filtered logcat snapshot to a local text file.
  Nothing roots, flashes, uninstalls, launches, uploads, or modifies firmware.
#>
[CmdletBinding()]
param(
    [string]$ArtifactDirectory = $PSScriptRoot,
    [switch]$Install,
    [switch]$CaptureLogs,
    [string]$AdbPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$packageName = 'org.enterthefield.phiosxr'
$apkFilename = 'PhiOS-XR-Quest-debug.apk'
$artifactRoot = (Resolve-Path -LiteralPath $ArtifactDirectory -ErrorAction Stop).Path
$apk = Join-Path $artifactRoot $apkFilename
$manifest = Join-Path $artifactRoot 'SHA256SUMS.txt'
$badging = Join-Path $artifactRoot 'apk-badging.txt'

foreach ($file in @($apk, $manifest, $badging)) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
        throw "Missing artifact: $file. Extract the COMPLETE GitHub Actions artifact ZIP first."
    }
}

Write-Host 'PhiOS XR / Quest TestFlight / Edition 10' -ForegroundColor Cyan
Write-Host 'MODE: Local integrity checks. No USB operation unless -Install or -CaptureLogs is specified.'

# sha256sum emits two spaces before a relative file name. Do not execute
# anything from the checksum or read arbitrary paths from this untrusted text.
$expected = $null
foreach ($line in (Get-Content -LiteralPath $manifest -Encoding UTF8)) {
    if ($line -match '^\s*([0-9a-fA-F]{64})\s+\*?(?:dist[/\\])?PhiOS-XR-Quest-debug\.apk\s*$') {
        if ($null -ne $expected) { throw 'Ambiguous SHA256SUMS.txt: duplicate entries for APK.' }
        $expected = $Matches[1].ToLowerInvariant()
    }
}
if ($null -eq $expected) {
    throw 'Missing PhiOS XR APK SHA-256 entry in SHA256SUMS.txt.'
}
$actual = (Get-FileHash -LiteralPath $apk -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne $expected) {
    throw "SHA-256 mismatch for the APK! Expected $expected but got $actual. DO NOT INSTALL."
}
$metadata = Get-Content -LiteralPath $badging -Raw -Encoding UTF8
if ($metadata -notmatch "package:\s+name='org\.enterthefield\.phiosxr'") {
    throw "APK metadata file does not identify the expected $packageName package. DO NOT INSTALL."
}
if ((Get-Item -LiteralPath $apk).Length -lt 1000) {
    throw 'APK is implausibly small. DO NOT INSTALL.'
}
Write-Host "INTEGRITY PASS: SHA-256 $actual" -ForegroundColor Green
Write-Host "PACKAGE METADATA: $packageName" -ForegroundColor Green
Write-Host 'Note: These checks verify a provided ZIP, not its GitHub origin or headset compatibility.'
if (-not ($Install -or $CaptureLogs)) {
    Write-Host 'Preflight complete. No device contacted. To install, rerun with -Install.'
    return
}

# Device operations are opt-in only. Use ADB's -d selector to require a
# directly connected USB device, not an arbitrary network-connected device.
if (-not [string]::IsNullOrWhiteSpace($AdbPath)) {
    $adb = (Resolve-Path -LiteralPath $AdbPath -ErrorAction Stop).Path
} else {
    $command = Get-Command 'adb.exe' -ErrorAction SilentlyContinue
    if ($null -eq $command) { $command = Get-Command 'adb' -ErrorAction SilentlyContinue }
    if ($null -ne $command) {
        $adb = $command.Source
    } else {
        $candidates = @(
            (Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'),
            (Join-Path $env:USERPROFILE 'AppData\Local\Android\Sdk\platform-tools\adb.exe')
        )
        $adb = $candidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
        if (-not $adb) {
            throw 'ADB not found. Install official Android Platform Tools, then provide -AdbPath or add adb.exe to PATH.'
        }
    }
}
$stateOutput = (& $adb -d get-state 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $stateOutput -notmatch '^device$') {
    throw "No single authorized USB Android device detected. Check developer mode and the in-headset USB debugging prompt. ADB: $stateOutput"
}
$model = (& $adb -d shell getprop ro.product.model 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $model -notmatch 'Quest') {
    throw "Connected USB device model '$model' does not look like a Meta Quest. Refusing to install."
}
Write-Host "CONNECTED HEADSET: $model" -ForegroundColor Green
$batteryText = (& $adb -d shell dumpsys battery 2>&1 | Out-String)
if ($LASTEXITCODE -eq 0 -and $batteryText -match '(?m)^\s*level:\s*(\d+)') {
    $battery = [int]$Matches[1]
    Write-Host "Headset battery: $battery%"
    if ($battery -lt 25) { Write-Warning 'Charge the headset before prolonged native XR testing.' }
}

if ($Install) {
    Write-Host 'This installs ONLY the verified debug APK over an existing installation when signatures match.'
    Write-Host 'It will NEVER uninstall another package or bypass a signing-key mismatch.'
    $answer = Read-Host "Type INSTALL to approve installing $packageName onto '$model'"
    if ($answer -cne 'INSTALL') {
        Write-Host 'Installation cancelled; no changes made.' -ForegroundColor Yellow
        return
    }
    Write-Host 'Installing over USB...' -ForegroundColor Cyan
    $result = (& $adb -d install -r $apk 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $result -notmatch 'Success') {
        if ($result -match 'INSTALL_FAILED_UPDATE_INCOMPATIBLE') {
            throw ('Debug signing keys differ between CI builds. NO automatic uninstall was attempted. ' +
                   'Back up any app data and review docs/EDITION_10.md before considering a manual uninstall. ' + $result)
        }
        throw "ADB install failed without any auto-recovery action: $result"
    }
    Write-Host "INSTALLED: $packageName. Open Unknown Sources in the Quest app Library." -ForegroundColor Green
}

if ($CaptureLogs) {
    # Captures only when explicitly requested. Even filtered Android logs
    # may contain sensitive information; NEVER send or upload automatically.
    $logFolder = Join-Path $artifactRoot 'local-device-logs'
    New-Item -ItemType Directory -Path $logFolder -Force | Out-Null
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $logPath = Join-Path $logFolder "quest-xr-$stamp.txt"
    $logContent = (& $adb -d logcat -d -t 600 -s 'godot:V' 'OpenXR:V' 'AndroidRuntime:E' '*:S' 2>&1 | Out-String)
    if ($LASTEXITCODE -ne 0) { throw 'ADB logcat failed. No diagnostics sent.' }
    Set-Content -LiteralPath $logPath -Value $logContent -Encoding UTF8
    Write-Host "LOG SAVED LOCALLY: $logPath" -ForegroundColor Green
    Write-Warning 'Review and redact private data before sharing any device log.'
}
