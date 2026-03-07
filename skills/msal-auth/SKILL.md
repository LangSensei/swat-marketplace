---
name: msal-auth
version: "1.0.0"
description: Acquire Azure AD / Entra ID access tokens via MSAL. Supports personal and work accounts with system browser sign-in and silent refresh. Not for service principals or certificates.
---

# MSAL Auth

Acquire access tokens for any Microsoft / Entra ID protected API. Uses system browser for interactive sign-in, MSAL cache for silent refresh.

## Prerequisites

- **.NET 10+** — `dotnet run --file` support

## Quick Start

```powershell
# 1. Load
. {skills}\msal-auth\scripts\MsalAuth.ps1

# 2. Acquire token
$token = Get-MsalToken -TenantId <tenant-id> -ClientId <client-id> -Scope "https://graph.microsoft.com/Tasks.ReadWrite"

# 3. Use token
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/me/todo/lists" -Headers $headers
```

## Functions

| Function | Description |
|----------|-------------|
| `Get-MsalToken` | Acquire token (disk cache → MSAL silent → WAM interactive) |
| `Clear-MsalToken` | Clear disk cache for a token — call on 401 before retrying |

All parameters are identical for both functions:

| Parameter   | Required | Description                              |
| ----------- | -------- | ---------------------------------------- |
| `-TenantId` | **Yes**  | Azure AD tenant ID (GUID)                |
| `-ClientId` | **Yes**  | App registration client ID (GUID)        |
| `-Scope`    | **Yes**  | Resource scope (e.g. `https://graph.microsoft.com/Tasks.ReadWrite`) |

## Error Handling

- `Get-MsalToken` **throws** on failure — wrap in try/catch if needed
- On HTTP 401 from an API call: `Clear-MsalToken` → `Get-MsalToken` → retry once

## Rules

- **Do NOT** print or log token values — use `$token` in-memory only
- **Do NOT** pass tokens in prompts or conversation context
- Each consumer skill provides its own TenantId, ClientId, and Scope — msal-auth is a pure contract, not an API registry

## Internals

Two-layer cache avoids repeated sign-in and dotnet cold-start:

| Layer | Location | Purpose |
|-------|----------|---------|
| PS disk cache | `~/.msal/tokens/{key}.json` | Skip dotnet startup (~2-3s) when token still fresh (>120s remaining) |
| MSAL cache | `~/.msal/cache/msal_{key}.dat` | Refresh tokens for silent renewal (~90 days) |

Token lifecycle: PS cache hit → return | PS miss → dotnet → MSAL silent → return | MSAL miss → browser interactive → return.
