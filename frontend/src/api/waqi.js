const token = import.meta.env.VITE_WAQI_TOKEN;

const notFoundMessage =
  'No air quality data found for this location. Try a nearby bigger city.';

const CITY_ALIASES = [
  { pattern: /\bahemdabad\b/gi, replacement: 'Ahmedabad' },
  { pattern: /\bahmadabad\b/gi, replacement: 'Ahmedabad' },
  { pattern: /\bamdavad\b/gi, replacement: 'Ahmedabad' },
  { pattern: /\bbaroda\b/gi, replacement: 'Vadodara' }
];

function requireToken() {
  if (!token) {
    throw new Error('Missing VITE_WAQI_TOKEN in frontend/.env');
  }
}

function normalizeCityName(cityName) {
  return CITY_ALIASES.reduce(
    (normalized, alias) => normalized.replace(alias.pattern, alias.replacement),
    cityName.trim()
  );
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildLocationQueries(cityName) {
  const trimmed = normalizeCityName(cityName);
  const lower = trimmed.toLowerCase();

  if (lower.includes('india')) {
    return [trimmed];
  }

  if (lower.includes('gujarat')) {
    return uniqueValues([trimmed, `${trimmed}, India`]);
  }

  return uniqueValues([
    `${trimmed}, India`,
    `${trimmed}, Gujarat, India`,
    `${trimmed}, Gujarat`
  ]);
}

async function fetchNominatimLocations(query, limit = 5) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=${limit}&countrycodes=in&addressdetails=1`,
    { headers: { 'User-Agent': 'EcoSenseAI/1.0' } }
  );
  const data = await response.json();

  return Array.isArray(data) ? data : [];
}

function isGujaratLocation(result) {
  const displayName = result.displayName || result.display_name || '';
  return (
    displayName.toLowerCase().includes('gujarat') ||
    result.address?.state?.toLowerCase() === 'gujarat'
  );
}

function toLocation(result, searchedName) {
  return {
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    displayName: result.display_name,
    searchedName
  };
}

export async function getLocations(cityName) {
  const normalizedCityName = normalizeCityName(cityName);
  const seen = new Set();
  const locations = [];

  for (const query of buildLocationQueries(normalizedCityName)) {
    const results = await fetchNominatimLocations(query);

    for (const result of results) {
      const key = `${result.lat},${result.lon}`;
      if (!result.lat || !result.lon || seen.has(key)) continue;

      seen.add(key);
      locations.push(toLocation(result, normalizedCityName));
    }

    const hasGoodMatch = locations.some((location) => {
      const display = location.displayName.toLowerCase();
      return display.includes(normalizedCityName.split(',')[0].trim().toLowerCase());
    });

    if (hasGoodMatch) {
      break;
    }
  }

  const lowerInput = normalizedCityName.toLowerCase();
  if (lowerInput.includes('gujarat') || !lowerInput.includes(',')) {
    locations.sort((a, b) => Number(isGujaratLocation(b)) - Number(isGujaratLocation(a)));
  }

  return locations;
}

export async function getLocation(cityName) {
  const locations = await getLocations(cityName);
  return locations[0] || null;
}

export async function getNearestAirQuality(lat, lon) {
  requireToken();

  const response = await fetch(
    `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`
  );
  const data = await response.json();

  if (data.status === 'ok' && data.data) {
    const stationGeo = data.data.city?.geo || [lat, lon];
    const co = data.data.iaqi.co?.v || 0;

    return {
      pm25: data.data.iaqi.pm25?.v || 0,
      pm10: data.data.iaqi.pm10?.v || 0,
      no2: data.data.iaqi.no2?.v || 0,
      co,
      co2: co,
      aqi: data.data.aqi,
      stationName: data.data.city?.name || 'Nearest monitoring station',
      stationLat: stationGeo[0],
      stationLon: stationGeo[1],
      source: 'waqi'
    };
  }

  return null;
}

export async function fetchAirQuality(cityName) {
  const searchedCityName = normalizeCityName(cityName);
  const location = await getLocation(searchedCityName);

  if (!location) {
    return null;
  }

  const airData = await getNearestAirQuality(location.lat, location.lon);

  if (!airData) {
    return {
      pm25: 0,
      pm10: 0,
      no2: 0,
      co: 0,
      co2: 0,
      aqi: 0,
      stationName: 'No nearby monitoring station found',
      source: 'location',
      locationOnly: true,
      lat: location.lat,
      lon: location.lon,
      cityName: searchedCityName,
      displayName: location.displayName
    };
  }

  return {
    ...airData,
    lat: location.lat,
    lon: location.lon,
    cityName: searchedCityName,
    displayName: location.displayName
  };
}

export async function searchCity(query) {
  const normalizedQuery = normalizeCityName(query);
  const locations = await getLocations(normalizedQuery);

  if (locations.length === 0) {
    return [];
  }

  return locations.slice(0, 8).map((location) => ({
    uid: `nominatim-${location.lat}-${location.lon}`,
    cityName: location.displayName || location.searchedName || normalizedQuery,
    displayName: location.displayName,
    lat: location.lat,
    lon: location.lon
  }));
}

export function getSearchResultName(result) {
  return result?.cityName || result?.displayName || '';
}

export function getSearchResultFeed(result) {
  return result?.cityName || result?.displayName || '';
}

export { notFoundMessage };
