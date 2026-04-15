# SWAT Marketplace

The official catalog of capabilities for the [SWAT](https://github.com/LangSensei/swat) system.

## Contents

- **📂 Squads** (11): Specialized agent configurations (e.g., `swat-dev`, `swat-review`, `a-share-analyst`).
- **🔧 Skills** (13): Reusable capabilities that give agents new abilities (e.g., `git-pr`, `sop`, `scientific-method`).
- **🔌 MCP Servers** (2): Configuration files for Model Context Protocol servers.

## Usage

SWAT is an MCP server — squads are managed through MCP tools, not CLI commands. Configure your agent to connect to the SWAT MCP server, then use:

- `swat_squad_browse` — Browse available squads in the marketplace
- `swat_squad_install` — Install a squad by name
- `swat_squads` — List installed squads

See the [SWAT README](https://github.com/LangSensei/swat#readme) for full MCP configuration and tool reference.

## Contributing

To add a new squad or skill, submit a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
