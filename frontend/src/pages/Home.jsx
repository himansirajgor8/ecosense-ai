import { useNavigate } from 'react-router-dom';
import { majorCities, getStatus, getStatusLabel } from '../data/cities.js';

const features = [
  { icon: 'AQI', title: 'Live AQI Tracking', description: 'Monitor PM2.5, PM10, NO2, and CO2 in real time.' },
  { icon: 'AI', title: 'Pollution Forecast', description: 'See predicted PM2.5 trends for the next 24 hours.' },
  { icon: 'REC', title: 'Waste Scanner', description: 'Identify recyclable items with image recognition.' }
];

function Home() {
  const navigate = useNavigate();
  const getPm25Color = (pm25) => {
    if (pm25 < 50) return 'text-emerald-300';
    if (pm25 <= 100) return 'text-orange-500';
    return 'text-red-300';
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-green-400/20 p-6 text-white shadow-xl md:p-12" style={{ background: 'linear-gradient(135deg, #064e3b, #052e2b)' }}>
        <div className="max-w-4xl">
          <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-sm font-semibold text-green-50 ring-1 ring-white/25">EcoSense AI</span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">Smart Community Environmental Monitor</h1>
          <p className="mt-5 max-w-3xl text-base text-green-100 sm:text-lg">Real-time air quality insights, pollution forecasts, and waste sorting assistance in one modern dashboard.</p>
          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <button
              onClick={() => navigate('/monitor')}
              className="inline-flex w-full items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-500 md:w-auto"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/waste-scan')}
              className="inline-flex w-full items-center justify-center rounded-full border border-white/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 md:w-auto"
            >
              Try Waste Scanner
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-lg transition hover:-translate-y-0.5 hover:border-green-500 hover:shadow-xl md:p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/15 text-sm font-bold text-green-200 ring-1 ring-green-400/30">{feature.icon}</div>
            <h2 className="mt-5 text-xl font-semibold text-green-300 md:text-2xl">{feature.title}</h2>
            <p className="mt-3 text-slate-300">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-lg md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-green-300">Major Indian Cities</h2>
            <p className="mt-2 text-slate-300">Explore city-specific dashboards for eight important urban centers.</p>
          </div>
          <button
            onClick={() => navigate('/monitor')}
            className="w-full rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 md:w-auto"
          >
            View full monitor
          </button>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {majorCities.map((city) => {
            const status = getStatus(city.pm25);
            return (
              <button
                key={city.name}
                onClick={() => navigate(`/city/${city.name}`)}
                className="group rounded-3xl border border-slate-700 bg-slate-950/40 p-5 text-left transition hover:-translate-y-0.5 hover:border-green-500 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{city.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{city.country}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status === 'good' ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30' : status === 'moderate' ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30' : 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'}`}>
                    {getStatusLabel(city.pm25)}
                  </span>
                </div>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className={`text-4xl font-bold ${getPm25Color(city.pm25)}`}>{city.pm25}</p>
                    <p className="text-sm text-slate-400">PM2.5</p>
                  </div>
                  <span className="w-fit rounded-full bg-green-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition group-hover:bg-green-700">Tap for details</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-lg md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-green-300">Why EcoSense AI?</h2>
            <p className="mt-4 text-slate-300">Use air quality data, machine learning predictions, and waste classification to build a greener community. Designed with clean analytics and responsive UI for citizens, schools, and local groups.</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-5">
              <h3 className="font-semibold text-white">Live monitor</h3>
              <p className="mt-2 text-slate-300">Auto-refresh air quality cards and map markers every minute.</p>
            </div>
            <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-5">
              <h3 className="font-semibold text-white">Prediction engine</h3>
              <p className="mt-2 text-slate-300">Get 24-hour PM2.5 forecasts from the backend model.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
