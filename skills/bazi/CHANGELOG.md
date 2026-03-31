# Changelog

## 1.0.0 (2026-03-31)

- Initial release
- Add shared library (`scripts/lib/__init__.py`) for bazi repo path setup and common helpers
- Add BaZi analysis script (`scripts/bazi-analysis.py`) — four pillars, day master, five elements, nayin, major luck periods
- Add marriage compatibility script (`scripts/compatibility.py`) — zodiac harmony, day master relationship, spouse palace, five-element complementarity, overall rating
- Add auspicious date selection script (`scripts/date-selection.py`) — 12-day cycle (jianchu), San Niang Sha avoidance, profit month checks for weddings
- Add setup guide (`references/SETUP.md`) — Python dependencies and bazi repo setup
- Supports 7 event types: wedding, move, business, travel, construction, burial, general
- All scripts accept solar dates, output structured JSON, and support `--help`
