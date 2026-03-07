# SWAT Marketplace

The official catalog of capabilities for the [SWAT](https://github.com/LangSensei/swat) system.

## Contents

- **📂 Squads**: Specialized agent configurations (e.g., `outlook`, `coding`, `research`).
- **🔧 Skills**: Specialized capabilities (PowerShell, Python, Node.js, etc.) that give agents new abilities.
- **🔌 MCP Servers**: Configuration files for Model Context Protocol servers.

## Usage

Install capabilities directly from your SWAT terminal:

```powershell
# List available squads
swat squad list

# Install a squad
swat squad install <name>
```

## Contributing

To add a new squad or skill, submit a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
