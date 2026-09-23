// api/weather-maintenance.js
// ─────────────────────────────────────────────────────────────────────────
// CasaCEO weather-triggered maintenance — Vercel serverless function.
//
// "Weather TRIGGERS maintenance" — the on-thesis maintenance feature from the
// handoffs: a freeze warning says "check your pipes," a heat wave says "service
// the AC," a wind/storm says "look at the roof and gutters." This is pure SEE,
// not DO: it surfaces what the coming week's weather implies for the home so the
// owner can act. It books nothing, dispatches no one, stores nothing.
//
// Flow:
//   1. Take a US ZIP (preferred) or lat/lng from the query string.
//   2. Geocode the ZIP via Open-Meteo's free geocoder (no API key).
//   3. Pull a 7-day forecast from Open-Meteo (no API key, no cost).
//   4. Derive a small set of maintenance triggers from the forecast extremes.
//   5. Return { location, triggers[] } as JSON. On any failure, fail SOFT —
//      return an empty triggers array so the page simply shows nothing rather
//      than an error. Weather is a bonus signal, never load-bearing.
//
// No secrets, no env vars: Open-Meteo is keyless. This function is safe to call
// from the browser directly (GET /api/weather-maintenance?zip=30301).
// ─────────────────────────────────────────────────────────────────────────

// ── Geocode a US ZIP to lat/lng + a readable place name ──────────────────
async function geocodeZip(zip) {
  const url =
    'https://geocoding-api.open-meteo.com/v1/search' +
    '?name=' + encodeURIComponent(zip) +
    '&count=1&language=en&format=json&country=US';
  const r = await fetch(url);
  if (!r.ok) return null;
  const data = await r.json();
  const hit = data && data.results && data.results[0];
  if (!hit) return null;
  return {
    lat: hit.latitude,
    lng: hit.longitude,
    place: [hit.name, hit.admin1].filter(Boolean).join(', '),
  };
}

// ── Pull a 7-day forecast (daily extremes + wind + precip) ───────────────
async function fetchForecast(lat, lng) {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=' + lat +
    '&longitude=' + lng +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,' +
    'wind_speed_10m_max,wind_gusts_10m_max' +
    '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch' +
    '&timezone=auto&forecast_days=7';
  const r = await fetch(url);
  if (!r.ok) return null;
  return r.json();
}

// ── Derive maintenance triggers from the week's extremes ─────────────────
// Each trigger is a SEE prompt: a plain-language heads-up tied to a maintenance
// category the user already understands. Thresholds are first-guesses, easy to
// tune. We surface at most a handful so the strip stays calm, never alarmist.
function deriveTriggers(daily) {
  if (!daily || !Array.isArray(daily.time)) return [];

  const days = daily.time.map((date, i) => ({
    date,
    hi: daily.temperature_2m_max?.[i],
    lo: daily.temperature_2m_min?.[i],
    rain: daily.precipitation_sum?.[i],
    wind: daily.wind_speed_10m_max?.[i],
    gust: daily.wind_gusts_10m_max?.[i],
  }));

  const triggers = [];
  const fmt = (d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  // Hard freeze — pipes, insulation, outdoor faucets.
  const freeze = days.filter((d) => typeof d.lo === 'number' && d.lo <= 32);
  if (freeze.length) {
    const coldest = freeze.reduce((a, b) => (b.lo < a.lo ? b : a));
    triggers.push({
      key: 'freeze',
      severity: coldest.lo <= 20 ? 'high' : 'medium',
      category: 'Plumbing',
      title: 'Freeze coming — protect your pipes',
      detail:
        'Lows near ' + Math.round(coldest.lo) + '°F on ' + fmt(coldest.date) +
        '. Insulate exposed pipes, disconnect garden hoses, and let a faucet drip on the coldest nights.',
    });
  }

  // Heat wave — AC service, refrigerant, attic ventilation.
  const heat = days.filter((d) => typeof d.hi === 'number' && d.hi >= 95);
  if (heat.length) {
    const hottest = heat.reduce((a, b) => (b.hi > a.hi ? b : a));
    triggers.push({
      key: 'heat',
      severity: hottest.hi >= 100 ? 'high' : 'medium',
      category: 'HVAC',
      title: 'Heat wave ahead — check your cooling',
      detail:
        'Highs near ' + Math.round(hottest.hi) + '°F on ' + fmt(hottest.date) +
        '. Replace the AC filter and clear debris from the outdoor condenser so the system can keep up.',
    });
  }

  // High wind / storm — roof, gutters, loose exterior.
  const windy = days.filter(
    (d) => (typeof d.gust === 'number' && d.gust >= 45) ||
           (typeof d.wind === 'number' && d.wind >= 35)
  );
  if (windy.length) {
    const worst = windy.reduce((a, b) => ((b.gust || 0) > (a.gust || 0) ? b : a));
    triggers.push({
      key: 'wind',
      severity: (worst.gust || 0) >= 60 ? 'high' : 'medium',
      category: 'Roofing',
      title: 'Strong winds expected — secure the exterior',
      detail:
        'Gusts near ' + Math.round(worst.gust || worst.wind) + ' mph on ' +
        fmt(worst.date) +
        '. Check the roof for loose shingles, clear gutters, and bring in or tie down anything that can blow around.',
    });
  }

  // Heavy rain — drainage, gutters, grading, sump pump.
  const wet = days.filter((d) => typeof d.rain === 'number' && d.rain >= 1.5);
  if (wet.length) {
    const total = wet.reduce((s, d) => s + d.rain, 0);
    triggers.push({
      key: 'rain',
      severity: total >= 4 ? 'high' : 'medium',
      category: 'Exterior',
      title: 'Heavy rain in the forecast — check drainage',
      detail:
        'About ' + total.toFixed(1) + '" of rain expected this week. Make sure ' +
        'gutters and downspouts are clear and water drains away from the foundation.',
    });
  }

  return triggers;
}

export default async function handler(req, res) {
  // CORS / method guard — simple GET only.
  if (req.method !== 'GET') {
    res.status(405).json({ triggers: [] });
    return;
  }

  try {
    const q = req.query || {};
    let lat = q.lat ? parseFloat(q.lat) : null;
    let lng = q.lng ? parseFloat(q.lng) : null;
    let place = q.place || '';

    // Prefer explicit lat/lng; otherwise geocode the ZIP.
    if ((lat == null || Number.isNaN(lat)) && q.zip) {
      const geo = await geocodeZip(String(q.zip).trim());
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
        place = place || geo.place;
      }
    }

    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
      // No usable location — fail soft.
      res.status(200).json({ location: null, triggers: [] });
      return;
    }

    const forecast = await fetchForecast(lat, lng);
    const triggers = deriveTriggers(forecast && forecast.daily);

    // Cache at the edge for an hour — weather doesn't change minute to minute,
    // and this keeps us courteous to the free Open-Meteo service.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({
      location: { lat, lng, place: place || null },
      triggers,
    });
  } catch (e) {
    // Fail soft — the maintenance page treats an empty list as "no alerts."
    res.status(200).json({ location: null, triggers: [], error: String(e).slice(0, 200) });
  }
}
