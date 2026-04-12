# sop: Error hook

# Ensure UTF-8 encoding for cross-platform compatibility
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
# Reminds the agent to log errors in progress.md
# Always exits 0

$Input = $null
try { $Input = [Console]::In.ReadToEnd() } catch {}

$ProgressFile = "progress.md"

if (-not (Test-Path $ProgressFile)) {
    Write-Output '{}'
    exit 0
}

$Python = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } elseif (Get-Command python -ErrorAction SilentlyContinue) { "python" } else { $null }

$ErrorMsg = ""
if ($Python) {
    $ErrorMsg = $Input | & $Python -c @"
import sys, json
try:
    data = json.load(sys.stdin)
    msg = data.get('error', {}).get('message', '') if isinstance(data.get('error'), dict) else str(data.get('error', ''))
    print(msg[:200])
except:
    print('')
"@ 2>$null
}

if ($ErrorMsg) {
    $Context = "[sop] Error detected: $ErrorMsg. Log this in progress.md under ## Errors with the resolution."
    if ($Python) {
        $Escaped = $Context | & $Python -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>$null
    } else {
        $Escaped = $Context | ConvertTo-Json
    }
    Write-Output "{`"hookSpecificOutput`":{`"hookEventName`":`"ErrorOccurred`",`"additionalContext`":$Escaped}}"
} else {
    Write-Output '{}'
}

exit 0
