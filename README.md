# SWAT Marketplace

The official catalog of capabilities for the [SWAT](https://github.com/LangSensei/swat) system.

## Contents

- **📂 Squads**: Specialized agent configurations (e.g., `swat-dev`, `swat-review`, `a-share-analyst`).
- **🔧 Skills**: Reusable capabilities that give agents new abilities (e.g., `git-pr`, `sop`, `scientific-method`).
- **🔌 MCP Servers**: Configuration files for Model Context Protocol servers.

## Usage

Squads are managed through MCP tools. Configure your agent to connect to the SWAT MCP server, then use:

- `swat_squad_browse` — Browse available squads in the marketplace
- `swat_squad_install` — Install a squad by name
- `swat_squads` — List installed squads

See the [SWAT README](https://github.com/LangSensei/swat#readme) for full MCP configuration and tool reference.

## Contributing

To add a new squad or skill, submit a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
