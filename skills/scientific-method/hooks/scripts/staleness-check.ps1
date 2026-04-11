# scientific-method: Staleness check (PowerShell)
# If plan.md or progress.md haven't been updated in MAX_STALE seconds, deny the tool call.

$input = $Input | Out-String

$maxStale = if ($env:MAX_STALE) { [int]$env:MAX_STALE } else { 120 }

# Extract file arg from input to check whitelist
$planFiles = @('plan.md','findings.md','progress.md','SKILL.md','PROTOCOL.md','OPERATOR.md','CAPTAIN.md','MANIFEST.md')

try {
    $data = $input | ConvertFrom-Json -ErrorAction SilentlyContinue
    $filePath = if ($data.toolInput.file_path) { $data.toolInput.file_path }
                elseif ($data.toolInput.path) { $data.toolInput.path }
                elseif ($data.toolInput.filePath) { $data.toolInput.filePath }
                else { "" }
    if ($filePath) {
        $basename = Split-Path -Leaf $filePath
        if ($planFiles -contains $basename) {
            Write-Output '{}'
            exit 0
        }
    }
} catch {}

$now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$staleFiles = @()

foreach ($f in @('plan.md','progress.md')) {
    if (Test-Path $f) {
        $mtime = [DateTimeOffset]::new((Get-Item $f).LastWriteTimeUtc).ToUnixTimeSeconds()
        $age = $now - $mtime
        if ($age -gt $maxStale) {
            $staleFiles += "$f(${age}s)"
        }
    }
}

if ($staleFiles.Count -gt 0) {
    $fileList = $staleFiles -join ', '
    $msg = "[scientific-method] Planning files are stale: $fileList. Update plan.md (Current State, Cycle status) and progress.md (actions taken) before continuing. Re-read plan.md to refresh your goals."
    $escapedMsg = $msg -replace '"', '\"'
    Write-Output "{`"permissionDecision`":`"deny`",`"permissionDecisionReason`":`"$escapedMsg`"}"
    exit 0
}

Write-Output '{}'
exit 0
