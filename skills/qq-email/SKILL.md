---
name: qq-email
version: "1.1.0"
description: Send emails via QQ Mail SMTP using nodemailer. Use when sending notifications, reports, or alerts via email.
dependencies:
  mcps: []
prereq: references/SETUP.md
---

# QQ Email Skill

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `QQ_EMAIL_USER` | QQ Mail address (sender) | `123456@qq.com` |
| `QQ_EMAIL_AUTH_CODE` | SMTP authorization code | (from QQ Mail settings) |

Credentials are auto-loaded from `~/.swat/.env`. Environment variables take precedence over file values. See `references/SETUP.md` for setup instructions.

## CLI Scripts

### Send Email

```bash
NODE_PATH=$(npm root -g) node scripts/send.js \
  --to "recipient@example.com" \
  --subject "Test Email" \
  --body "Hello, this is a test."
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `--to <email>` | Yes | Recipient email address |
| `--subject <text>` | Yes | Email subject line |
| `--body <text>` | No | Plain text body |
| `--html <file>` | No | Path to HTML file to use as email body |
| `--from <email>` | No | Override sender (defaults to `QQ_EMAIL_USER`) |
| `--attach <file>` | No | File attachment (repeatable for multiple files) |

If both `--body` and `--html` are provided, the email is sent as multipart with both plain text and HTML alternatives.

**Output:** JSON to stdout.

Success:
```json
{
  "status": "success",
  "messageId": "<abc123@qq.com>",
  "to": "recipient@example.com",
  "subject": "Test Email"
}
```

Error:
```json
{
  "status": "error",
  "message": "Missing required argument: --to"
}
```

Exit code: `0` on success, `1` on error.

### Examples

**Plain text email:**
```bash
NODE_PATH=$(npm root -g) node scripts/send.js \
  --to "user@example.com" \
  --subject "Daily Report" \
  --body "All systems operational."
```

**HTML email from file:**
```bash
NODE_PATH=$(npm root -g) node scripts/send.js \
  --to "user@example.com" \
  --subject "Weekly Report" \
  --html report.html
```

**Email with attachments:**
```bash
NODE_PATH=$(npm root -g) node scripts/send.js \
  --to "user@example.com" \
  --subject "Report with Data" \
  --body "Please find the attached files." \
  --attach data.csv \
  --attach chart.png
```

**Custom sender:**
```bash
NODE_PATH=$(npm root -g) node scripts/send.js \
  --to "user@example.com" \
  --subject "From Alt Account" \
  --body "Sent from a different address." \
  --from "alt@qq.com"
```

## SMTP Configuration

| Setting | Value |
|---------|-------|
| Host | `smtp.qq.com` |
| Port | `465` |
| Secure | `true` (SSL) |

## Notes

- The `--attach` flag can be repeated multiple times for multiple attachments
- HTML body is read from a file path, not inline HTML string
- All credentials come from `~/.swat/.env` or environment variables — never hardcode
- nodemailer must be globally installed (`npm install -g nodemailer`)
