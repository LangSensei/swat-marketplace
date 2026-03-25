---
name: amap
version: "1.0.0"
description: Amap (Gaode Maps) Web Service API skill. Provides CLI scripts for POI search, route planning, geocoding, and weather queries. Zero dependencies — uses Node.js native fetch (Node 18+).
prereq: references/SETUP.md
dependencies:
  skills: []
---

# Amap Skill

Wraps the Amap (Gaode Maps) Web Service REST API. All scripts output structured JSON to stdout for easy parsing by Captain agents.

**Requirements:** Node.js 18+ (uses native `fetch`). No npm install needed.

## API Key

Scripts resolve the key in order:
1. `AMAP_WEBSERVICE_KEY` environment variable
2. `~/.swat/.env` file (`AMAP_WEBSERVICE_KEY=xxx`)

If neither is set, scripts exit with a clear error message.

## Scripts

### POI Search

Search for places by keyword with optional city filter or location-based radius search.

```bash
# Keyword search in a city
node scripts/poi-search.js --keywords=coffee --city=beijing

# Nearby search within radius
node scripts/poi-search.js --keywords=hotel --location=116.397,39.909 --radius=2000

# Filter by POI type codes
node scripts/poi-search.js --keywords=restaurant --city=110000 --types=050000
```

**Options:** `--keywords` (required), `--city`, `--city-limit`, `--types`, `--location`, `--radius`, `--page`, `--page-size`

### Route Planning

Plan routes by walking, driving, riding (bicycle), or public transit.

```bash
# Walking route
node scripts/route-planning.js --type=walking --origin=116.397,39.909 --destination=116.427,39.903

# Driving with waypoints
node scripts/route-planning.js --type=driving --origin=116.397,39.909 --destination=116.427,39.903 --waypoints=116.41,39.91

# Public transit (--city required)
node scripts/route-planning.js --type=transit --origin=116.397,39.909 --destination=116.427,39.903 --city=beijing

# Bicycle
node scripts/route-planning.js --type=riding --origin=116.397,39.909 --destination=116.427,39.903
```

**Options:** `--type` (required: walking/driving/riding/transit), `--origin` (required), `--destination` (required), `--waypoints` (driving only), `--strategy`, `--city` (transit only), `--nightflag` (transit only)

### Geocoding

Convert between addresses and coordinates.

```bash
# Address to coordinates (forward geocoding)
node scripts/geocode.js --address="Beijing Railway Station"
node scripts/geocode.js --address="Nanjing Road" --city=shanghai

# Coordinates to address (reverse geocoding)
node scripts/geocode.js --location=116.397428,39.90923
node scripts/geocode.js --location=116.397428,39.90923 --extensions=all
```

**Forward options:** `--address` (required), `--city`
**Reverse options:** `--location` (required), `--radius`, `--extensions` (base/all)

### Weather

Query live weather or 3-day forecast by city name or adcode.

```bash
# Live weather
node scripts/weather.js --city=beijing

# 3-day forecast
node scripts/weather.js --city=shanghai --forecast

# By adcode
node scripts/weather.js --city=110000
```

**Options:** `--city` (required), `--forecast`

## Coordinate Format

All coordinates use `longitude,latitude` format (e.g., `116.397428,39.90923`). This is Amap's standard — longitude first, latitude second.

## API Reference

| Script | Amap API | Endpoint |
|--------|----------|----------|
| poi-search.js | Place Text Search v5 | `restapi.amap.com/v5/place/text` |
| route-planning.js (walking) | Walking Direction v3 | `restapi.amap.com/v3/direction/walking` |
| route-planning.js (driving) | Driving Direction v3 | `restapi.amap.com/v3/direction/driving` |
| route-planning.js (riding) | Bicycling Direction v4 | `restapi.amap.com/v4/direction/bicycling` |
| route-planning.js (transit) | Transit Integrated v3 | `restapi.amap.com/v3/direction/transit/integrated` |
| geocode.js (forward) | Geocode v3 | `restapi.amap.com/v3/geocode/geo` |
| geocode.js (reverse) | Reverse Geocode v3 | `restapi.amap.com/v3/geocode/regeo` |
| weather.js | Weather Info v3 | `restapi.amap.com/v3/weather/weatherInfo` |

## Notes

- All scripts support `--help` for usage information
- Output is always JSON to stdout; errors go to stderr
- Rate limits depend on your Amap developer plan
- Amap Web Service Key is different from JavaScript API Key — make sure to use the Web Service type
