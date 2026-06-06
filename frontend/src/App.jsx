import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Monitor from './pages/Monitor.jsx';
import WasteScan from './pages/WasteScan.jsx';
import ThreatMonitor from './pages/ThreatMonitor.jsx';
import CityDetail from './pages/CityDetail.jsx';

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a] text-white">
      <Navbar />
      <main className="flex-1 px-4 py-6 md:px-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/city/:cityname" element={<CityDetail />} />
          <Route path="/waste-scan" element={<WasteScan />} />
          <Route path="/threat-monitor" element={<ThreatMonitor />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-700 bg-[#1e293b] px-4 py-5 text-center text-sm font-medium text-green-300 shadow-inner">
        EcoSense AI 2026
      </footer>
    </div>
  );
}

export default App;
