# notify.ps1 — Send a notification to the user via OpenClaw Gateway
# Usage: pwsh notify.ps1 -File /path/to/msg.txt [-Target CHAT_ID] [-Channel telegram]
#
# Message MUST be read from a file (-File). Inline message arguments are not
# supported because Copilot CLI's bash tool corrupts multi-byte UTF-8 characters
# when they appear in command strings.

param(
    [Parameter(Mandatory=$true)]
    [string]$File,
    [string]$Target = "",
    [string]$Channel = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $File)) {
    Write-Error "File not found: $File"
    exit 1
}

$Message = Get-Content -Path $File -Raw -Encoding UTF8

# --- Resolve config from env or ~/.openclaw/openclaw.json ---
$OC_CONFIG = Join-Path $HOME ".openclaw" "openclaw.json"

function Read-OcConfig {
    param([string]$Key)
    if (-not (Test-Path $OC_CONFIG)) { return "" }
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) { return "" }
    try {
        $result = node -e @"
const fs = require('fs');
const raw = fs.readFileSync('$OC_CONFIG', 'utf8');
const cfg = eval('(' + raw + ')');
const val = key => key.split('.').reduce((o,k) => o && o[k], cfg);
process.stdout.write(String(val('$Key') || ''));
"@
        return $result
    } catch {
        return ""
    }
}

$Port = if ($env:OPENCLAW_GATEWAY_PORT) { $env:OPENCLAW_GATEWAY_PORT } else { Read-OcConfig "gateway.port" }
if (-not $Port) { $Port = "18789" }

$Token = if ($env:OPENCLAW_GATEWAY_TOKEN) { $env:OPENCLAW_GATEWAY_TOKEN } else { Read-OcConfig "gateway.auth.token" }
if (-not $Token) {
    Write-Output "OpenClaw not detected - printing notification to stdout"
    Write-Output "---"
    Get-Content -Path $File -Raw -Encoding UTF8
    Write-Output "---"
    exit 0
}

if (-not $Target) {
    $Target = if ($env:OPENCLAW_NOTIFY_TARGET) { $env:OPENCLAW_NOTIFY_TARGET } else { Read-OcConfig "channels.telegram.allowFrom.0" }
}
if (-not $Target) {
    Write-Output "No notify target configured - printing notification to stdout"
    Write-Output "---"
    Get-Content -Path $File -Raw -Encoding UTF8
    Write-Output "---"
    exit 0
}

if (-not $Channel) {
    $Channel = if ($env:OPENCLAW_NOTIFY_CHANNEL) { $env:OPENCLAW_NOTIFY_CHANNEL } else { "" }
}

# --- Build JSON payload ---
$jsonMessage = $Message | ConvertTo-Json
$bodyObj = @{
    tool = "message"
    args = @{
        action  = "send"
        target  = $Target
        message = $Message
    }
}
if ($Channel) {
    $bodyObj.args.channel = $Channel
}
$body = $bodyObj | ConvertTo-Json -Depth 5

# --- Send with retry ---
$maxRetries = 2
$retry = 0
$response = $null

while ($retry -le $maxRetries) {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:${Port}/tools/invoke" `
            -Method Post `
            -Headers @{ "Authorization" = "Bearer $Token"; "Content-Type" = "application/json" } `
            -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) `
            -TimeoutSec 10
        break
    } catch {
        $retry++
        if ($retry -le $maxRetries) {
            Write-Warning "Retry ${retry}/${maxRetries}..."
            Start-Sleep -Seconds 2
        } else {
            Write-Error "Failed to send notification: $_"
            exit 1
        }
    }
}

# --- Check result ---
if ($response.ok -eq $true) {
    Write-Output "Notification sent"
} else {
    Write-Error "Failed to send notification: $($response | ConvertTo-Json -Compress)"
    exit 1
}
