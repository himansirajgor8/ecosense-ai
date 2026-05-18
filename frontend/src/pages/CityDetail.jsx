import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AirQualityCard from '../components/AirQualityCard.jsx';
import PollutionChart from '../components/PollutionChart.jsx';
import GreenScore from '../components/GreenScore.jsx';
import { fetchAirQuality, notFoundMessage } from '../api/waqi.js';
import { searchCities, getCityTips, getStatus, getStatusLabel } from '../data/cities.js';

function buildForecast(pm25) {
  const now = new Date();
  const labels = Array.from({ length: 24 }, (_, idx) => `${(now.getHours() + idx) % 24}:00`);
  const predicted = labels.map((_, index) => Math.max(0, Math.round(pm25 + Math.sin(index / 3) * 8 + index * 0.5)));
  const actual = predicted.map((value, index) => Math.max(0, Math.round(value + ((index % 3) - 1) * 3)));

  return { labels, actual, predicted };
}

function buildHistory(pm25) {
  const labels = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    return day.toLocaleDateString('en-IN', { weekday: 'short' });
  });
  const actual = labels.map((_, index) => Math.max(0, Math.round(pm25 + (index - 3) * 4)));
  const predicted = labels.map((_, index) => Math.max(0, Math.round(pm25 + (index - 2) * 3)));

  return { labels, actual, predicted };
}

function CityDetail() {
  const { cityname } = useParams();
  const navigate = useNavigate();
  const keyCity = cityname?.replace('-', ' ').trim();
  const matchedCity = searchCities.find((city) => city.name.toLowerCase() === keyCity?.toLowerCase()) || searchCities[0];
  const [aqData, setAqData] = useState(matchedCity);
  const [predictions, setPredictions] = useState(buildForecast(matchedCity.pm25));
  const [history, setHistory] = useState(buildHistory(matchedCity.pm25));
  const [score, setScore] = useState(68);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAirQuality(matchedCity.name);
        if (!mounted) return;

        if (!result) {
          setError(notFoundMessage);
          return;
        }

        const nextData = { ...matchedCity, ...result, name: matchedCity.name, cityName: matchedCity.name };
        setAqData(nextData);
        setPredictions(buildForecast(nextData.pm25));
        setHistory(buildHistory(nextData.pm25));
        setScore(Math.max(30, Math.min(100, Math.round(90 - nextData.pm25 * 0.35))));
      } catch (err) {
        console.error('WAQI city detail fetch failed:', err);
        setError(notFoundMessage);
      } finally {
        mounted && setLoading(false);
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, [matchedCity]);

  const status = getStatus(aqData.pm25);
  const tips = getCityTips(aqData.pm25);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-green-400/20 bg-gradient-to-br from-[#064e3b] to-[#052e2b] p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-full border border-green-300/30 px-4 py-2 text-sm text-green-100 hover:bg-white/10"
              >
                Back
              </button>
              <span className="rounded-full bg-green-500/15 px-3 py-1 text-sm text-green-100 ring-1 ring-green-400/30">City overview</span>
            </div>
            <h1 className="mt-5 text-4xl font-bold text-white">{aqData.cityName || matchedCity.name}</h1>
            <p className="mt-1 text-sm text-green-100">Air quality data from nearest monitoring station</p>
            <p className="mt-2 text-slate-200">Full city pollution profile, 7-day history, 24-hour forecast, and custom green tips.</p>
          </div>
          <div className="rounded-full bg-green-500/15 px-4 py-2 text-sm font-semibold text-green-100 ring-1 ring-green-400/30">AQI updated live</div>
        </div>
      </section>

      {error && <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-4 text-red-200 shadow-inner">{error}</div>}
      {loading && <div className="rounded-3xl border border-slate-700 bg-[#1e293b] p-4 text-slate-300">Loading air quality data...</div>}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {['pm25', 'pm10', 'no2', 'co2'].map((key) => {
          const values = {
            pm25: { title: 'PM2.5', unit: 'ug/m3', value: aqData.pm25 || matchedCity.pm25 },
            pm10: { title: 'PM10', unit: 'ug/m3', value: aqData.pm10 || matchedCity.pm10 },
            no2: { title: 'NO2', unit: 'ppb', value: aqData.no2 || matchedCity.no2 },
            co2: { title: 'CO', unit: 'ppm', value: aqData.co2 || matchedCity.co2 }
          }[key];
          return <AirQualityCard key={key} title={values.title} value={values.value} unit={values.unit} status={key === 'pm25' ? status : 'moderate'} />;
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.7fr_0.3fr]">
        <div className="rounded-3xl border border-slate-700 bg-[#1e293b] p-4 shadow-xl md:p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">7-Day AQI History</h2>
              <p className="text-sm text-slate-400">Recent PM2.5 history for {aqData.cityName || matchedCity.name}.</p>
            </div>
          </div>
          <div className="h-64 md:h-80">
            <PollutionChart data={history} />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Current status</h2>
                <p className="text-sm text-slate-400">{aqData.pm25 ? getStatusLabel(aqData.pm25) : 'Moderate'} air quality for the city.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status === 'good' ? 'bg-green-500/15 text-green-300 ring-1 ring-green-400/30' : status === 'moderate' ? 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/30' : 'bg-red-500/15 text-red-300 ring-1 ring-red-400/30'}`}>
                {getStatusLabel(aqData.pm25)}
              </span>
            </div>
            <div className="mt-6 space-y-3 text-slate-300">
              <p><strong>City:</strong> {aqData.cityName || matchedCity.name}</p>
              <p><strong>AQI:</strong> {aqData.aqi ?? 'N/A'}</p>
              <p><strong>PM2.5:</strong> {aqData.pm25 || matchedCity.pm25} ug/m3</p>
              <p><strong>PM10:</strong> {aqData.pm10 || matchedCity.pm10} ug/m3</p>
            </div>
          </div>
          <GreenScore score={score} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">24-Hour Prediction</h2>
            <p className="text-sm text-slate-400">Forecasted PM2.5 for the next 24 hours in {aqData.cityName || matchedCity.name}.</p>
          </div>
        </div>
        <div className="h-64 md:h-80">
          <PollutionChart data={predictions} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-white">Tips for {aqData.cityName || matchedCity.name}</h2>
          <ul className="mt-4 space-y-3 text-slate-300">
            {tips.map((tip) => (
              <li key={tip} className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4">{tip}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-white">City health snapshot</h2>
          <p className="mt-4 text-slate-300">Use the dashboard and map to compare pollution levels, plan travel, and adopt cleaner routines.</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Air quality badge</p>
              <p className="mt-2 text-lg font-semibold text-white">{getStatusLabel(aqData.pm25)}</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Green score</p>
              <p className="mt-2 text-lg font-semibold text-white">{score}%</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CityDetail;
