import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from 'recharts';

function PollutionChart({ data }) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    actual: data.actual[index],
    predicted: data.predicted[index]
  }));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white md:text-2xl">Pollution Trend</h2>
          <p className="text-sm text-slate-400">7-day PM2.5 actual vs predicted overview.</p>
        </div>
      </div>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: '#cbd5e1' }} />
            <YAxis tick={{ fill: '#cbd5e1' }} />
            <Tooltip contentStyle={{ background: '#020617', border: '1px solid #334155', color: '#fff' }} />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PollutionChart;
