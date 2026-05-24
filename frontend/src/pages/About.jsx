const teamMembers = [
  {
    avatar: '\u{1F916}',
    name: 'Rushil Parmar',
    role: 'AI & Backend Developer',
    description:
      'AI student passionate about machine learning, data engineering, and building intelligent backend systems.'
  },
  {
    avatar: '\u{1F510}',
    name: 'Himansi Rajgor',
    role: 'Cybersecurity & Frontend Developer',
    description:
      'Cybersecurity student who applied threat intelligence and anomaly detection concepts to environmental monitoring, combined with frontend development.'
  }
];

const techStack = [
  'React.js',
  'Python Flask',
  'WAQI API',
  'Groq AI',
  'Leaflet Maps',
  'Recharts',
  'Tailwind CSS',
  'Nominatim API',
  'Vercel',
  'Render.com'
];

function About() {
  return (
    <div className="space-y-8">
      <section
        className="rounded-3xl border border-green-400/20 p-6 text-white shadow-xl md:p-12"
        style={{ background: 'linear-gradient(135deg, #064e3b, #052e2b)' }}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-100">EcoSense AI</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">About EcoSense AI</h1>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl md:p-8">
        <h2 className="text-2xl font-bold text-green-300 md:text-3xl">Our Mission</h2>
        <p className="mt-4 max-w-5xl text-base leading-7 text-slate-300 md:text-lg md:leading-8">
          To make real-time air quality data accessible to every citizen of India, from big cities to small villages,
          and help communities make better environmental decisions.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-green-300 md:text-3xl">Team</h2>
        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          {teamMembers.map((member) => (
            <div key={member.role} className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-lg transition hover:border-green-500 hover:shadow-xl md:p-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/15 text-sm font-bold text-green-200 ring-1 ring-green-400/30">{member.avatar}</div>
              <h3 className="mt-5 text-2xl font-bold text-white">{member.name}</h3>
              <p className="mt-2 text-lg font-semibold text-green-300">{member.role}</p>
              <p className="mt-3 leading-7 text-slate-300">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl md:p-8">
        <h2 className="text-2xl font-bold text-green-300 md:text-3xl">Technology Stack</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {techStack.map((technology) => (
            <span key={technology} className="rounded-full bg-green-500/15 px-4 py-2 text-sm font-semibold text-green-200 ring-1 ring-green-400/30 md:px-5">
              {technology}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl md:p-8">
        <h2 className="text-2xl font-bold text-green-300 md:text-3xl">Contact</h2>
        <div className="mt-5 space-y-3 break-words text-base font-medium text-slate-300 md:text-lg">
          <p className="font-semibold text-white">Team Contact:</p>
          <p>{'\u{1F464}'} Himansi Rajgor</p>
          <p>{'\u{1F4DE}'} 6354847928</p>
          <p>{'\u{1F4E7}'} himansirajgor616@gmail.com</p>
          <p className="pt-3 font-semibold text-white">Organized by:</p>
          <p>Parul University</p>
        </div>
      </section>
    </div>
  );
}

export default About;
