#!/usr/bin/env node
// route-planning.js — Amap route planning for walking, driving, riding, and transit
// Usage:
//   node route-planning.js --type=driving --origin=116.397,39.909 --destination=116.427,39.903
//   node route-planning.js --type=transit --origin=116.397,39.909 --destination=116.427,39.903 --city=beijing
//   node route-planning.js --help

const { apiRequest, parseArgs } = require('./lib/env.js');

const ENDPOINTS = {
  walking:  'https://restapi.amap.com/v3/direction/walking',
  driving:  'https://restapi.amap.com/v3/direction/driving',
  riding:   'https://restapi.amap.com/v4/direction/bicycling',
  transit:  'https://restapi.amap.com/v3/direction/transit/integrated'
};

const HELP = `
Amap Route Planning — plan routes by walking, driving, riding (bicycle), or transit

Usage:
  node route-planning.js --type=<mode> --origin=<lng,lat> --destination=<lng,lat> [options]

Required:
  --type=<mode>           Route type: walking, driving, riding, transit
  --origin=<lng,lat>      Start point (e.g., "116.397428,39.90923")
  --destination=<lng,lat> End point (e.g., "116.427281,39.903719")

Driving options:
  --waypoints=<points>    Via points, semicolon-separated (e.g., "116.41,39.91;116.42,39.92")
  --strategy=<number>     Routing strategy:
                            0 = fastest, 1 = shortest, 2 = avoid highways
                            10 = avoid congestion (default)

Transit options:
  --city=<name|adcode>    City name or adcode (REQUIRED for transit)
  --strategy=<number>     0 = fastest, 1 = fewest transfers, 2 = least walking
                            3 = economical (default: 0)
  --nightflag=<0|1>       Include night buses (default: 0)

Output:
  JSON object with route details to stdout

Examples:
  node route-planning.js --type=walking --origin=116.397,39.909 --destination=116.427,39.903
  node route-planning.js --type=driving --origin=116.397,39.909 --destination=116.427,39.903 --waypoints=116.41,39.91
  node route-planning.js --type=transit --origin=116.397,39.909 --destination=116.427,39.903 --city=beijing
  node route-planning.js --type=riding --origin=116.397,39.909 --destination=116.427,39.903
`.trim();

function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hours}h ${rem}min` : `${hours}h`;
}

function formatDistance(meters) {
  const m = parseInt(meters, 10);
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

async function planWalking(args) {
  const params = { origin: args.origin, destination: args.destination };
  const data = await apiRequest(ENDPOINTS.walking, params);
  const paths = (data.route?.paths || []).map(p => ({
    distance: formatDistance(p.distance),
    distance_m: parseInt(p.distance, 10),
    duration: formatDuration(p.duration),
    duration_s: parseInt(p.duration, 10)
  }));
  return { status: 'success', type: 'walking', origin: args.origin, destination: args.destination, paths };
}

async function planDriving(args) {
  const params = { origin: args.origin, destination: args.destination, extensions: 'base' };
  if (args.waypoints) params.waypoints = args.waypoints;
  if (args.strategy) params.strategy = args.strategy;
  else params.strategy = '10';

  const data = await apiRequest(ENDPOINTS.driving, params);
  const paths = (data.route?.paths || []).map(p => ({
    distance: formatDistance(p.distance),
    distance_m: parseInt(p.distance, 10),
    duration: formatDuration(p.duration),
    duration_s: parseInt(p.duration, 10),
    tolls: p.tolls || '0',
    traffic_lights: p.traffic_lights || '0'
  }));
  return { status: 'success', type: 'driving', origin: args.origin, destination: args.destination, paths };
}

async function planRiding(args) {
  const params = { origin: args.origin, destination: args.destination };
  const key = require('./lib/env.js').getApiKey();
  const searchParams = new URLSearchParams({ key, ...params });
  const fullUrl = `${ENDPOINTS.riding}?${searchParams.toString()}`;

  const response = await fetch(fullUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const data = await response.json();

  // v4 bicycling uses errcode instead of status
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`Amap API error: ${data.errmsg || 'Unknown error'} (errcode: ${data.errcode})`);
  }

  const pathData = data.data?.paths || [];
  const paths = pathData.map(p => ({
    distance: formatDistance(p.distance),
    distance_m: parseInt(p.distance, 10),
    duration: formatDuration(p.duration),
    duration_s: parseInt(p.duration, 10)
  }));
  return { status: 'success', type: 'riding', origin: args.origin, destination: args.destination, paths };
}

async function planTransit(args) {
  if (!args.city) {
    console.error('Error: --city is required for transit route planning.');
    process.exit(1);
  }
  const params = { origin: args.origin, destination: args.destination, city: args.city };
  if (args.strategy) params.strategy = args.strategy;
  if (args.nightflag) params.nightflag = args.nightflag;

  const data = await apiRequest(ENDPOINTS.transit, params);
  const transits = (data.route?.transits || []).slice(0, 5).map(t => ({
    duration: formatDuration(t.duration),
    duration_s: parseInt(t.duration, 10),
    cost: t.cost || '0',
    walking_distance: formatDistance(t.walking_distance || '0'),
    walking_distance_m: parseInt(t.walking_distance || '0', 10),
    segments: (t.segments || []).map(seg => {
      if (seg.bus?.buslines?.[0]) {
        const line = seg.bus.buslines[0];
        return { type: 'bus', name: line.name, departure_stop: line.departure_stop?.name, arrival_stop: line.arrival_stop?.name };
      }
      if (seg.railway) {
        return { type: 'railway', name: seg.railway.name || 'railway' };
      }
      if (seg.walking) {
        return { type: 'walking', distance: formatDistance(seg.walking.distance || '0') };
      }
      return { type: 'unknown' };
    })
  }));
  return { status: 'success', type: 'transit', origin: args.origin, destination: args.destination, city: args.city, transits };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!args.type) {
    console.error('Error: --type is required (walking, driving, riding, transit). Use --help for usage.');
    process.exit(1);
  }
  if (!args.origin || !args.destination) {
    console.error('Error: --origin and --destination are required. Use --help for usage.');
    process.exit(1);
  }
  if (!ENDPOINTS[args.type]) {
    console.error(`Error: Unknown route type "${args.type}". Supported: walking, driving, riding, transit`);
    process.exit(1);
  }

  try {
    let result;
    switch (args.type) {
      case 'walking':  result = await planWalking(args); break;
      case 'driving':  result = await planDriving(args); break;
      case 'riding':   result = await planRiding(args); break;
      case 'transit':  result = await planTransit(args); break;
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ error: err.message }, null, 2));
    process.exit(1);
  }
}

main();
