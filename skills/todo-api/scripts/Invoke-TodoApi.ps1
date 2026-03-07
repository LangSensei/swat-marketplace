# Invoke-TodoApi.ps1 — Function library for Microsoft To Do Graph API
#
# Dot-source this file after msal-auth to get Invoke-TodoApi.
# Usage:
#   . {skills}\msal-auth\scripts\MsalAuth.ps1
#   . {skills}\todo-api\scripts\Invoke-TodoApi.ps1
#
#   Invoke-TodoApi -TenantId <tenant-id> -ClientId <client-id> -Method GET -Endpoint "\me\todo\lists"
#   Invoke-TodoApi -TenantId <tenant-id> -ClientId <client-id> -Method POST -Endpoint "\me\todo\lists\{id}\tasks" -Body '{"title":"..."}'

$script:TodoApiBase = "https://graph.microsoft.com/v1.0"
$script:TodoApiScope = "https://graph.microsoft.com/Tasks.ReadWrite"

function Invoke-TodoApi {
    param(
        [Parameter(Mandatory)][string]$TenantId,
        [Parameter(Mandatory)][string]$ClientId,
        [Parameter(Mandatory)][ValidateSet("GET","POST","PATCH","DELETE")][string]$Method,
        [Parameter(Mandatory)][string]$Endpoint,
        [string]$Filter,
        [string]$Body,
        [string]$BodyFile
    )

    # --- Resolve body ---
    $reqBody = $null
    if ($Body) { $reqBody = $Body }
    elseif ($BodyFile) {
        if (-not (Test-Path $BodyFile)) { throw "BodyFile not found: $BodyFile" }
        $reqBody = Get-Content $BodyFile -Raw -Encoding utf8
    }

    # --- Build request ---
    $normalizedEndpoint = $Endpoint.Replace('\', '/')
    $uri = $script:TodoApiBase + $normalizedEndpoint
    if ($Filter) { $uri += "?`$filter=$Filter" }

    $token = Get-MsalToken -TenantId $TenantId -ClientId $ClientId -Scope $script:TodoApiScope
    $headers = @{ Authorization = "Bearer $token" }
    $params = @{ Method = $Method; Uri = $uri; Headers = $headers }
    if ($reqBody) {
        $params.Body = $reqBody
        $params.ContentType = "application/json"
    }

    # --- Execute with auto-retry on 401 ---
    try {
        $result = Invoke-RestMethod @params
    }
    catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 401) {
            Clear-MsalToken -TenantId $TenantId -ClientId $ClientId -Scope $script:TodoApiScope
            $token = Get-MsalToken -TenantId $TenantId -ClientId $ClientId -Scope $script:TodoApiScope
            $params.Headers.Authorization = "Bearer $token"
            $result = Invoke-RestMethod @params
        }
        else { throw }
    }

    if ($Method -eq "DELETE" -and -not $result) {
        $result = @{ deleted = $true }
    }

    return ($result | ConvertTo-Json -Depth 10)
}
