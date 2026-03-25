#!/usr/bin/env node
// poi-search.js — Amap POI (Point of Interest) search
// Usage:
//   node poi-search.js --keywords=coffee --city=beijing
//   node poi-search.js --keywords=restaurant --location=116.397,39.909 --radius=1000
//   node poi-search.js --help

const { apiRequest, parseArgs } = require('./lib/env.js');

const API_URL = 'https://restapi.amap.com/v5/place/text';

const HELP = `
Amap POI Search — search for places by keyword, city, or location radius

Usage:
  node poi-search.js --keywords=<query> [options]

Required:
  --keywords=<text>       Search keyword (e.g., "coffee", "hotel", "gas station")

Optional:
  --city=<name|adcode>    City name or adcode to search within
  --city-limit=<bool>     Restrict results to city (true/false, default: true)
  --types=<codes>         POI type codes, pipe-separated (e.g., "050000|060000")
  --location=<lng,lat>    Center point for radius search (e.g., "116.397,39.909")
  --radius=<meters>       Search radius in meters (used with --location)
  --page=<number>         Page number (default: 1)
  --page-size=<number>    Results per page (max 25, default: 10)

Output:
  JSON object with status, count, and pois array to stdout

Examples:
  node poi-search.js --keywords=coffee --city=beijing
  node poi-search.js --keywords=hotel --location=116.397,39.909 --radius=2000
  node poi-search.js --keywords=restaurant --city=110000 --types=050000
`.trim();

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!args.keywords) {
    console.error('Error: --keywords is required. Use --help for usage.');
    process.exit(1);
  }

  const params = { keywords: args.keywords };
  if (args.city) params.region = args.city;
  if (args['city-limit'] !== undefined) params.city_limit = args['city-limit'];
  if (args.types) params.types = args.types;
  if (args.location) params.location = args.location;
  if (args.radius) params.radius = args.radius;
  if (args.page) params.page = args.page;
  if (args['page-size']) params.page_size = args['page-size'];

  try {
    const data = await apiRequest(API_URL, params);
    const result = {
      status: 'success',
      count: parseInt(data.count || '0', 10),
      pois: (data.pois || []).map(poi => ({
        name: poi.name,
        address: poi.address,
        location: poi.location,
        type: poi.type,
        typecode: poi.typecode,
        tel: poi.tel || '',
        distance: poi.distance || '',
        cityname: poi.cityname || '',
        adname: poi.adname || ''
      }))
    };
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ error: err.message }, null, 2));
    process.exit(1);
  }
}

main();
