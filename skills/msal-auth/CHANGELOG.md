# Changelog

## 1.0.0 (2026-03-07)

Initial release.

- `Get-MsalToken` — acquire access tokens (PS disk cache → MSAL silent → browser interactive)
- `Clear-MsalToken` — clear disk cache for 401 retry flows
- `MsalAuth.cs` — .NET 10 system browser auth with MsalCacheHelper persistence
- Two-tier caching: PS disk cache (`~/.msal/tokens/`) + MSAL refresh tokens (`~/.msal/cache/`)
