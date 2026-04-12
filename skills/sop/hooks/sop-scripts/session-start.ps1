# sop: Session start hook
# If plan.md exists: inject context for session recovery
# If plan.md doesn't exist: inject SKILL.md so agent knows the framework
# Always exits 0

$Input = $null
try { $Input = [Console]::In.ReadToEnd() } catch {}

$PlanFile = "plan.md"
$SkillDir = ".github/skills/sop"
$Python = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } elseif (Get-Command python -ErrorAction SilentlyContinue) { "python" } else { $null }

if (Test-Path $PlanFile) {
    $Context = "[sop] Resuming session. Read plan.md, findings.md, and progress.md to restore context."
    $Content = Get-Content -Path $PlanFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($Content) {
        $GoalMatch = [regex]::Match($Content, '(?ms)^## Goal\s*\n(.*?)(?=^## )')
        $StateMatch = [regex]::Match($Content, '(?ms)^## Current State\s*\n(.*?)(?=^## )')
        $Goal = if ($GoalMatch.Success) { $GoalMatch.Groups[1].Value.Trim().Split("`n") | Select-Object -First 3 | Out-String } else { "" }
        $State = if ($StateMatch.Success) { $StateMatch.Groups[1].Value.Trim().Split("`n") | Select-Object -First 5 | Out-String } else { "" }
        if ($Goal -or $State) {
            $Context = "$Context`n`nGoal: $Goal`n$State"
        }
    }
} else {
    $SkillFile = Join-Path $SkillDir "SKILL.md"
    if (Test-Path $SkillFile) {
        $Context = Get-Content -Path $SkillFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    }
}

if (-not $Context) {
    Write-Output '{}'
    exit 0
}

if ($Python) {
    $Escaped = $Context | & $Python -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>$null
} else {
    $Escaped = $Context | ConvertTo-Json
}

Write-Output "{`"hookSpecificOutput`":{`"hookEventName`":`"SessionStart`",`"additionalContext`":$Escaped}}"
exit 0
