import { useEffect, useRef, useState } from 'react';
import AirQualityCard from '../components/AirQualityCard.jsx';
import GreenScore from '../components/GreenScore.jsx';
import PollutionChart from '../components/PollutionChart.jsx';
import MapView from '../components/MapView.jsx';
import {
  fetchAirQuality,
  getSearchResultFeed,
  getSearchResultName,
  notFoundMessage,
  searchCity
} from '../api/waqi.js';

function buildTrend(pm25) {
  const now = new Date();
  const hour = now.getHours();
  const labels = Array.from({ length: 7 }, (_, index) => `${(hour + index) % 24}:00`);
  const actual = labels.map((_, index) => Math.max(0, Math.round(pm25 + ((index % 3) - 1) * 4)));
  const predicted = labels.map((_, index) => Math.max(0, Math.round(pm25 + (index - 3) * 2)));

  return { labels, actual, predicted };
}

function getPollutionStatus(value) {
  if (value <= 75) return 'good';
  if (value <= 150) return 'moderate';
  return 'bad';
}

function Monitor() {
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [trendData, setTrendData] = useState(buildTrend(0));
  const [score, setScore] = useState(72);
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [searchQuery, setSearchQuery] = useState('Delhi');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchTimeout = useRef(null);
  const selectedFeedRef = useRef('Delhi');

  const loadCityAirQuality = async (cityFeed, fallbackName = cityFeed) => {
    selectedFeedRef.current = cityFeed;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAirQuality(cityFeed);

      if (!data) {
        setError(notFoundMessage);
        return;
      }

      setAirQuality(data);
      setSelectedCity(fallbackName);
      setSearchQuery(fallbackName);
      setTrendData(buildTrend(data.pm25));
      setScore(Math.max(30, Math.min(100, Math.round(90 - data.pm25 * 0.35))));
      if (data.locationOnly) {
        setError('Location found, but no nearby WAQI monitoring station data is available.');
      }
    } catch (err) {
      console.error('WAQI air quality fetch failed:', err);
      setError(notFoundMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCityAirQuality('Delhi');

    const interval = setInterval(() => {
      loadCityAirQuality(selectedFeedRef.current || 'Delhi');
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length < 2 || query === selectedCity) {
      setSuggestions([]);
      setSearching(false);
      return undefined;
    }

    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchCity(query);
        setSuggestions(results.filter((result) => getSearchResultName(result)).slice(0, 8));
      } catch (err) {
        console.error('WAQI city search failed:', err);
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, selectedCity]);

  const handleSelectResult = (result) => {
    const name = getSearchResultName(result);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    loadCityAirQuality(getSearchResultFeed(result), name);
  };

  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const selectedResult = suggestions[selectedSuggestionIndex] || suggestions[0];
      if (selectedResult) {
        handleSelectResult(selectedResult);
        return;
      }

      const query = searchQuery.trim();
      if (query) {
        setSuggestions([]);
        loadCityAirQuality(query);
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedSuggestionIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedSuggestionIndex((prev) => Math.max(prev - 1, -1));
    } else if (event.key === 'Escape') {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }
  };

  const cardValues = {
    pm25: { title: 'PM2.5', unit: 'ug/m3', value: airQuality?.pm25 ?? 0 },
    pm10: { title: 'PM10', unit: 'ug/m3', value: airQuality?.pm10 ?? 0 },
    no2: { title: 'NO2', unit: 'ppb', value: airQuality?.no2 ?? 0 },
    co2: { title: 'CO', unit: 'ppm', value: airQuality?.co2 ?? 400 }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-green-400/20 bg-gradient-to-br from-[#064e3b] to-[#052e2b] p-5 text-white shadow-xl md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-green-200">City Dashboard</p>
            <h1 className="mt-3 text-3xl font-bold text-white">{selectedCity}</h1>
            <p className="mt-1 text-sm text-green-100">Air quality data from nearest monitoring station</p>
            <p className="mt-2 text-slate-200">Live WAQI air quality cards, pollution trend chart, and interactive city map.</p>
          </div>
          <div className="flex w-full flex-col items-start gap-3 md:w-auto md:items-end">
            <div className="relative w-full md:max-w-sm">
              <label htmlFor="city-input" className="block text-sm font-medium text-green-100 mb-1">Search City:</label>
              <div className="relative">
                <input
                  id="city-input"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSelectedSuggestionIndex(-1);
                    setError(null);
                  }}
                  onKeyDown={handleSearchSubmit}
                  onBlur={() => setTimeout(() => { setSuggestions([]); setSelectedSuggestionIndex(-1); }, 150)}
                  placeholder="Enter any city..."
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  autoComplete="off"
                  className="w-full rounded-xl border border-green-300/30 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              {searching && (
                <div className="mt-2 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                  Searching cities...
                </div>
              )}
              {error && (
                <div className="mt-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-lg">
                  {suggestions.map((result, index) => {
                    const name = getSearchResultName(result);
                    return (
                      <button
                        type="button"
                        key={`${result.uid}-${name}`}
                        onMouseDown={() => handleSelectResult(result)}
                        className={`w-full cursor-pointer px-4 py-3 text-left text-sm hover:bg-slate-800 ${index === selectedSuggestionIndex ? 'bg-green-500/20' : ''}`}
                      >
                        <span className="block font-medium text-white">{name}</span>
                        <span className="block truncate text-xs text-slate-400">{result.displayName}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="rounded-full bg-green-500/15 px-4 py-2 text-sm font-semibold text-green-200 ring-1 ring-green-400/30">Updated every 60 seconds</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {['pm25', 'pm10', 'no2', 'co2'].map((key) => {
          const values = cardValues[key];
          return (
            <AirQualityCard
              key={key}
              title={values.title}
              value={values.value}
              unit={values.unit}
              status={getPollutionStatus(values.value)}
            />
          );
        })}
      </section>

      {loading && <div className="rounded-3xl border border-slate-700 bg-[#1e293b] p-4 text-slate-300">Loading air quality data...</div>}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.65fr_0.35fr]">
        <div className="rounded-3xl border border-slate-700 bg-[#1e293b] p-4 shadow-xl md:p-6">
          <PollutionChart data={trendData} />
        </div>
        <GreenScore score={score} />
      </section>

      <section className="rounded-3xl border border-slate-700 bg-[#1e293b] p-4 shadow-xl md:p-6">
        <MapView airQuality={airQuality} selectedCity={selectedCity} />
      </section>
    </div>
  );
}

export default Monitor;
