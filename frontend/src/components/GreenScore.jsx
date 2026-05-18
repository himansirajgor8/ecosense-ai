import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function GreenScore({ score }) {
  const color = score > 70 ? '#16a34a' : score > 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Green Score</h2>
          <p className="mt-2 text-sm text-slate-400">Community health score based on AQI, time, and recycling rate.</p>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="w-44">
          <CircularProgressbar
            value={score}
            text={`${score}%`}
            styles={buildStyles({ pathColor: color, textColor: '#ffffff', trailColor: '#334155' })}
          />
        </div>
        <div className="space-y-3 text-slate-300">
          <p>Lower pollution and strong recycling habits help increase the score.</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• Keep outdoor burning minimal.</li>
            <li>• Use public transport during peak hours.</li>
            <li>• Separate waste into recycle and compost bins.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GreenScore;
