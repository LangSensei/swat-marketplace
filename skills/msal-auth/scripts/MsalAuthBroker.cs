// MsalAuthBroker.cs — .NET 10 file-based C# script for token acquisition
//
// Acquires an Azure AD / Entra ID access token:
//   1. Silent (cached account) — instant, no user interaction
//   2. WAM broker interactive — OS-level account picker
//
// Usage:
//   dotnet run --file MsalAuthBroker.cs -- -TenantId=<guid> -ClientId=<guid> -Scope=<resource>
//
// Parameters:
//   -TenantId=<guid>        (Required) Azure AD tenant ID
//   -ClientId=<guid>       (Required) App registration client ID
//   -Scope=<resource>      (Required) Target resource scope
//
// Output: Access token written to stdout. Diagnostics go to stderr.
//
// Requires: Windows, .NET 10+

#:package Microsoft.Identity.Client@4.*
#:package Microsoft.Identity.Client.Broker@4.*
#:package Microsoft.Identity.Client.Extensions.Msal@4.*

using Microsoft.Identity.Client;
using Microsoft.Identity.Client.Broker;
using Microsoft.Identity.Client.Extensions.Msal;
using System.Runtime.InteropServices;

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

// Console window handle for WAM parenting (with Windows Terminal support)
var consoleHandle = GetConsoleWindow();
var hwnd = GetAncestor(consoleHandle, GetAncestorFlags.GetRootOwner);
if (hwnd == IntPtr.Zero) hwnd = consoleHandle;

// WAM broker app
var brokerOpts = new BrokerOptions(BrokerOptions.OperatingSystems.Windows) { Title = "MSAL Auth Broker" };
var app = PublicClientApplicationBuilder.Create(clientId)
    .WithAuthority($"https://login.microsoftonline.com/{tenantId}")
    .WithDefaultRedirectUri()
    .WithBroker(brokerOpts)
    .WithParentActivityOrWindow(() => hwnd)
    .Build();

// Persist MSAL token cache via MsalCacheHelper (DPAPI on Windows, Keychain on macOS, Keyring on Linux)
// Cache file is scoped by tenantId+clientId; MSAL internally isolates by scope
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

// Step 1: Find cached account
var accounts = await app.GetAccountsAsync();
IAccount? account = accounts.FirstOrDefault();

AuthenticationResult result;

// Step 2: Try silent auth (cached token / refresh token)
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

// Step 3: WAM interactive — native account picker
Console.Error.WriteLine("Launching WAM sign-in...");
result = await app.AcquireTokenInteractive(scopes)
    .WithParentActivityOrWindow(() => hwnd)
    .ExecuteAsync();
Console.Error.WriteLine("Token: WAM interactive");
WriteResult(result);

// === Helpers ===

void WriteResult(AuthenticationResult r)
{
    Console.Error.WriteLine($"User: {r.Account.Username}");
    Console.Error.WriteLine($"Expires: {r.ExpiresOn.ToLocalTime():yyyy-MM-dd HH:mm:ss}");
    Console.Error.WriteLine($"Length: {r.AccessToken.Length}");
    // Token to stdout for caller to capture; all diagnostics go to stderr
    Console.Out.Write(r.AccessToken);
}

[DllImport("user32.dll", ExactSpelling = true)]
static extern IntPtr GetAncestor(IntPtr hwnd, GetAncestorFlags flags);

[DllImport("kernel32.dll")]
static extern IntPtr GetConsoleWindow();

enum GetAncestorFlags { GetParent = 1, GetRoot = 2, GetRootOwner = 3 }
