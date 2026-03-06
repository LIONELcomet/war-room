/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Overview } from './pages/Overview';
import { ThreatMonitor } from './pages/ThreatMonitor';
import { WarMapPage } from './pages/WarMapPage';
import { TimelinePage } from './pages/TimelinePage';
import { ResponsePage } from './pages/ResponsePage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import './styles/platform.css';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-[#07070D] text-white overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 relative z-10">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/threat-monitor" element={<ThreatMonitor />} />
              <Route path="/war-map" element={<WarMapPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/response" element={<ResponsePage />} />
              <Route path="/health" element={<SystemHealthPage />} />
              <Route path="*" element={<div className="text-center mt-20 text-gray-500">Module Offline</div>} />
            </Routes>
          </main>
        </div>

        {/* Global Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(123, 63, 228, 0.2) 0%, rgba(7, 7, 13, 1) 100%)',
          }}
        />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(160, 102, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(160, 102, 255, 0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>
    </Router>
  );
}
