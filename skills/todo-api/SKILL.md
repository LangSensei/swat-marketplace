---
name: todo-api
version: "1.0.0"
description: Manage Microsoft To Do tasks and task lists using Microsoft Graph API. CRUD operations on lists, tasks, and attachments. Requires msal-auth skill and an app registration with Tasks.ReadWrite scope.
dependencies:
  skills: [msal-auth]
---

# Todo API

CRUD wrapper for Microsoft To Do via Graph API. Handles token acquisition, 401 retry, and JSON serialization.

## Quick Start

```powershell
# 1. Load
. {skills}\msal-auth\scripts\MsalAuth.ps1
. {skills}\todo-api\scripts\Invoke-TodoApi.ps1

# 2. Use
Invoke-TodoApi -TenantId <tenant-id> -ClientId <client-id> -Method GET -Endpoint "\me\todo\lists"
```

## Function

```powershell
Invoke-TodoApi -TenantId <tenant-id> -ClientId <client-id> -Method <METHOD> -Endpoint "\path" [-Filter "<odata>"] [-Body '<json>'] [-BodyFile "<file>"]
```

| Parameter   | Required | Description                                                                         |
| ----------- | -------- | ----------------------------------------------------------------------------------- |
| `-TenantId` | **Yes**  | Azure AD tenant ID (GUID)                                                           |
| `-ClientId` | **Yes**  | App registration client ID (GUID)                                                   |
| `-Method`   | **Yes**  | `GET`, `POST`, `PATCH`, or `DELETE`                                                 |
| `-Endpoint` | **Yes**  | Graph path — use **backslashes** (e.g. `\me\todo\lists`) — normalized internally  |
| `-Filter`   | No       | OData `$filter` (e.g. `"status ne 'completed'"`)                                    |
| `-Body`     | No       | Inline JSON for POST/PATCH                                                          |
| `-BodyFile` | No       | Path to JSON file (alternative to `-Body` for large payloads)                       |

- Output is always valid JSON (`ConvertTo-Json -Depth 10`)
- On HTTP 401, auto-retries once (clears token cache, re-acquires)
- Throws on all other HTTP errors

## Rules

- **Do NOT** hardcode TenantId or ClientId — pass from caller context
- **Do NOT** print token values — token handling is internal

## API Reference

All examples below omit `-TenantId` and `-ClientId` for brevity — always include them.

### Task Lists

```powershell
# List all
Invoke-TodoApi ... -Method GET -Endpoint "\me\todo\lists"

# Create
Invoke-TodoApi ... -Method POST -Endpoint "\me\todo\lists" -Body '{"displayName":"My List"}'

# Delete
Invoke-TodoApi ... -Method DELETE -Endpoint "\me\todo\lists\{list-id}"
```

### Tasks

```powershell
# List (with optional filter)
Invoke-TodoApi ... -Method GET -Endpoint "\me\todo\lists\{list-id}\tasks"
Invoke-TodoApi ... -Method GET -Endpoint "\me\todo\lists\{list-id}\tasks" -Filter "status ne 'completed'"

# Get single
Invoke-TodoApi ... -Method GET -Endpoint "\me\todo\lists\{list-id}\tasks\{task-id}"

# Create
Invoke-TodoApi ... -Method POST -Endpoint "\me\todo\lists\{list-id}\tasks" -Body '{"title":"Task title","body":{"content":"Details","contentType":"text"}}'

# Create with file body (large payloads)
Invoke-TodoApi ... -Method POST -Endpoint "\me\todo\lists\{list-id}\tasks" -BodyFile "temp/task-body.json"

# Update (PATCH — only include fields to change)
Invoke-TodoApi ... -Method PATCH -Endpoint "\me\todo\lists\{list-id}\tasks\{task-id}" -Body '{"importance":"high"}'

# Complete
Invoke-TodoApi ... -Method PATCH -Endpoint "\me\todo\lists\{list-id}\tasks\{task-id}" -Body '{"status":"completed"}'

# Delete (returns {"deleted": true})
Invoke-TodoApi ... -Method DELETE -Endpoint "\me\todo\lists\{list-id}\tasks\{task-id}"
```

Optional task fields: `importance` (`low`, `normal`, `high`), `dueDateTime`, `reminderDateTime`, `isReminderOn`.

Supported `$filter` properties: `status`, `importance`.

### Attachments

```powershell
# Upload file attachment (base64-encode content)
Invoke-TodoApi ... -Method POST -Endpoint "\me\todo\lists\{list-id}\tasks\{task-id}\attachments" -Body '{"@odata.type":"#microsoft.graph.taskFileAttachment","name":"report.html","contentType":"text/html","contentBytes":"{base64}"}'
```

## MSYS Path Limitation

Endpoints use backslashes (`\me\todo\lists`) because Git Bash (MSYS) converts forward-slash arguments that resemble Unix paths. The function normalizes `\` → `/` internally.