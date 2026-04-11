# scientific-method: Error hook (PowerShell)
# Reminds the agent to log errors in progress.md

$input = $Input | Out-String

$progressFile = "progress.md"

if (-not (Test-Path $progressFile)) {
    Write-Output '{}'
    exit 0
}

$errorMsg = ""
try {
    $data = $input | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($data.error -is [PSCustomObject]) {
        $errorMsg = $data.error.message
    } elseif ($data.error) {
        $errorMsg = [string]$data.error
    }
    if ($errorMsg.Length -gt 200) {
        $errorMsg = $errorMsg.Substring(0, 200)
    }
} catch {}

if ($errorMsg) {
    $context = "[scientific-method] Error detected: $errorMsg. Log this in progress.md under ## Errors with the resolution."
    $python = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
    $escaped = $context | & $python -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>$null
    if (-not $escaped) { $escaped = '""' }
    Write-Output "{`"hookSpecificOutput`":{`"hookEventName`":`"ErrorOccurred`",`"additionalContext`":$escaped}}"
} else {
    Write-Output '{}'
}

exit 0
