# scientific-method: Session start hook (PowerShell)
# If plan.md exists: inject context for session recovery
# If plan.md doesn't exist: inject SKILL.md so agent knows the framework

$input = $Input | Out-String

$planFile = "plan.md"
$skillDir = Join-Path ".github" "skills" "scientific-method"

if (Test-Path $planFile) {
    $context = "[scientific-method] Resuming session. Read plan.md, findings.md, and progress.md to restore context."

    $content = Get-Content $planFile -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $goal = ""
        $state = ""
        if ($content -match '(?ms)^## Goal\r?\n(.*?)(?=^## )') {
            $goal = ($Matches[1].Trim() -split "`n" | Select-Object -First 3) -join "`n"
        }
        if ($content -match '(?ms)^## Current State\r?\n(.*?)(?=^## )') {
            $state = ($Matches[1].Trim() -split "`n" | Select-Object -First 5) -join "`n"
        }
        if ($goal -or $state) {
            $context += "`n`nGoal: $goal`n$state"
        }
    }
} else {
    $skillMd = Join-Path $skillDir "SKILL.md"
    if (Test-Path $skillMd) {
        $context = Get-Content $skillMd -Raw -ErrorAction SilentlyContinue
    }
}

if (-not $context) {
    Write-Output '{}'
    exit 0
}

$python = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
$escaped = $context | & $python -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>$null
if (-not $escaped) { $escaped = '""' }

Write-Output "{`"hookSpecificOutput`":{`"hookEventName`":`"SessionStart`",`"additionalContext`":$escaped}}"
exit 0
