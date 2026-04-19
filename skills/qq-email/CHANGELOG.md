# Changelog

## 1.1.0 (2026-04-19)

- Auto-load credentials from `~/.swat/.env` (env vars take precedence)
- Update SETUP.md to instruct writing credentials to `~/.swat/.env` instead of exporting env vars
- Update SKILL.md environment variables section to document auto-loading behavior

## 1.0.0 (2026-04-19)

- Initial release
- Send emails via QQ Mail SMTP using nodemailer
- Support for plain text body, HTML file body, and file attachments
- JSON output to stdout for success and error cases
- Environment variable based credential management
