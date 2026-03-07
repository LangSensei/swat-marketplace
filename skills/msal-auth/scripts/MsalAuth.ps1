# MsalAuth.ps1 — MSAL token acquisition function library
#
# Dot-source this file to get Get-MsalToken and Clear-MsalToken.
# Usage:
#   . {skills}\msal-auth\scripts\MsalAuth.ps1
#   $token = Get-MsalToken -TenantId <tenant-id> -ClientId <client-id> -Scope ".../.default"
#   Clear-MsalToken -TenantId <tenant-id> -ClientId <client-id> -Scope ".../.default"

function Get-MsalToken {
    param(
        [Parameter(Mandatory)][string]$TenantId,
        [Parameter(Mandatory)][string]$ClientId,
        [Parameter(Mandatory)][string]$Scope
    )
    $toolScript = Join-Path $PSScriptRoot "MsalAuth.cs"

    # Fast-path: check disk cache (~/.msal/tokens/{tenantId}_{clientId}_{scope}.json)
    # Avoids dotnet cold-start (~2-3s) when token is still fresh
    $cacheDir = Join-Path $env:USERPROFILE ".msal\tokens"
    $scopeKey = $Scope -replace '[^a-zA-Z0-9]','_'
    $cacheKey = "${TenantId}_${ClientId}_${scopeKey}" -replace '-',''
    $cacheFile = Join-Path $cacheDir "$cacheKey.json"
    if (Test-Path $cacheFile) {
        $cached = Get-Content $cacheFile -Raw | ConvertFrom-Json
        $now = [int][DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
        if (($cached.expires_at - $now) -gt 120) {
            return $cached.token
        }
    }

    # Acquire token via MsalAuthBroker (silent from MsalCacheHelper, or WAM interactive)
    # Copy script to TEMP to avoid repo's global.json / Central Package Management conflicts
    $tempScript = Join-Path $env:TEMP "MsalAuth.cs"
    Copy-Item $toolScript $tempScript -Force
    $dotnetArgs = @("run", "--file", $tempScript, "--", "-TenantId=$TenantId", "-ClientId=$ClientId", "-Scope=$Scope")
    $token = (& dotnet @dotnetArgs 2>$null).Trim()
    if (-not $token) { throw "MsalAuthBroker did not return a token" }

    # Write disk cache — try JWT exp decode, fallback to 50min TTL for opaque tokens
    $expiresAt = $null
    $parts = $token.Split('.')
    if ($parts.Count -eq 3) {
        try {
            $payload = $parts[1].Replace('-','+').Replace('_','/')
            $pad = 4 - ($payload.Length % 4)
            if ($pad -ne 4) { $payload += '=' * $pad }
            $expiresAt = ([System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload)) | ConvertFrom-Json).exp
        } catch {}
    }
    if (-not $expiresAt) {
        # Opaque tokens (personal accounts) have no decodable exp claim.
        # Default lifetime is 60-90min per Microsoft docs. 50min is a safe conservative TTL.
        # Ref: https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens
        $expiresAt = [int][DateTimeOffset]::UtcNow.ToUnixTimeSeconds() + 3000
    }

    if (-not (Test-Path $cacheDir)) { New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null }
    $tmp = Join-Path $cacheDir "$cacheKey.tmp"
    @{ token = $token; expires_at = $expiresAt } | ConvertTo-Json | Set-Content $tmp
    Move-Item $tmp $cacheFile -Force
    return $token
}

function Clear-MsalToken {
    param(
        [Parameter(Mandatory)][string]$TenantId,
        [Parameter(Mandatory)][string]$ClientId,
        [Parameter(Mandatory)][string]$Scope
    )
    $cacheDir = Join-Path $env:USERPROFILE ".msal\tokens"
    $scopeKey = $Scope -replace '[^a-zA-Z0-9]','_'
    $cacheKey = "${TenantId}_${ClientId}_${scopeKey}" -replace '-',''
    $cacheFile = Join-Path $cacheDir "$cacheKey.json"
    if (Test-Path $cacheFile) { Remove-Item $cacheFile -Force }
}
