#!/usr/bin/env node
// geocode.js — Amap geocoding (address to coordinates) and reverse geocoding
// Usage:
//   node geocode.js --address="Tiananmen Square, Beijing"
//   node geocode.js --location=116.397,39.909
//   node geocode.js --help

const { apiRequest, parseArgs } = require('./lib/env.js');

const GEOCODE_URL = 'https://restapi.amap.com/v3/geocode/geo';
const REGEO_URL = 'https://restapi.amap.com/v3/geocode/regeo';

const HELP = `
Amap Geocoding — convert addresses to coordinates and coordinates to addresses

Usage:
  node geocode.js --address=<text> [options]     Forward geocoding
  node geocode.js --location=<lng,lat> [options]  Reverse geocoding

Forward Geocoding (address to coordinates):
  --address=<text>        Address to geocode (e.g., "Tiananmen Square, Beijing")
  --city=<name|adcode>    City to narrow results (optional)

Reverse Geocoding (coordinates to address):
  --location=<lng,lat>    Coordinates to reverse geocode (e.g., "116.397,39.909")
  --radius=<meters>       Search radius (default: 500)
  --extensions=<base|all> Detail level: "base" (default) or "all" (includes POIs)

Output:
  JSON object with geocoding results to stdout

Examples:
  node geocode.js --address="Beijing Railway Station"
  node geocode.js --address="Nanjing Road" --city=shanghai
  node geocode.js --location=116.397428,39.90923
  node geocode.js --location=116.397428,39.90923 --extensions=all
`.trim();

async function forwardGeocode(args) {
  const params = { address: args.address };
  if (args.city) params.city = args.city;

  const data = await apiRequest(GEOCODE_URL, params);
  return {
    status: 'success',
    count: parseInt(data.count || '0', 10),
    geocodes: (data.geocodes || []).map(g => ({
      formatted_address: g.formatted_address,
      location: g.location,
      province: g.province,
      city: g.city || g.province,
      district: g.district,
      level: g.level
    }))
  };
}

async function reverseGeocode(args) {
  const params = { location: args.location };
  if (args.radius) params.radius = args.radius;
  if (args.extensions) params.extensions = args.extensions;

  const data = await apiRequest(REGEO_URL, params);
  const regeo = data.regeocode || {};
  const comp = regeo.addressComponent || {};
  const result = {
    status: 'success',
    formatted_address: regeo.formatted_address,
    address_component: {
      province: comp.province,
      city: comp.city || comp.province,
      district: comp.district,
      township: comp.township,
      street: comp.streetNumber?.street || '',
      number: comp.streetNumber?.number || ''
    }
  };
  // Include POIs if extensions=all
  if (args.extensions === 'all' && regeo.pois) {
    result.nearby_pois = regeo.pois.slice(0, 10).map(p => ({
      name: p.name,
      type: p.type,
      address: p.address,
      location: p.location,
      distance: p.distance
    }));
  }
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!args.address && !args.location) {
    console.error('Error: --address or --location is required. Use --help for usage.');
    process.exit(1);
  }

  try {
    let result;
    if (args.address) {
      result = await forwardGeocode(args);
    } else {
      result = await reverseGeocode(args);
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ error: err.message }, null, 2));
    process.exit(1);
  }
}

main();
