import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Monitor', to: '/monitor' },
  { label: 'Waste Scan', to: '/waste-scan' },
  { label: 'Threat Monitor', to: '/threat-monitor' },
  { label: 'About', to: '/about' }
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-700 bg-[#1e293b] shadow-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-green-300">EcoSense AI</div>
            <div className="text-sm text-slate-400">Smart Community Environmental Monitor</div>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-xl leading-none text-white md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
        </div>
        <nav className={`${menuOpen ? 'flex' : 'hidden'} flex-col gap-3 md:flex md:flex-row md:flex-wrap`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-green-600 text-white' : 'text-slate-200 hover:bg-slate-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
