# scientific-method: Post-tool-use hook (PowerShell)
# Tracks search/browse action count for 2-Action Rule enforcement.

$input = $Input | Out-String

try {
    $data = $input | ConvertFrom-Json -ErrorAction SilentlyContinue
    $toolName = $data.toolName
} catch {
    $toolName = ""
}

if ($toolName -match 'search|browse|web|fetch|view|screenshot|image') {
    $counterFile = ".scientific_method_action_count"
    $count = 0
    if (Test-Path $counterFile) {
        $count = [int](Get-Content $counterFile -ErrorAction SilentlyContinue)
    }
    $count++
    Set-Content $counterFile $count

    if ($count % 2 -eq 0) {
        Write-Output '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"[scientific-method] 2-Action Rule: You have done 2+ search/browse operations. Update findings.md NOW with what you discovered. Multimodal content will be lost if not written down."}}'
        exit 0
    }
}

Write-Output '{}'
exit 0
