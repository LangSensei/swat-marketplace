#!/usr/bin/env node
// weather.js — Amap weather query by city
// Usage:
//   node weather.js --city=beijing
//   node weather.js --city=110000 --forecast
//   node weather.js --help

const { apiRequest, parseArgs } = require('./lib/env.js');

const API_URL = 'https://restapi.amap.com/v3/weather/weatherInfo';

const HELP = `
Amap Weather — query live weather or forecast by city

Usage:
  node weather.js --city=<name|adcode> [options]

Required:
  --city=<name|adcode>    City name or administrative area code (adcode)
                          Examples: "beijing", "110000", "shanghai"

Optional:
  --forecast              Get 3-day forecast instead of live weather

Output:
  JSON object with weather data to stdout

  Live weather returns: province, city, weather, temperature, wind, humidity, report time
  Forecast returns: province, city, and casts array with day/night weather for each day

Examples:
  node weather.js --city=beijing
  node weather.js --city=110000
  node weather.js --city=shanghai --forecast
`.trim();

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!args.city) {
    console.error('Error: --city is required. Use --help for usage.');
    process.exit(1);
  }

  const params = {
    city: args.city,
    extensions: args.forecast ? 'all' : 'base'
  };

  try {
    const data = await apiRequest(API_URL, params);
    let result;

    if (args.forecast) {
      const forecast = (data.forecasts || [])[0] || {};
      result = {
        status: 'success',
        type: 'forecast',
        province: forecast.province,
        city: forecast.city,
        adcode: forecast.adcode,
        report_time: forecast.reporttime,
        casts: (forecast.casts || []).map(c => ({
          date: c.date,
          week: c.week,
          day_weather: c.dayweather,
          night_weather: c.nightweather,
          day_temp: c.daytemp,
          night_temp: c.nighttemp,
          day_wind: c.daywind,
          night_wind: c.nightwind,
          day_wind_power: c.daypower,
          night_wind_power: c.nightpower
        }))
      };
    } else {
      const live = (data.lives || [])[0] || {};
      result = {
        status: 'success',
        type: 'live',
        province: live.province,
        city: live.city,
        adcode: live.adcode,
        weather: live.weather,
        temperature: live.temperature,
        wind_direction: live.winddirection,
        wind_power: live.windpower,
        humidity: live.humidity,
        report_time: live.reporttime
      };
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ error: err.message }, null, 2));
    process.exit(1);
  }
}

main();
