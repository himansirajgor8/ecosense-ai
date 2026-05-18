function AirQualityCard({ title, value, unit, status }) {
  const statusStyles = {
    good: { label: 'Good', color: 'bg-green-500/15 text-green-300 ring-1 ring-green-400/30' },
    moderate: { label: 'Moderate', color: 'bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-400/30' },
    bad: { label: 'Danger', color: 'bg-red-500/15 text-red-300 ring-1 ring-red-400/30' }
  }[status] || { label: 'Unknown', color: 'bg-slate-700 text-slate-200' };

  return (
    <div className="rounded-3xl border border-slate-700 bg-[#1e293b] p-4 shadow-lg transition hover:-translate-y-0.5 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-white md:text-lg">{title}</h3>
        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold md:px-3 md:text-sm ${statusStyles.color}`}>{statusStyles.label}</span>
      </div>
      <div className="mt-6 flex items-baseline gap-2 md:mt-8">
        <span className="text-3xl font-bold text-white md:text-4xl">{value}</span>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

export default AirQualityCard;
