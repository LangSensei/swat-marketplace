// MsalAuth.cs — .NET 10 file-based C# script for token acquisition
//
// Acquires an Azure AD / Entra ID access token:
//   1. Silent (cached refresh token) — no user interaction
//   2. System browser interactive — opens default browser for sign-in
//
// Usage:
//   dotnet run --file MsalAuth.cs -- -TenantId=<guid> -ClientId=<guid> -Scope=<resource>
//
// Parameters:
//   -TenantId=<guid>        (Required) Azure AD tenant ID
//   -ClientId=<guid>       (Required) App registration client ID
//   -Scope=<resource>      (Required) Target resource scope
//
// Output: Access token written to stdout. Diagnostics go to stderr.
//
// Requires: .NET 10+

#:package Microsoft.Identity.Client@4.*
#:package Microsoft.Identity.Client.Extensions.Msal@4.*

using Microsoft.Identity.Client;
using Microsoft.Identity.Client.Extensions.Msal;

string? clientId = null;
string? tenantId = null;
string? scope = null;

// Parse args: -TenantId=xxx -ClientId=xxx -Scope=xxx
foreach (var arg in args)
{
    var parts = arg.Split('=', 2);
    if (parts.Length != 2) continue;
    var key = parts[0].TrimStart('-', '/').ToLowerInvariant();
    var val = parts[1];
    switch (key)
    {
        case "tenantid": tenantId = val; break;
        case "clientid": clientId = val; break;
        case "scope": scope = val; break;
    }
}

if (clientId == null || tenantId == null || scope == null)
{
    if (clientId == null) Console.Error.WriteLine("Error: -ClientId=<guid> is required.");
    if (tenantId == null) Console.Error.WriteLine("Error: -TenantId=<guid> is required.");
    if (scope == null) Console.Error.WriteLine("Error: -Scope=<resource> is required.");
    Environment.Exit(1);
}

var app = PublicClientApplicationBuilder.Create(clientId)
    .WithAuthority($"https://login.microsoftonline.com/{tenantId}")
    .WithRedirectUri("http://localhost")
    .Build();

// Persist MSAL token cache via MsalCacheHelper (DPAPI on Windows, Keychain on macOS, Keyring on Linux)
var cacheKey = $"{tenantId}_{clientId}".Replace("-", "");
var cacheFileName = $"msal_{cacheKey}.dat";
var cacheDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".msal", "cache");
var storageProperties = new StorageCreationPropertiesBuilder(cacheFileName, cacheDir)
    .WithMacKeyChain($"MsalAuth_{cacheKey}", "msal_auth")
    .WithLinuxKeyring($"msal_auth_{cacheKey}", "default", "msal_auth",
        new KeyValuePair<string, string>("version", "1"),
        new KeyValuePair<string, string>("product", "msal_auth"))
    .Build();
var cacheHelper = await MsalCacheHelper.CreateAsync(storageProperties);
cacheHelper.RegisterCache(app.UserTokenCache);

string[] scopes = scope.Contains(' ') ? scope.Split(' ') : [scope];

AuthenticationResult result;

// Step 1: Silent — cached token / refresh token
var account = (await app.GetAccountsAsync()).FirstOrDefault();
if (account != null)
{
    Console.Error.WriteLine($"Account: {account.Username} (cached)");
    try
    {
        result = await app.AcquireTokenSilent(scopes, account).ExecuteAsync();
        Console.Error.WriteLine("Token: silent");
        WriteResult(result);
        return;
    }
    catch (MsalUiRequiredException)
    {
        Console.Error.WriteLine("Silent auth failed, need interaction.");
    }
}

// Step 2: System browser interactive
Console.Error.WriteLine("Launching browser sign-in...");
result = await app.AcquireTokenInteractive(scopes)
    .WithUseEmbeddedWebView(false)
    .ExecuteAsync();
Console.Error.WriteLine("Token: browser interactive");
WriteResult(result);

// === Helpers ===

void WriteResult(AuthenticationResult r)
{
    Console.Error.WriteLine($"User: {r.Account.Username}");
    Console.Error.WriteLine($"Expires: {r.ExpiresOn.ToLocalTime():yyyy-MM-dd HH:mm:ss}");
    Console.Error.WriteLine($"Length: {r.AccessToken.Length}");
    Console.Out.Write(r.AccessToken);
}
