---
name: bazi
version: "1.1.0"
description: Chinese traditional calendar and BaZi (Four Pillars of Destiny) skill. Provides CLI scripts for birth chart analysis, marriage compatibility, and auspicious date selection. Wraps the china-testing/bazi library with lunar-python.
dependencies:
  skills: []
---

# BaZi Skill

Chinese traditional calendar calculations, BaZi (Four Pillars of Destiny) analysis, and auspicious date selection. All scripts accept solar (Gregorian) dates and handle Solar-Lunar conversion internally.

**Requirements:** Python 3.8+, git. All dependencies are set up automatically on first script execution.

## Setup

Prerequisites (Python 3.8+, pip packages, git) are documented in [references/SETUP.md](references/SETUP.md). On first run, the shared library (`scripts/lib/__init__.py`) automatically:

1. Checks that Python packages (`lunar-python`, `colorama`, `bidict`) are importable — prints a clear `pip3 install` command if any are missing
2. Bare-clones `china-testing/bazi` to `~/.swat/repos/china-testing-bazi/`
3. Creates a detached worktree at `~/.swat/repos/china-testing-bazi/worktrees/readonly/` pinned to commit `c425f0c`

This happens silently on first invocation. Subsequent runs reuse the cached clone.

## Scripts

All scripts output structured JSON to stdout. Errors go to stderr.

### BaZi Analysis (Single Person)

Compute the Four Pillars, day master, five-element scores, nayin, and major luck periods from a solar birth date.

```bash
# Basic analysis (default: male, noon hour)
python3 scripts/bazi-analysis.py --date 1990-05-15

# With birth hour and gender
python3 scripts/bazi-analysis.py --date 1990-05-15 --hour 10

# Female
python3 scripts/bazi-analysis.py --date 1992-08-20 --hour 14 --female
```

**Options:** `--date` (required, YYYY-MM-DD), `--hour` (0-23, omit if unknown), `--female`

**Output fields:**
- `four_pillars` — year/month/day/hour pillars with stems, branches, hidden stems, nayin, ten deities
- `day_master` — stem, element, strength assessment (strong/moderate/weak)
- `five_elements` — Wood/Fire/Earth/Metal/Water scores
- `major_luck_periods` — 10 periods with ganzhi, element, nayin, ten deity
- `zodiac` — Chinese zodiac animal
- `lunar_date` — converted lunar date

### Marriage Compatibility

Compare two birth charts for marriage compatibility. Checks zodiac harmony, day master relationship, spouse palace, and five-element complementarity.

```bash
# Basic compatibility
python3 scripts/compatibility.py --person-a 1990-05-15 --person-b 1992-08-20

# With birth hours
python3 scripts/compatibility.py \
  --person-a 1990-05-15 --hour-a 10 \
  --person-b 1992-08-20 --hour-b 14

# Reverse genders (A=female, B=male)
python3 scripts/compatibility.py \
  --person-a 1992-08-20 --a-female \
  --person-b 1990-05-15 --b-male
```

**Options:** `--person-a` (required), `--person-b` (required), `--hour-a` (0-23), `--hour-b` (0-23), `--a-female`, `--b-male`

**Output fields:**
- `zodiac_compatibility` — Six Harmony, Three Harmony, Clash, Harm, Punishment checks with scores
- `day_master_relationship` — five-element generates/controls relationship
- `spouse_palace_harmony` — day branch (spouse palace) interactions
- `five_element_complementarity` — whether one person's strengths fill the other's gaps
- `overall_rating` — score (0-100) with label (Excellent/Good/Average/Below Average/Challenging)

### Auspicious Date Selection

Find auspicious dates for events using the 12-day cycle (jianchu), with optional profit month and San Niang Sha checks for weddings.

```bash
# Wedding dates in Sep-Oct 2026
python3 scripts/date-selection.py --event wedding --year 2026 --month-start 9 --month-end 10

# Wedding with bride's zodiac for profit month check
python3 scripts/date-selection.py \
  --event wedding --year 2026 --month-start 6 --month-end 12 \
  --bride-zodiac ox

# Moving dates in March 2026
python3 scripts/date-selection.py --event move --year 2026 --month-start 3 --month-end 3

# Business opening dates
python3 scripts/date-selection.py --event business --year 2026 --month-start 1 --month-end 6
```

**Event types:** `wedding`, `move`, `business`, `travel`, `construction`, `burial`, `general`

**Options:** `--event` (required), `--year` (required), `--month-start` (required, 1-12), `--month-end` (required, 1-12), `--bride-zodiac` (optional, for weddings)

**Bride zodiac values:** `rat`, `ox`, `tiger`, `rabbit`, `dragon`, `snake`, `horse`, `goat`, `monkey`, `rooster`, `dog`, `pig`

**Output fields:**
- `dates[]` — sorted by score (highest first), each with:
  - `solar_date`, `weekday`, `is_weekend`
  - `lunar_date` — year, month, day, display string
  - `day_ganzhi` — Heavenly Stem + Earthly Branch for the day
  - `jianchu` — 12-day cycle name (chinese/english/pinyin) and description
  - `auspicious` — boolean
  - `score` — numeric score for ranking
  - `reasons` — list of scoring factors
  - `san_niang_sha` — whether the day falls on San Niang Sha (wedding only)
  - `profit_month` — da_li_yue / xiao_li_yue / neutral (wedding with zodiac only)

## Date Selection Rules

**12-Day Cycle (Jianchu):** Each day in the lunar calendar follows a repeating 12-day pattern (Establish, Remove, Full, Balance, Stable, Hold, Break, Danger, Success, Receive, Open, Close). Different cycles are favorable for different activities.

**San Niang Sha:** Lunar days 3, 7, 13, 18, 22, 27 are avoided for weddings according to tradition.

**Profit Months:** Based on the bride's zodiac, certain lunar months are considered Big Profit Months (most auspicious) or Small Profit Months (acceptable):
- Rat/Horse: Big Profit = lunar 6, 12; Small Profit = lunar 1, 7
- Ox/Goat: Big Profit = lunar 5, 11; Small Profit = lunar 4, 10
- Tiger/Monkey: Big Profit = lunar 2, 8; Small Profit = lunar 3, 9
- Rabbit/Rooster: Big Profit = lunar 1, 7; Small Profit = lunar 6, 12
- Dragon/Dog: Big Profit = lunar 4, 10; Small Profit = lunar 5, 11
- Snake/Pig: Big Profit = lunar 3, 9; Small Profit = lunar 2, 8

## Notes

- All scripts accept solar (Gregorian) dates — lunar conversion is automatic
- All scripts support `--help` for usage information
- Output is always JSON to stdout; errors go to stderr
- The bazi reference repo is auto-provisioned to `~/.swat/repos/china-testing-bazi/worktrees/readonly/` on first run
- Birth hour significantly affects the hour pillar; when omitted, the hour pillar is marked as "unknown" with `hour_known: false`
