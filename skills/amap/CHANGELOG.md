# Changelog

## 1.0.0 (2026-03-25)

- Initial release
- Add shared env loader (`scripts/lib/env.js`) for API key resolution from env var or `~/.swat/.env`
- Add POI search script (`scripts/poi-search.js`) — keyword search with city filter and radius search
- Add route planning script (`scripts/route-planning.js`) — walking, driving, riding, and transit with waypoints support
- Add geocoding script (`scripts/geocode.js`) — forward and reverse geocoding
- Add weather script (`scripts/weather.js`) — live weather and 3-day forecast by city
- Add setup guide (`references/SETUP.md`) — Amap Web Service Key acquisition
- Zero dependencies — uses Node.js native `fetch` (Node 18+)
