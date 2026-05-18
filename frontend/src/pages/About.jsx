const teamMembers = [
  {
    avatar: 'DEV',
    name: 'Himansi Rajgor',
    role: 'Frontend & AI Developer',
    university: 'Parul University'
  },
  {
    avatar: 'DEV',
    name: '(teammate name here)',
    role: 'Backend & Data Developer',
    university: 'Parul University'
  }
];

const techStack = [
  'React.js',
  'Python Flask',
  'WAQI API',
  'Gemini AI',
  'Leaflet Maps',
  'Recharts',
  'Tailwind CSS',
  'Nominatim API'
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
        <p className="mt-4 text-lg font-medium text-green-100 md:text-xl">Built for Environment Hackathon 2026</p>
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
              <p className="mt-2 text-slate-300">{member.university}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-green-400/20 bg-green-500/10 p-6 shadow-lg md:p-8">
        <h2 className="text-2xl font-bold text-green-300 md:text-3xl">Environment Hackathon 2026</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 text-base font-medium text-slate-300 md:grid-cols-2 md:text-lg">
          <p>Parul University, Gujarat</p>
          <p>Theme: Designing Sustainable Futures in a Digital Age</p>
          <p>Finals: Geneva, Switzerland</p>
          <p>November 6-9, 2026</p>
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
          <p>SPOC: Himansi Rajgor</p>
          <p>Phone: 6354847928</p>
          <p>Organized by: Technical Events Cell & Centre for Sustainability & ESG</p>
        </div>
      </section>
    </div>
  );
}

export default About;
