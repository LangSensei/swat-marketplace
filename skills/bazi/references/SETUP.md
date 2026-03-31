# BaZi Skill — Setup Guide

## Prerequisites

- Python 3.8 or later
- `pip3` (Python package manager)
- `git` (to clone the bazi calculation engine)

## Installation

### 1. Install Python Dependencies

```bash
pip3 install lunar-python colorama bidict --break-system-packages
```

**Package purposes:**
- `lunar-python` — Solar-Lunar calendar conversion (handles all date math)
- `colorama` — Terminal color output (used by the upstream bazi library)
- `bidict` — Bidirectional dictionary (used for stem/branch/zodiac lookups)

### 2. Clone the BaZi Calculation Engine

The scripts rely on the `china-testing/bazi` repository for core calculation modules (`datas.py`, `ganzhi.py`, `common.py`, etc.).

```bash
# From the skill root directory:
git clone https://github.com/china-testing/bazi.git references/bazi-repo
```

This clones the repository into `references/bazi-repo/` which is where the scripts expect to find it.

### 3. Verify Installation

```bash
# Test that dependencies are importable
python3 -c "from lunar_python import Solar; print(Solar.fromYmd(2026, 1, 1).getLunar())"

# Test a script
python3 scripts/bazi-analysis.py --help
```

## Troubleshooting

- **ModuleNotFoundError: No module named 'lunar_python'** — Run `pip3 install lunar-python --break-system-packages`
- **ModuleNotFoundError: No module named 'datas'** — Ensure `references/bazi-repo/` exists and contains `datas.py`. Re-clone if needed.
- **Permission denied on pip** — Use `--break-system-packages` flag or install in a virtual environment.
